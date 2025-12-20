import { query } from '../db';

export class CheckInService {
  /**
   * Generar preguntas diarias para el usuario
   */
  async generateDailyQuestions(userId: number): Promise<any[]> {
    const today = new Date().toISOString().split('T')[0];

    // Verificar si ya hay preguntas para hoy
    const existing = await query(
      'SELECT * FROM daily_questions WHERE user_id = $1 AND date = $2',
      [userId, today]
    );

    if (existing.rows.length > 0) {
      return existing.rows;
    }

    // Preguntas predefinidas tipo Whoop
    const questions = [
      {
        type: 'sleep_quality',
        text: '¿Cómo calificarías la calidad de tu sueño anoche?',
      },
      {
        type: 'energy_level',
        text: '¿Cómo te sientes de energía hoy?',
      },
      {
        type: 'mood',
        text: '¿Cómo está tu estado de ánimo hoy?',
      },
      {
        type: 'stress_level',
        text: '¿Qué tan estresado/a te sientes?',
      },
      {
        type: 'hydration',
        text: '¿Cómo está tu nivel de hidratación?',
      },
      {
        type: 'muscle_soreness',
        text: '¿Tienes dolor muscular? (0 = ninguno, 5 = mucho)',
      },
    ];

    // Insertar preguntas
    const createdQuestions = [];
    for (const q of questions) {
      const result = await query(
        `INSERT INTO daily_questions (user_id, date, question_type, question_text)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [userId, today, q.type, q.text]
      );
      createdQuestions.push(result.rows[0]);
    }

    return createdQuestions;
  }

  /**
   * Guardar respuesta a pregunta diaria
   */
  async answerDailyQuestion(userId: number, questionId: number, answer: string) {
    await query(
      `UPDATE daily_questions
       SET answer = $1, answered_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND user_id = $3`,
      [answer, questionId, userId]
    );
  }

  /**
   * Crear o actualizar check-in diario
   */
  async createOrUpdateCheckIn(userId: number, checkInData: any) {
    const today = new Date().toISOString().split('T')[0];

    const result = await query(
      `INSERT INTO daily_checkins
       (user_id, date, sleep_quality, energy_level, mood, stress_level,
        alcohol_consumed, caffeine_intake, hydration_level, muscle_soreness,
        illness_symptoms, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (user_id, date) DO UPDATE SET
         sleep_quality = EXCLUDED.sleep_quality,
         energy_level = EXCLUDED.energy_level,
         mood = EXCLUDED.mood,
         stress_level = EXCLUDED.stress_level,
         alcohol_consumed = EXCLUDED.alcohol_consumed,
         caffeine_intake = EXCLUDED.caffeine_intake,
         hydration_level = EXCLUDED.hydration_level,
         muscle_soreness = EXCLUDED.muscle_soreness,
         illness_symptoms = EXCLUDED.illness_symptoms,
         notes = EXCLUDED.notes
       RETURNING *`,
      [
        userId,
        today,
        checkInData.sleep_quality || null,
        checkInData.energy_level || null,
        checkInData.mood || null,
        checkInData.stress_level || null,
        checkInData.alcohol_consumed || false,
        checkInData.caffeine_intake || 0,
        checkInData.hydration_level || null,
        checkInData.muscle_soreness || 0,
        checkInData.illness_symptoms || null,
        checkInData.notes || null,
      ]
    );

    return result.rows[0];
  }

  /**
   * Obtener check-in del día
   */
  async getTodayCheckIn(userId: number) {
    const today = new Date().toISOString().split('T')[0];

    const result = await query(
      'SELECT * FROM daily_checkins WHERE user_id = $1 AND date = $2',
      [userId, today]
    );

    return result.rows[0] || null;
  }

  /**
   * Obtener historial de check-ins
   */
  async getCheckInHistory(userId: number, limit: number = 30) {
    const result = await query(
      `SELECT * FROM daily_checkins
       WHERE user_id = $1
       ORDER BY date DESC
       LIMIT $2`,
      [userId, limit]
    );

    return result.rows;
  }

  /**
   * Obtener preguntas pendientes del día
   */
  async getPendingQuestions(userId: number) {
    const today = new Date().toISOString().split('T')[0];

    const result = await query(
      `SELECT * FROM daily_questions
       WHERE user_id = $1 AND date = $2 AND answer IS NULL
       ORDER BY created_at`,
      [userId, today]
    );

    return result.rows;
  }

  /**
   * Verificar si el usuario tiene check-in pendiente
   */
  async hasCompletedTodayCheckIn(userId: number): Promise<boolean> {
    const today = new Date().toISOString().split('T')[0];

    const result = await query(
      'SELECT id FROM daily_checkins WHERE user_id = $1 AND date = $2',
      [userId, today]
    );

    return result.rows.length > 0;
  }
}
