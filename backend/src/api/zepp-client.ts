import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import crypto from 'crypto';
import { ZeppAuthResponse } from '../types';

const API_REGIONS = [
  'api-mifit-de2.huami.com', // Europe
  'api-mifit-us2.huami.com', // USA
  'api-mifit.huami.com',     // Asia/Global
  'api-mifit-ru.huami.com',  // Russia
];

export class ZeppClient {
  private axiosInstance: AxiosInstance;
  private appToken?: string;
  private userId?: string;
  private apiBaseUrl: string;

  constructor() {
    this.apiBaseUrl = process.env.ZEPP_API_BASE_URL || 'api-mifit-de2.huami.com';
    this.axiosInstance = axios.create({
      timeout: 30000,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }

  /**
   * Generate MD5 hash of email for device_id
   */
  private generateDeviceId(email: string): string {
    return crypto.createHash('md5').update(email).digest('hex');
  }

  /**
   * Make a request with retry logic
   */
  private async makeRequest<T>(config: AxiosRequestConfig, retries = 3): Promise<T> {
    try {
      const response = await this.axiosInstance.request<T>(config);
      return response.data;
    } catch (error: any) {
      if (retries > 0 && error.code !== 'ECONNABORTED' && (!error.response || error.response.status >= 500)) {
        console.warn(`Request failed, retrying (${retries} attempts left)...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries))); // Exponential backoff
        return this.makeRequest<T>(config, retries - 1);
      }
      throw error;
    }
  }

  /**
   * Probe regions to find the correct one
   */
  private async probeRegions(email: string, accessToken: string): Promise<string> {
    console.log('Probing Zepp API regions...');
    const deviceId = this.generateDeviceId(email);

    for (const region of API_REGIONS) {
      try {
        console.log(`Trying region: ${region}`);
        await this.axiosInstance.post<ZeppAuthResponse>(
          `https://account.huami.com/v2/client/login`,
          new URLSearchParams({
            app_name: 'com.xiaomi.hm.health',
            app_version: '6.3.5',
            code: accessToken,
            country_code: 'ES', // This might need to be dynamic too, but usually ES works for login
            device_id: deviceId,
            device_model: 'web',
            grant_type: 'access_token',
            third_name: 'huami',
          })
        );
        // If login technically succeeds (even if we don't use the result here), the region is likely valid for auth
        // However, for data fetching, we need to check if we can reach the data endpoints.
        // The implemented logic below in authenticate() actually sets the appToken.
        // Here we just want to find which data API url works?
        // Actually, the login endpoint is strictly `account.huami.com`.
        // The *data* endpoint is what changes.
        // So we need to authenticate first, THEN see which data endpoint works.
        
        // Let's assume the passed `apiBaseUrl` is for DATA.
        // We will test data endpoints after login.
        return region;
      } catch (e) {
        // Continue
      }
    }
    return this.apiBaseUrl; // Fallback
  }

  /**
   * Step 1: Get access token from Zepp API
   */
  private async getAccessToken(email: string, password: string): Promise<string> {
    try {
      const response = await this.axiosInstance.post(
        `https://api-user.huami.com/registrations/${encodeURIComponent(email)}/tokens`,
        new URLSearchParams({
          client_id: 'HuaMi',
          password: password,
          redirect_uri: 'https://s3-us-west-2.amazonws.com/hm-registration/successs498.html',
          token: 'access',
        }),
        {
          maxRedirects: 0,
          validateStatus: (status) => status === 303 || status === 200,
        }
      );

      // Extract access token from redirect URL
      const location = response.headers.location;
      if (!location) {
        throw new Error('No redirect location found in response');
      }

      const url = new URL(location);
      const accessToken = url.searchParams.get('access');

      if (!accessToken) {
        throw new Error('No access token found in redirect URL');
      }

      return accessToken;
    } catch (error: any) {
      console.error('Error getting access token:', error.message);
      throw new Error(`Failed to get access token: ${error.message}`);
    }
  }

  /**
   * Step 2: Login and get app token
   */
  async authenticate(email: string, password: string): Promise<{ appToken: string; userId: string }> {
    try {
      // Step 1: Get access token
      const accessToken = await this.getAccessToken(email, password);

      // Step 2: Exchange for app token
      const deviceId = this.generateDeviceId(email);

      const response = await this.axiosInstance.post<ZeppAuthResponse>(
        'https://account.huami.com/v2/client/login',
        new URLSearchParams({
          app_name: 'com.xiaomi.hm.health',
          app_version: '6.3.5',
          code: accessToken,
          country_code: 'ES',
          device_id: deviceId,
          device_model: 'web',
          grant_type: 'access_token',
          third_name: 'huami',
        })
      );

      if (!response.data.token_info) {
        throw new Error('No token_info in response');
      }

      this.appToken = response.data.token_info.app_token;
      this.userId = response.data.token_info.user_id;

      // Step 3: Probe for correct data region if not forced
      if (!process.env.ZEPP_API_BASE_URL) {
         await this.findWorkingRegion();
      }

      return {
        appToken: this.appToken,
        userId: this.userId,
      };
    } catch (error: any) {
      console.error('Authentication error:', error.response?.data || error.message);
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  /**
   * Find working region by trying to fetch profile/data
   */
  private async findWorkingRegion() {
      console.log('Probing for correct API region...');
      for (const region of API_REGIONS) {
          try {
              // Try a lightweight simple request
              await this.axiosInstance.get(
                  `https://${region}/v1/sport/run/history.json`, // Using history as a probe
                  {
                      headers: this.getAuthHeaders(),
                      params: { size: 1 } // Minimal data
                  }
              );
              console.log(`Region found: ${region}`);
              this.apiBaseUrl = region;
              return;
          } catch (error: any) {
              // If 401/403 maybe our token is bad, but 404 or connection error means wrong region
              // actually 404 could mean wrong region too.
              // We just continue to next region.
              console.log(`Region ${region} failed.`);
          }
      }
      console.warn('Could not automatically determine region, defaulting to ' + this.apiBaseUrl);
  }

  /**
   * Set credentials for authenticated requests
   */
  setCredentials(appToken: string, userId: string) {
    this.appToken = appToken;
    this.userId = userId;
  }

  /**
   * Get authenticated headers
   */
  private getAuthHeaders() {
    if (!this.appToken) {
      throw new Error('Not authenticated. Call authenticate() first.');
    }

    return {
      apptoken: this.appToken,
      appPlatform: 'web',
      appname: 'com.xiaomi.hm.health',
    };
  }

  /**
   * Get band data (steps, sleep, HR summary)
   */
  async getBandData(fromDate: string, toDate: string, queryType: 'summary' | 'detail' = 'summary') {
    return this.makeRequest({
        url: `https://${this.apiBaseUrl}/v1/data/band_data.json`,
        method: 'GET',
        headers: this.getAuthHeaders(),
        params: {
            query_type: queryType,
            from_date: fromDate,
            to_date: toDate,
        },
    });
  }

  /**
   * Get workout history
   */
  async getWorkoutHistory() {
    return this.makeRequest({
        url: `https://${this.apiBaseUrl}/v1/sport/run/history.json`,
        method: 'GET',
        headers: this.getAuthHeaders(),
    });
  }

  /**
   * Get workout detail with GPS data
   */
  async getWorkoutDetail(trackId: string, source: string) {
    return this.makeRequest({
        url: `https://${this.apiBaseUrl}/v1/sport/run/detail.json`,
        method: 'GET',
        headers: this.getAuthHeaders(),
        params: {
            trackid: trackId,
            source: source,
        },
    });
  }

  /**
   * Get stress data
   */
  async getStressData(fromDate: string, toDate: string) {
    if (!this.userId) {
      throw new Error('User ID not set');
    }

    return this.makeRequest({
        url: `https://${this.apiBaseUrl}/users/${this.userId}/healthStress`,
        method: 'GET',
        headers: this.getAuthHeaders(),
        params: {
            from: fromDate,
            to: toDate,
        },
    });
  }

  /**
   * Get SpO2 data
   */
  async getSpO2Data(fromDate: string, toDate: string) {
    if (!this.userId) {
      throw new Error('User ID not set');
    }

    return this.makeRequest({
        url: `https://${this.apiBaseUrl}/users/${this.userId}/spo2`,
        method: 'GET',
        headers: this.getAuthHeaders(),
        params: {
            from: fromDate,
            to: toDate,
        },
    });
  }

  /**
   * Get PAI score data
   */
  async getPAIData(fromDate: string, toDate: string) {
    if (!this.userId) {
      throw new Error('User ID not set');
    }

    return this.makeRequest({
        url: `https://${this.apiBaseUrl}/users/${this.userId}/pai`,
        method: 'GET',
        headers: this.getAuthHeaders(),
        params: {
            from: fromDate,
            to: toDate,
        },
    });
  }
}
