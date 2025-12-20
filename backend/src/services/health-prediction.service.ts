import { OpenAIClient } from '../api/openai-client';
import { query } from '../db';
import { NotificationService } from './notification.service';

export class HealthPredictionService {
  private openaiClient: OpenAIClient;
  private notificationService: NotificationService;

  constructor() {
    this.openaiClient = new OpenAIClient();
    this.notificationService = new NotificationService();
  }

  /**
   * Generar predicciones de salud basadas en datos históricos
   */
  async generateHealthPredictions(userId: number): Promise<any> {
    // Obtener datos históricos
    const healthData = await this.getHealthDataForPrediction(userId);

    // Obtener check-ins recientes
    const checkIns = await query(
      `SELECT * FROM daily_checkins
       WHERE user_id = $1
       ORDER BY date DESC LIMIT 7`,
      [userId]
    );

    // Generar predicción con IA
    const prediction = await this.analyzePrediction(userId, healthData, checkIns.rows);

    // Guardar predicción en base de datos
    await this.savePrediction(userId, prediction);

    // Si hay alto riesgo, crear notificación
    if (prediction.risk_level === 'high') {
      await this.notificationService.createNotification({
        user_id: userId,
        type: 'ai_insight',
        title: 'Alerta de Salud',
        message: `Se detectó un riesgo elevado de ${prediction.prediction_type}. Revisa las recomendaciones.`,
        severity: 'warning',
        read: false,
      });
    }

    return prediction;
  }

  /**
   * Obtener datos de salud para predicción
   */
  private async getHealthDataForPrediction(userId: number) {
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Resúmenes diarios
    const summaries = await query(
      `SELECT * FROM daily_summaries
       WHERE user_id = $1 AND date >= $2
       ORDER BY date DESC`,
      [userId, thirtyDaysAgo]
    );

    // HR promedio por día
    const hrTrends = await query(
      `SELECT DATE(timestamp) as date,
              AVG(heart_rate) as avg_hr,
              MAX(heart_rate) as max_hr,
              MIN(heart_rate) as min_hr
       FROM heart_rate_readings
       WHERE user_id = $1 AND timestamp >= $2
       GROUP BY DATE(timestamp)
       ORDER BY date DESC`,
      [userId, `${thirtyDaysAgo} 00:00:00`]
    );

    // Tendencias de estrés
    const stressTrends = await query(
      `SELECT DATE(timestamp) as date, AVG(stress_level) as avg_stress
       FROM stress_readings
       WHERE user_id = $1 AND timestamp >= $2
       GROUP BY DATE(timestamp)
       ORDER BY date DESC`,
      [userId, `${thirtyDaysAgo} 00:00:00`]
    );

    // SpO2 tendencias
    const spo2Trends = await query(
      `SELECT DATE(timestamp) as date, AVG(spo2_value) as avg_spo2, MIN(spo2_value) as min_spo2
       FROM spo2_readings
       WHERE user_id = $1 AND timestamp >= $2
       GROUP BY DATE(timestamp)
       ORDER BY date DESC`,
      [userId, `${thirtyDaysAgo} 00:00:00`]
    );

    // Workouts frequency
    const workouts = await query(
      `SELECT * FROM workouts
       WHERE user_id = $1 AND start_time >= $2
       ORDER BY start_time DESC`,
      [userId, `${thirtyDaysAgo} 00:00:00`]
    );

    return {
      summaries: summaries.rows,
      hrTrends: hrTrends.rows,
      stressTrends: stressTrends.rows,
      spo2Trends: spo2Trends.rows,
      workouts: workouts.rows,
    };
  }

  /**
   * Analizar y generar predicción con IA
   */
  private async analyzePrediction(userId: number, healthData: any, checkIns: any[]) {
    const prompt = this.buildPredictionPrompt(healthData, checkIns);

    const completion = await this.openaiClient['client'].chat.completions.create({
      model: this.openaiClient['model'],
      messages: [
        {
          role: 'system',
          content: `Eres un asistente médico de IA especializado en predicción de salud.
Analiza los datos de salud del usuario y genera predicciones sobre posibles riesgos.

Responde SIEMPRE en este formato JSON exacto:
{
  "prediction_type": "enfermedad_respiratoria|cardiovascular|fatiga_cronica|sobreentrenamiento|deficit_sueno",
  "risk_level": "low|medium|high",
  "confidence_score": 0-100,
  "factors": ["factor 1", "factor 2"],
  "recommendations": ["recomendación 1", "recomendación 2"],
  "warning_signs": ["señal 1", "señal 2"]
}`
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
    });

    const response = completion.choices[0].message.content || '{}';

    try {
      return JSON.parse(response);
    } catch (error) {
      // Fallback si la IA no responde en JSON
      return {
        prediction_type: 'general_health',
        risk_level: 'low',
        confidence_score: 50,
        factors: ['Datos insuficientes'],
        recommendations: ['Continúa monitoreando tus métricas de salud'],
        warning_signs: []
      };
    }
  }

  /**
   * Construir prompt para predicción
   */
  private buildPredictionPrompt(healthData: any, checkIns: any[]): string {
    let prompt = 'Analiza los siguientes datos de salud de los últimos 30 días:\n\n';

    // Resumen de métricas
    if (healthData.summaries.length > 0) {
      const avgSteps = healthData.summaries.reduce((sum: number, s: any) => sum + (s.steps || 0), 0) / healthData.summaries.length;
      const avgSleep = healthData.summaries.reduce((sum: number, s: any) => sum + (s.sleep_duration || 0), 0) / healthData.summaries.length;

      prompt += `ACTIVIDAD:\n`;
      prompt += `- Pasos promedio: ${Math.round(avgSteps)}\n`;
      prompt += `- Sueño promedio: ${Math.round(avgSleep / 60)}h ${avgSleep % 60}m\n`;
      prompt += `- Días con datos: ${healthData.summaries.length}\n\n`;
    }

    // HR tendencias
    if (healthData.hrTrends.length > 0) {
      const avgHR = healthData.hrTrends.reduce((sum: number, h: any) => sum + parseFloat(h.avg_hr || 0), 0) / healthData.hrTrends.length;
      const maxHR = Math.max(...healthData.hrTrends.map((h: any) => parseInt(h.max_hr || 0)));

      prompt += `FRECUENCIA CARDÍACA:\n`;
      prompt += `- Promedio: ${Math.round(avgHR)} bpm\n`;
      prompt += `- Máxima registrada: ${maxHR} bpm\n\n`;
    }

    // Estrés
    if (healthData.stressTrends.length > 0) {
      const avgStress = healthData.stressTrends.reduce((sum: number, s: any) => sum + parseFloat(s.avg_stress || 0), 0) / healthData.stressTrends.length;
      prompt += `ESTRÉS:\n- Nivel promedio: ${Math.round(avgStress)}\n\n`;
    }

    // SpO2
    if (healthData.spo2Trends.length > 0) {
      const avgSpO2 = healthData.spo2Trends.reduce((sum: number, s: any) => sum + parseFloat(s.avg_spo2 || 0), 0) / healthData.spo2Trends.length;
      const minSpO2 = Math.min(...healthData.spo2Trends.map((s: any) => parseInt(s.min_spo2 || 100)));

      prompt += `OXIGENACIÓN:\n`;
      prompt += `- SpO2 promedio: ${Math.round(avgSpO2)}%\n`;
      prompt += `- SpO2 mínimo: ${minSpO2}%\n\n`;
    }

    // Workouts
    prompt += `EJERCICIO:\n- Entrenamientos en 30 días: ${healthData.workouts.length}\n\n`;

    // Check-ins subjetivos
    if (checkIns.length > 0) {
      prompt += `CHECK-INS DIARIOS (últimos 7 días):\n`;
      checkIns.forEach((c: any) => {
        prompt += `- ${c.date}: Sueño=${c.sleep_quality}/5, Energía=${c.energy_level}/5, Ánimo=${c.mood}/5, Estrés=${c.stress_level}/5\n`;
      });
    }

    prompt += `\nBasándote en estos datos, identifica el riesgo de salud más probable y proporciona recomendaciones.`;

    return prompt;
  }

  /**
   * Guardar predicción en base de datos
   */
  private async savePrediction(userId: number, prediction: any) {
    const today = new Date().toISOString().split('T')[0];

    await query(
      `INSERT INTO health_predictions
       (user_id, prediction_date, prediction_type, risk_level, confidence_score, factors, recommendations)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        userId,
        today,
        prediction.prediction_type,
        prediction.risk_level,
        prediction.confidence_score,
        JSON.stringify(prediction.factors || []),
        JSON.stringify(prediction.recommendations || []),
      ]
    );
  }

  /**
   * Obtener predicciones del usuario
   */
  async getUserPredictions(userId: number, limit: number = 10) {
    const result = await query(
      `SELECT * FROM health_predictions
       WHERE user_id = $1
       ORDER BY prediction_date DESC
       LIMIT $2`,
      [userId, limit]
    );

    return result.rows;
  }
}
