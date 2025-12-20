// User types
export interface User {
  id: number;
  email: string;
  zepp_email: string;
  zepp_password_encrypted: string;
  app_token?: string;
  user_id?: string;
  created_at: Date;
  updated_at: Date;
}

// Zepp API Response types
export interface ZeppAuthResponse {
  token_info: {
    app_token: string;
    user_id: string;
    login_token: string;
  };
}

export interface DailySummary {
  id?: number;
  user_id: number;
  date: string;
  steps: number;
  distance: number;
  calories: number;
  sleep_start?: string;
  sleep_end?: string;
  sleep_duration?: number;
  deep_sleep?: number;
  light_sleep?: number;
  rem_sleep?: number;
  awake_time?: number;
  heart_rate_avg?: number;
  heart_rate_max?: number;
  heart_rate_min?: number;
  hrv_avg?: number;
  created_at?: Date;
}

export interface HeartRateReading {
  id?: number;
  user_id: number;
  timestamp: Date;
  heart_rate: number;
  created_at?: Date;
}

export interface StressReading {
  id?: number;
  user_id: number;
  timestamp: Date;
  stress_level: number;
  created_at?: Date;
}

export interface SpO2Reading {
  id?: number;
  user_id: number;
  timestamp: Date;
  spo2_value: number;
  created_at?: Date;
}

export interface PAIScore {
  id?: number;
  user_id: number;
  date: string;
  pai_score: number;
  created_at?: Date;
}

export interface Workout {
  id?: number;
  user_id: number;
  zepp_track_id: string;
  type: string;
  start_time: Date;
  end_time: Date;
  duration: number;
  distance?: number;
  calories?: number;
  avg_heart_rate?: number;
  max_heart_rate?: number;
  avg_pace?: number;
  gps_data?: any;
  created_at?: Date;
}

// Notification types
export interface Notification {
  id?: number;
  user_id: number;
  type: 'hr_high' | 'hr_low' | 'spo2_low' | 'stress_high' | 'ai_insight' | 'goal_achieved';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  read: boolean;
  created_at?: Date;
}

// AI Analysis types
export interface AIAnalysisRequest {
  user_id: number;
  analysis_type: 'daily' | 'weekly' | 'monthly' | 'custom' | 'chat';
  date_from?: string;
  date_to?: string;
  question?: string;
}

export interface AIAnalysisResponse {
  summary: string;
  insights: string[];
  recommendations: string[];
  alerts?: string[];
  confidence_score?: number;
}

export interface HealthContext {
  user_demographics?: {
    age?: number;
    gender?: string;
    height?: number;
    weight?: number;
  };
  daily_summaries: DailySummary[];
  heart_rate_data: HeartRateReading[];
  stress_data: StressReading[];
  spo2_data: SpO2Reading[];
  pai_scores: PAIScore[];
  workouts: Workout[];
  date_range: {
    from: string;
    to: string;
  };
}

// Express request extension
import { Request } from 'express';
export type AuthRequest = Request;

