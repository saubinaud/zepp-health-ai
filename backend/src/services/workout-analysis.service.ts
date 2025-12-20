import { OpenAIClient } from '../api/openai-client';
import { query } from '../db';

export class WorkoutAnalysisService {
  private openaiClient: OpenAIClient;

  constructor() {
    this.openaiClient = new OpenAIClient();
  }

  /**
   * Analizar un workout específico con IA
   */
  async analyzeWorkout(userId: number, workoutId: number): Promise<any> {
    // Obtener workout
    const workoutResult = await query(
      'SELECT * FROM workouts WHERE id = $1 AND user_id = $2',
      [workoutId, userId]
    );

    if (workoutResult.rows.length === 0) {
      throw new Error('Workout not found');
    }

    const workout = workoutResult.rows[0];

    // Obtener workouts similares del usuario para comparación
    const similarWorkouts = await query(
      `SELECT * FROM workouts
       WHERE user_id = $1 AND type = $2 AND id != $3
       ORDER BY start_time DESC LIMIT 10`,
      [userId, workout.type, workoutId]
    );

    // Generar análisis con IA
    const analysis = await this.generateWorkoutAnalysis(workout, similarWorkouts.rows);

    // Guardar análisis
    await this.saveWorkoutAnalysis(workoutId, userId, analysis);

    return analysis;
  }

  /**
   * Generar análisis de workout con IA
   */
  private async generateWorkoutAnalysis(workout: any, similarWorkouts: any[]) {
    const prompt = this.buildWorkoutAnalysisPrompt(workout, similarWorkouts);

    const completion = await this.openaiClient['client'].chat.completions.create({
      model: this.openaiClient['model'],
      messages: [
        {
          role: 'system',
          content: `Eres un entrenador deportivo experto en análisis de rendimiento.
Analiza el workout y proporciona feedback específico.

Responde en este formato JSON exacto:
{
  "performance_score": 0-100,
  "recovery_needed_hours": 12-72,
  "strengths": ["fortaleza 1", "fortaleza 2"],
  "weaknesses": ["debilidad 1", "debilidad 2"],
  "improvement_suggestions": [
    {"area": "zona a mejorar", "suggestion": "sugerencia específica"}
  ],
  "comparison_to_average": {
    "duration": "mejor|peor|igual",
    "intensity": "mayor|menor|igual",
    "distance": "más|menos|igual"
  },
  "next_workout_recommendation": "descripción del siguiente entrenamiento ideal"
}`
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.4,
    });

    const response = completion.choices[0].message.content || '{}';

    try {
      return JSON.parse(response);
    } catch (error) {
      return {
        performance_score: 75,
        recovery_needed_hours: 24,
        strengths: ['Completaste el entrenamiento'],
        weaknesses: [],
        improvement_suggestions: [],
        comparison_to_average: {},
        next_workout_recommendation: 'Continúa con tu rutina actual'
      };
    }
  }

  /**
   * Construir prompt para análisis de workout
   */
  private buildWorkoutAnalysisPrompt(workout: any, similarWorkouts: any[]): string {
    let prompt = `Analiza este entrenamiento:\n\n`;

    prompt += `ENTRENAMIENTO ACTUAL:\n`;
    prompt += `- Tipo: ${workout.type}\n`;
    prompt += `- Duración: ${Math.round(workout.duration / 60)} minutos\n`;
    if (workout.distance) prompt += `- Distancia: ${(workout.distance / 1000).toFixed(2)} km\n`;
    if (workout.calories) prompt += `- Calorías: ${workout.calories} kcal\n`;
    if (workout.avg_heart_rate) prompt += `- FC Promedio: ${workout.avg_heart_rate} bpm\n`;
    if (workout.max_heart_rate) prompt += `- FC Máxima: ${workout.max_heart_rate} bpm\n`;
    if (workout.avg_pace) prompt += `- Ritmo Promedio: ${workout.avg_pace} min/km\n`;

    if (similarWorkouts.length > 0) {
      prompt += `\nENTRENAMIENTOS PREVIOS SIMILARES (${similarWorkouts.length}):\n`;

      const avgDuration = similarWorkouts.reduce((sum, w) => sum + w.duration, 0) / similarWorkouts.length;
      const avgDistance = similarWorkouts.reduce((sum, w) => sum + (w.distance || 0), 0) / similarWorkouts.length;
      const avgHR = similarWorkouts.reduce((sum, w) => sum + (w.avg_heart_rate || 0), 0) / similarWorkouts.length;

      prompt += `- Duración promedio: ${Math.round(avgDuration / 60)} min\n`;
      if (avgDistance > 0) prompt += `- Distancia promedio: ${(avgDistance / 1000).toFixed(2)} km\n`;
      if (avgHR > 0) prompt += `- FC promedio histórica: ${Math.round(avgHR)} bpm\n`;
    }

    prompt += `\nProporciona un análisis detallado de este entrenamiento, comparándolo con los anteriores si hay datos.`;

    return prompt;
  }

  /**
   * Guardar análisis de workout
   */
  private async saveWorkoutAnalysis(workoutId: number, userId: number, analysis: any) {
    await query(
      `INSERT INTO workout_analysis
       (workout_id, user_id, performance_score, recovery_needed_hours, strengths, weaknesses, improvement_suggestions, comparison_to_average)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (workout_id) DO UPDATE SET
         performance_score = EXCLUDED.performance_score,
         recovery_needed_hours = EXCLUDED.recovery_needed_hours,
         strengths = EXCLUDED.strengths,
         weaknesses = EXCLUDED.weaknesses,
         improvement_suggestions = EXCLUDED.improvement_suggestions,
         comparison_to_average = EXCLUDED.comparison_to_average`,
      [
        workoutId,
        userId,
        analysis.performance_score,
        analysis.recovery_needed_hours,
        JSON.stringify(analysis.strengths || []),
        JSON.stringify(analysis.weaknesses || []),
        JSON.stringify(analysis.improvement_suggestions || []),
        JSON.stringify(analysis.comparison_to_average || {}),
      ]
    );
  }

  /**
   * Obtener análisis de un workout
   */
  async getWorkoutAnalysis(workoutId: number) {
    const result = await query(
      'SELECT * FROM workout_analysis WHERE workout_id = $1',
      [workoutId]
    );

    return result.rows[0] || null;
  }

  /**
   * Obtener todos los análisis del usuario
   */
  async getUserWorkoutAnalyses(userId: number, limit: number = 20) {
    const result = await query(
      `SELECT wa.*, w.type, w.start_time, w.duration, w.distance, w.calories
       FROM workout_analysis wa
       JOIN workouts w ON wa.workout_id = w.id
       WHERE wa.user_id = $1
       ORDER BY w.start_time DESC
       LIMIT $2`,
      [userId, limit]
    );

    return result.rows;
  }
}
