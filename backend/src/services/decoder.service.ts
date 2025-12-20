/**
 * Service to decode binary and base64 data from Zepp API
 */

export class DecoderService {
  /**
   * Decode base64 summary data to JSON
   */
  static decodeSummary(base64Summary: string): any {
    try {
      const jsonString = Buffer.from(base64Summary, 'base64').toString('utf8');
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Error decoding summary:', error);
      throw new Error('Failed to decode summary data');
    }
  }

  /**
   * Decode heart rate binary data (2880 bytes = 1440 values, one per minute)
   * Each value is a 2-byte big-endian short
   * Values 254 and 255 are special (no reading)
   */
  static decodeHeartRateData(
    base64Data: string,
    startDate: Date
  ): Array<{ timestamp: Date; heartRate: number }> {
    try {
      const buffer = Buffer.from(base64Data, 'base64');
      const heartRateReadings: Array<{ timestamp: Date; heartRate: number }> = [];

      // Each 2 bytes is one heart rate value
      for (let i = 0; i < buffer.length; i += 2) {
        const hr = buffer.readUInt16BE(i);

        // Skip invalid readings (254 and 255 are special values)
        if (hr < 254 && hr > 0) {
          const minuteOffset = i / 2;
          const timestamp = new Date(startDate.getTime() + minuteOffset * 60 * 1000);

          heartRateReadings.push({
            timestamp,
            heartRate: hr,
          });
        }
      }

      return heartRateReadings;
    } catch (error) {
      console.error('Error decoding heart rate data:', error);
      throw new Error('Failed to decode heart rate data');
    }
  }

  /**
   * Parse sleep data from summary
   */
  static parseSleepData(summary: any): {
    sleepStart?: Date;
    sleepEnd?: Date;
    sleepDuration?: number;
    deepSleep?: number;
    lightSleep?: number;
    remSleep?: number;
    awakeTime?: number;
  } {
    try {
      if (!summary || !summary.slp) {
        return {};
      }

      const sleep = summary.slp;

      return {
        sleepStart: sleep.st ? new Date(sleep.st * 1000) : undefined,
        sleepEnd: sleep.ed ? new Date(sleep.ed * 1000) : undefined,
        sleepDuration: sleep.tt || 0, // Total time in minutes
        deepSleep: sleep.dp || 0, // Deep sleep in minutes
        lightSleep: sleep.lt || 0, // Light sleep in minutes
        remSleep: sleep.rm || 0, // REM sleep in minutes
        awakeTime: sleep.wk || 0, // Awake time in minutes
      };
    } catch (error) {
      console.error('Error parsing sleep data:', error);
      return {};
    }
  }

  /**
   * Parse step and activity data from summary
   */
  static parseActivityData(summary: any): {
    steps?: number;
    distance?: number;
    calories?: number;
  } {
    try {
      if (!summary) {
        return {};
      }

      return {
        steps: summary.ttl || summary.steps || 0,
        distance: summary.dis || 0, // Distance in meters
        calories: summary.cal || 0,
      };
    } catch (error) {
      console.error('Error parsing activity data:', error);
      return {};
    }
  }

  /**
   * Parse heart rate summary data
   */
  static parseHeartRateSummary(summary: any): {
    hrAvg?: number;
    hrMax?: number;
    hrMin?: number;
    hrvAvg?: number;
  } {
    try {
      if (!summary || !summary.hr) {
        return {};
      }

      const hr = summary.hr;

      return {
        hrAvg: hr.avg || undefined,
        hrMax: hr.max || undefined,
        hrMin: hr.min || undefined,
        hrvAvg: hr.hrv || undefined,
      };
    } catch (error) {
      console.error('Error parsing heart rate summary:', error);
      return {};
    }
  }

  /**
   * Parse stress data from API response
   */
  static parseStressData(
    stressResponse: any
  ): Array<{ timestamp: Date; stressLevel: number }> {
    try {
      if (!stressResponse || !stressResponse.data) {
        return [];
      }

      return stressResponse.data.map((item: any) => ({
        timestamp: new Date(item.timestamp * 1000),
        stressLevel: item.value,
      }));
    } catch (error) {
      console.error('Error parsing stress data:', error);
      return [];
    }
  }

  /**
   * Parse SpO2 data from API response
   */
  static parseSpO2Data(
    spo2Response: any
  ): Array<{ timestamp: Date; spo2Value: number }> {
    try {
      if (!spo2Response || !spo2Response.data) {
        return [];
      }

      return spo2Response.data.map((item: any) => ({
        timestamp: new Date(item.timestamp * 1000),
        spo2Value: item.value,
      }));
    } catch (error) {
      console.error('Error parsing SpO2 data:', error);
      return [];
    }
  }

  /**
   * Parse PAI data from API response
   */
  static parsePAIData(
    paiResponse: any
  ): Array<{ date: string; paiScore: number }> {
    try {
      if (!paiResponse || !paiResponse.data) {
        return [];
      }

      return paiResponse.data.map((item: any) => ({
        date: item.date,
        paiScore: item.pai,
      }));
    } catch (error) {
      console.error('Error parsing PAI data:', error);
      return [];
    }
  }

  /**
   * Parse workout data from API response
   */
  static parseWorkoutData(workoutResponse: any): Array<{
    trackId: string;
    type: string;
    startTime: Date;
    endTime: Date;
    duration: number;
    distance?: number;
    calories?: number;
    avgHeartRate?: number;
    maxHeartRate?: number;
    source?: string;
  }> {
    try {
      if (!workoutResponse || !workoutResponse.data) {
        return [];
      }

      return workoutResponse.data.map((item: any) => ({
        trackId: item.trackid,
        type: item.type || 'unknown',
        startTime: new Date(item.start * 1000),
        endTime: new Date(item.end * 1000),
        duration: item.time || 0, // Duration in seconds
        distance: item.dis || undefined, // Distance in meters
        calories: item.cal || undefined,
        avgHeartRate: item.avg_hr || undefined,
        maxHeartRate: item.max_hr || undefined,
        source: item.source || undefined,
      }));
    } catch (error) {
      console.error('Error parsing workout data:', error);
      return [];
    }
  }
}
