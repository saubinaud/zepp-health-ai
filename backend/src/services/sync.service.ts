import { ZeppClient } from '../api/zepp-client';
import { DecoderService } from './decoder.service';
import { query } from '../db';
import { DailySummary, HeartRateReading, StressReading, SpO2Reading, PAIScore, Workout } from '../types';

export class SyncService {
  private zeppClient: ZeppClient;

  constructor(appToken: string, userId: string) {
    this.zeppClient = new ZeppClient();
    this.zeppClient.setCredentials(appToken, userId);
  }

  /**
   * Sync all data for a date range
   */
  async syncAllData(
    userId: number,
    fromDate: string,
    toDate: string
  ): Promise<{
    success: boolean;
    recordsSynced: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let recordsSynced = 0;

    try {
      // Log sync start
      await this.logSyncStart(userId, 'full_sync', fromDate, toDate);

      // Sync band data (steps, sleep, HR summary)
      try {
        const bandRecords = await this.syncBandData(userId, fromDate, toDate);
        recordsSynced += bandRecords;
      } catch (error: any) {
        errors.push(`Band data sync failed: ${error.message}`);
      }

      // Sync detailed heart rate data
      try {
        const hrRecords = await this.syncHeartRateDetail(userId, fromDate, toDate);
        recordsSynced += hrRecords;
      } catch (error: any) {
        errors.push(`Heart rate detail sync failed: ${error.message}`);
      }

      // Sync stress data
      try {
        const stressRecords = await this.syncStressData(userId, fromDate, toDate);
        recordsSynced += stressRecords;
      } catch (error: any) {
        errors.push(`Stress data sync failed: ${error.message}`);
      }

      // Sync SpO2 data
      try {
        const spo2Records = await this.syncSpO2Data(userId, fromDate, toDate);
        recordsSynced += spo2Records;
      } catch (error: any) {
        errors.push(`SpO2 data sync failed: ${error.message}`);
      }

      // Sync PAI data
      try {
        const paiRecords = await this.syncPAIData(userId, fromDate, toDate);
        recordsSynced += paiRecords;
      } catch (error: any) {
        errors.push(`PAI data sync failed: ${error.message}`);
      }

      // Sync workouts
      try {
        const workoutRecords = await this.syncWorkouts(userId);
        recordsSynced += workoutRecords;
      } catch (error: any) {
        errors.push(`Workout sync failed: ${error.message}`);
      }

      // Update last sync time
      await query(
        'UPDATE users SET last_sync = CURRENT_TIMESTAMP WHERE id = $1',
        [userId]
      );

      // Log sync completion
      await this.logSyncComplete(
        userId,
        'full_sync',
        fromDate,
        toDate,
        recordsSynced,
        errors.length > 0 ? errors.join('; ') : null
      );

      return {
        success: errors.length === 0,
        recordsSynced,
        errors,
      };
    } catch (error: any) {
      await this.logSyncComplete(
        userId,
        'full_sync',
        fromDate,
        toDate,
        recordsSynced,
        error.message
      );
      throw error;
    }
  }

  /**
   * Sync band data (daily summaries)
   */
  private async syncBandData(
    userId: number,
    fromDate: string,
    toDate: string
  ): Promise<number> {
    const bandData = await this.zeppClient.getBandData(fromDate, toDate, 'summary');

    if (!bandData || !bandData.data) {
      return 0;
    }

    let recordCount = 0;

    for (const dayData of bandData.data) {
      try {
        // Decode base64 summary
        const summary = DecoderService.decodeSummary(dayData.summary);

        // Parse different data types
        const activityData = DecoderService.parseActivityData(summary);
        const sleepData = DecoderService.parseSleepData(summary);
        const hrData = DecoderService.parseHeartRateSummary(summary);

        // Insert or update daily summary
        await query(
          `INSERT INTO daily_summaries (
            user_id, date, steps, distance, calories,
            sleep_start, sleep_end, sleep_duration,
            deep_sleep, light_sleep, rem_sleep, awake_time,
            heart_rate_avg, heart_rate_max, heart_rate_min, hrv_avg
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
          ON CONFLICT (user_id, date)
          DO UPDATE SET
            steps = EXCLUDED.steps,
            distance = EXCLUDED.distance,
            calories = EXCLUDED.calories,
            sleep_start = EXCLUDED.sleep_start,
            sleep_end = EXCLUDED.sleep_end,
            sleep_duration = EXCLUDED.sleep_duration,
            deep_sleep = EXCLUDED.deep_sleep,
            light_sleep = EXCLUDED.light_sleep,
            rem_sleep = EXCLUDED.rem_sleep,
            awake_time = EXCLUDED.awake_time,
            heart_rate_avg = EXCLUDED.heart_rate_avg,
            heart_rate_max = EXCLUDED.heart_rate_max,
            heart_rate_min = EXCLUDED.heart_rate_min,
            hrv_avg = EXCLUDED.hrv_avg`,
          [
            userId,
            dayData.date_time,
            activityData.steps || 0,
            activityData.distance || 0,
            activityData.calories || 0,
            sleepData.sleepStart || null,
            sleepData.sleepEnd || null,
            sleepData.sleepDuration || null,
            sleepData.deepSleep || null,
            sleepData.lightSleep || null,
            sleepData.remSleep || null,
            sleepData.awakeTime || null,
            hrData.hrAvg || null,
            hrData.hrMax || null,
            hrData.hrMin || null,
            hrData.hrvAvg || null,
          ]
        );

        recordCount++;
      } catch (error) {
        console.error(`Error processing day ${dayData.date_time}:`, error);
      }
    }

    return recordCount;
  }

  /**
   * Sync detailed heart rate data (per minute)
   */
  private async syncHeartRateDetail(
    userId: number,
    fromDate: string,
    toDate: string
  ): Promise<number> {
    const bandData = await this.zeppClient.getBandData(fromDate, toDate, 'detail');

    if (!bandData || !bandData.data) {
      return 0;
    }

    let recordCount = 0;

    for (const dayData of bandData.data) {
      try {
        if (!dayData.data_hr) continue;

        // Parse date and decode HR data
        const startDate = new Date(dayData.date_time);
        const hrReadings = DecoderService.decodeHeartRateData(dayData.data_hr, startDate);

        // Batch insert heart rate readings
        for (const reading of hrReadings) {
          await query(
            `INSERT INTO heart_rate_readings (user_id, timestamp, heart_rate)
             VALUES ($1, $2, $3)
             ON CONFLICT (user_id, timestamp) DO UPDATE SET heart_rate = EXCLUDED.heart_rate`,
            [userId, reading.timestamp, reading.heartRate]
          );
          recordCount++;
        }
      } catch (error) {
        console.error(`Error processing HR detail for ${dayData.date_time}:`, error);
      }
    }

    return recordCount;
  }

  /**
   * Sync stress data
   */
  private async syncStressData(
    userId: number,
    fromDate: string,
    toDate: string
  ): Promise<number> {
    const stressData = await this.zeppClient.getStressData(fromDate, toDate);
    const stressReadings = DecoderService.parseStressData(stressData);

    let recordCount = 0;

    for (const reading of stressReadings) {
      await query(
        `INSERT INTO stress_readings (user_id, timestamp, stress_level)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, timestamp) DO UPDATE SET stress_level = EXCLUDED.stress_level`,
        [userId, reading.timestamp, reading.stressLevel]
      );
      recordCount++;
    }

    return recordCount;
  }

  /**
   * Sync SpO2 data
   */
  private async syncSpO2Data(
    userId: number,
    fromDate: string,
    toDate: string
  ): Promise<number> {
    const spo2Data = await this.zeppClient.getSpO2Data(fromDate, toDate);
    const spo2Readings = DecoderService.parseSpO2Data(spo2Data);

    let recordCount = 0;

    for (const reading of spo2Readings) {
      await query(
        `INSERT INTO spo2_readings (user_id, timestamp, spo2_value)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, timestamp) DO UPDATE SET spo2_value = EXCLUDED.spo2_value`,
        [userId, reading.timestamp, reading.spo2Value]
      );
      recordCount++;
    }

    return recordCount;
  }

  /**
   * Sync PAI data
   */
  private async syncPAIData(
    userId: number,
    fromDate: string,
    toDate: string
  ): Promise<number> {
    const paiData = await this.zeppClient.getPAIData(fromDate, toDate);
    const paiScores = DecoderService.parsePAIData(paiData);

    let recordCount = 0;

    for (const score of paiScores) {
      await query(
        `INSERT INTO pai_scores (user_id, date, pai_score)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, date) DO UPDATE SET pai_score = EXCLUDED.pai_score`,
        [userId, score.date, score.paiScore]
      );
      recordCount++;
    }

    return recordCount;
  }

  /**
   * Sync workouts
   */
  private async syncWorkouts(userId: number): Promise<number> {
    const workoutHistory = await this.zeppClient.getWorkoutHistory();
    const workouts = DecoderService.parseWorkoutData(workoutHistory);

    let recordCount = 0;

    for (const workout of workouts) {
      await query(
        `INSERT INTO workouts (
          user_id, zepp_track_id, type, start_time, end_time,
          duration, distance, calories, avg_heart_rate, max_heart_rate
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (user_id, zepp_track_id) DO UPDATE SET
          type = EXCLUDED.type,
          start_time = EXCLUDED.start_time,
          end_time = EXCLUDED.end_time,
          duration = EXCLUDED.duration,
          distance = EXCLUDED.distance,
          calories = EXCLUDED.calories,
          avg_heart_rate = EXCLUDED.avg_heart_rate,
          max_heart_rate = EXCLUDED.max_heart_rate`,
        [
          userId,
          workout.trackId,
          workout.type,
          workout.startTime,
          workout.endTime,
          workout.duration,
          workout.distance || null,
          workout.calories || null,
          workout.avgHeartRate || null,
          workout.maxHeartRate || null,
        ]
      );
      recordCount++;
    }

    return recordCount;
  }

  /**
   * Log sync start
   */
  private async logSyncStart(
    userId: number,
    syncType: string,
    dateFrom: string,
    dateTo: string
  ): Promise<void> {
    await query(
      `INSERT INTO sync_logs (user_id, sync_type, status, date_from, date_to)
       VALUES ($1, $2, 'started', $3, $4)`,
      [userId, syncType, dateFrom, dateTo]
    );
  }

  /**
   * Log sync completion
   */
  private async logSyncComplete(
    userId: number,
    syncType: string,
    dateFrom: string,
    dateTo: string,
    recordsSynced: number,
    errorMessage: string | null
  ): Promise<void> {
    await query(
      `INSERT INTO sync_logs (user_id, sync_type, status, date_from, date_to, records_synced, error_message)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        userId,
        syncType,
        errorMessage ? 'failed' : 'completed',
        dateFrom,
        dateTo,
        recordsSynced,
        errorMessage,
      ]
    );
  }
}
