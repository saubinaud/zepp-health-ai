import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';
import { ZeppAuthResponse } from '../types';

export class ZeppClient {
  private axiosInstance: AxiosInstance;
  private appToken?: string;
  private userId?: string;

  constructor() {
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
    try {
      const response = await this.axiosInstance.get(
        'https://api-mifit-de2.huami.com/v1/data/band_data.json',
        {
          headers: this.getAuthHeaders(),
          params: {
            query_type: queryType,
            from_date: fromDate,
            to_date: toDate,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error fetching band data:', error.message);
      throw new Error(`Failed to fetch band data: ${error.message}`);
    }
  }

  /**
   * Get workout history
   */
  async getWorkoutHistory() {
    try {
      const response = await this.axiosInstance.get(
        'https://api-mifit-de2.huami.com/v1/sport/run/history.json',
        {
          headers: this.getAuthHeaders(),
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error fetching workout history:', error.message);
      throw new Error(`Failed to fetch workout history: ${error.message}`);
    }
  }

  /**
   * Get workout detail with GPS data
   */
  async getWorkoutDetail(trackId: string, source: string) {
    try {
      const response = await this.axiosInstance.get(
        'https://api-mifit-de2.huami.com/v1/sport/run/detail.json',
        {
          headers: this.getAuthHeaders(),
          params: {
            trackid: trackId,
            source: source,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error fetching workout detail:', error.message);
      throw new Error(`Failed to fetch workout detail: ${error.message}`);
    }
  }

  /**
   * Get stress data
   */
  async getStressData(fromDate: string, toDate: string) {
    if (!this.userId) {
      throw new Error('User ID not set');
    }

    try {
      const response = await this.axiosInstance.get(
        `https://api-mifit-de2.huami.com/users/${this.userId}/healthStress`,
        {
          headers: this.getAuthHeaders(),
          params: {
            from: fromDate,
            to: toDate,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error fetching stress data:', error.message);
      throw new Error(`Failed to fetch stress data: ${error.message}`);
    }
  }

  /**
   * Get SpO2 data
   */
  async getSpO2Data(fromDate: string, toDate: string) {
    if (!this.userId) {
      throw new Error('User ID not set');
    }

    try {
      const response = await this.axiosInstance.get(
        `https://api-mifit-de2.huami.com/users/${this.userId}/spo2`,
        {
          headers: this.getAuthHeaders(),
          params: {
            from: fromDate,
            to: toDate,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error fetching SpO2 data:', error.message);
      throw new Error(`Failed to fetch SpO2 data: ${error.message}`);
    }
  }

  /**
   * Get PAI score data
   */
  async getPAIData(fromDate: string, toDate: string) {
    if (!this.userId) {
      throw new Error('User ID not set');
    }

    try {
      const response = await this.axiosInstance.get(
        `https://api-mifit-de2.huami.com/users/${this.userId}/pai`,
        {
          headers: this.getAuthHeaders(),
          params: {
            from: fromDate,
            to: toDate,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error fetching PAI data:', error.message);
      throw new Error(`Failed to fetch PAI data: ${error.message}`);
    }
  }
}
