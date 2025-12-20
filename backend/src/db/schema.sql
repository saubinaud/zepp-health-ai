-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    zepp_email VARCHAR(255) NOT NULL,
    zepp_password_encrypted TEXT NOT NULL,
    app_token TEXT,
    user_id VARCHAR(255),
    openai_api_key TEXT,
    last_sync TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Daily summaries table
CREATE TABLE IF NOT EXISTS daily_summaries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    steps INTEGER DEFAULT 0,
    distance FLOAT DEFAULT 0,
    calories INTEGER DEFAULT 0,
    sleep_start TIMESTAMP,
    sleep_end TIMESTAMP,
    sleep_duration INTEGER,
    deep_sleep INTEGER,
    light_sleep INTEGER,
    rem_sleep INTEGER,
    awake_time INTEGER,
    heart_rate_avg INTEGER,
    heart_rate_max INTEGER,
    heart_rate_min INTEGER,
    hrv_avg FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, date)
);

-- Heart rate readings (per minute granularity)
CREATE TABLE IF NOT EXISTS heart_rate_readings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    timestamp TIMESTAMP NOT NULL,
    heart_rate INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, timestamp)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_hr_user_timestamp ON heart_rate_readings(user_id, timestamp DESC);

-- Stress readings
CREATE TABLE IF NOT EXISTS stress_readings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    timestamp TIMESTAMP NOT NULL,
    stress_level INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, timestamp)
);

CREATE INDEX IF NOT EXISTS idx_stress_user_timestamp ON stress_readings(user_id, timestamp DESC);

-- SpO2 readings
CREATE TABLE IF NOT EXISTS spo2_readings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    timestamp TIMESTAMP NOT NULL,
    spo2_value INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, timestamp)
);

CREATE INDEX IF NOT EXISTS idx_spo2_user_timestamp ON spo2_readings(user_id, timestamp DESC);

-- PAI scores
CREATE TABLE IF NOT EXISTS pai_scores (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    pai_score INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, date)
);

-- Workouts
CREATE TABLE IF NOT EXISTS workouts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    zepp_track_id VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    duration INTEGER NOT NULL,
    distance FLOAT,
    calories INTEGER,
    avg_heart_rate INTEGER,
    max_heart_rate INTEGER,
    avg_pace FLOAT,
    gps_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, zepp_track_id)
);

CREATE INDEX IF NOT EXISTS idx_workouts_user_start ON workouts(user_id, start_time DESC);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'info',
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);

-- AI Analysis history (to cache and track AI responses)
CREATE TABLE IF NOT EXISTS ai_analysis_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    analysis_type VARCHAR(50) NOT NULL,
    date_from DATE,
    date_to DATE,
    question TEXT,
    response JSONB NOT NULL,
    tokens_used INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ai_analysis_user_created ON ai_analysis_history(user_id, created_at DESC);

-- Sync logs (to track sync operations)
CREATE TABLE IF NOT EXISTS sync_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sync_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    date_from DATE,
    date_to DATE,
    records_synced INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sync_logs_user_created ON sync_logs(user_id, created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for users table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Daily check-ins (estilo Whoop)
CREATE TABLE IF NOT EXISTS daily_checkins (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 5),
    energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
    mood INTEGER CHECK (mood >= 1 AND mood <= 5),
    stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 5),
    alcohol_consumed BOOLEAN DEFAULT FALSE,
    caffeine_intake INTEGER DEFAULT 0,
    hydration_level INTEGER CHECK (hydration_level >= 1 AND hydration_level <= 5),
    muscle_soreness INTEGER CHECK (muscle_soreness >= 0 AND muscle_soreness <= 5),
    illness_symptoms TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_checkins_user_date ON daily_checkins(user_id, date DESC);

-- Health predictions (predicciones de salud)
CREATE TABLE IF NOT EXISTS health_predictions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    prediction_date DATE NOT NULL,
    prediction_type VARCHAR(50) NOT NULL,
    risk_level VARCHAR(20) NOT NULL,
    confidence_score FLOAT,
    factors JSONB,
    recommendations JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_predictions_user_date ON health_predictions(user_id, prediction_date DESC);

-- Workout analysis (análisis detallado de ejercicios)
CREATE TABLE IF NOT EXISTS workout_analysis (
    id SERIAL PRIMARY KEY,
    workout_id INTEGER NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    performance_score FLOAT,
    recovery_needed_hours INTEGER,
    strengths JSONB,
    weaknesses JSONB,
    improvement_suggestions JSONB,
    comparison_to_average JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(workout_id)
);

CREATE INDEX IF NOT EXISTS idx_workout_analysis_user ON workout_analysis(user_id, created_at DESC);

-- Health trends (tendencias de salud)
CREATE TABLE IF NOT EXISTS health_trends (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    metric_name VARCHAR(100) NOT NULL,
    time_period VARCHAR(20) NOT NULL,
    trend_direction VARCHAR(20) NOT NULL,
    change_percentage FLOAT,
    is_concerning BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_trends_user_created ON health_trends(user_id, created_at DESC);

-- Daily questions (preguntas diarias para el usuario)
CREATE TABLE IF NOT EXISTS daily_questions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    question_type VARCHAR(50) NOT NULL,
    question_text TEXT NOT NULL,
    answer TEXT,
    answered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_questions_user_date ON daily_questions(user_id, date DESC);
