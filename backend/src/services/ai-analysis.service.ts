import { OpenAIClient } from '../api/openai-client';
import { query } from '../db';
import { HealthContext, AIAnalysisRequest, AIAnalysisResponse } from '../types';

export class AIAnalysisService {
  private openaiClient: OpenAIClient;

  constructor() {
    this.openaiClient = new OpenAIClient();
  }

  /**
   * Perform AI analysis on user's health data
   */
  async performAnalysis(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    // Fetch health context
    const context = await this.fetchHealthContext(
      request.user_id,
      request.date_from,
      request.date_to
    );

    // Perform AI analysis
    const analysis = await this.openaiClient.analyzeHealthData(
      context,
      request.analysis_type,
      request.question
    );

    // Save analysis to history
    await this.saveAnalysisHistory(request, analysis);

    // Return analysis without tokensUsed
    const { tokensUsed, ...response } = analysis;
    return response;
  }

  /**
   * Fetch comprehensive health context for AI analysis
   */
  private async fetchHealthContext(
    userId: number,
    dateFrom?: string,
    dateTo?: string
  ): Promise<HealthContext> {
    // Default to last 30 days if not specified
    const from = dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const to = dateTo || new Date().toISOString().split('T')[0];

    // Fetch daily summaries
    const dailySummariesResult = await query(
      `SELECT * FROM daily_summaries
       WHERE user_id = $1 AND date BETWEEN $2 AND $3
       ORDER BY date DESC`,
      [userId, from, to]
    );

    // Fetch heart rate data (sample every 15 minutes to reduce data size)
    const heartRateResult = await query(
      `SELECT * FROM heart_rate_readings
       WHERE user_id = $1 AND timestamp BETWEEN $2 AND $3
       AND EXTRACT(MINUTE FROM timestamp) % 15 = 0
       ORDER BY timestamp DESC
       LIMIT 500`,
      [userId, `${from} 00:00:00`, `${to} 23:59:59`]
    );

    // Fetch stress data
    const stressResult = await query(
      `SELECT * FROM stress_readings
       WHERE user_id = $1 AND timestamp BETWEEN $2 AND $3
       ORDER BY timestamp DESC`,
      [userId, `${from} 00:00:00`, `${to} 23:59:59`]
    );

    // Fetch SpO2 data
    const spo2Result = await query(
      `SELECT * FROM spo2_readings
       WHERE user_id = $1 AND timestamp BETWEEN $2 AND $3
       ORDER BY timestamp DESC`,
      [userId, `${from} 00:00:00`, `${to} 23:59:59`]
    );

    // Fetch PAI scores
    const paiResult = await query(
      `SELECT * FROM pai_scores
       WHERE user_id = $1 AND date BETWEEN $2 AND $3
       ORDER BY date DESC`,
      [userId, from, to]
    );

    // Fetch recent workouts
    const workoutsResult = await query(
      `SELECT * FROM workouts
       WHERE user_id = $1 AND start_time BETWEEN $2 AND $3
       ORDER BY start_time DESC
       LIMIT 50`,
      [userId, `${from} 00:00:00`, `${to} 23:59:59`]
    );

    return {
      daily_summaries: dailySummariesResult.rows,
      heart_rate_data: heartRateResult.rows,
      stress_data: stressResult.rows,
      spo2_data: spo2Result.rows,
      pai_scores: paiResult.rows,
      workouts: workoutsResult.rows,
      date_range: { from, to },
    };
  }

  /**
   * Save analysis to history
   */
  private async saveAnalysisHistory(
    request: AIAnalysisRequest,
    analysis: AIAnalysisResponse & { tokensUsed: number }
  ): Promise<void> {
    await query(
      `INSERT INTO ai_analysis_history
       (user_id, analysis_type, date_from, date_to, question, response, tokens_used)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        request.user_id,
        request.analysis_type,
        request.date_from || null,
        request.date_to || null,
        request.question || null,
        JSON.stringify({
          summary: analysis.summary,
          insights: analysis.insights,
          recommendations: analysis.recommendations,
          alerts: analysis.alerts,
          confidence_score: analysis.confidence_score,
        }),
        analysis.tokensUsed,
      ]
    );
  }

  /**
   * Get analysis history for a user
   */
  async getAnalysisHistory(userId: number, limit: number = 10) {
    const result = await query(
      `SELECT id, analysis_type, date_from, date_to, question, response, created_at
       FROM ai_analysis_history
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    return result.rows;
  }
}
