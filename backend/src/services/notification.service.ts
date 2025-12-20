import { query } from '../db';
import { Notification } from '../types';
import { Server as SocketServer } from 'socket.io';

export class NotificationService {
  private io?: SocketServer;

  setSocketServer(io: SocketServer) {
    this.io = io;
  }

  /**
   * Create a notification and emit it via WebSocket
   */
  async createNotification(notification: Omit<Notification, 'id' | 'created_at'>): Promise<Notification> {
    const result = await query(
      `INSERT INTO notifications (user_id, type, title, message, severity, read)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        notification.user_id,
        notification.type,
        notification.title,
        notification.message,
        notification.severity,
        notification.read || false,
      ]
    );

    const newNotification = result.rows[0];

    // Emit notification via WebSocket
    if (this.io) {
      this.io.to(`user_${notification.user_id}`).emit('notification', newNotification);
    }

    return newNotification;
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId: number, limit: number = 50, unreadOnly: boolean = false) {
    const query_text = unreadOnly
      ? `SELECT * FROM notifications WHERE user_id = $1 AND read = false ORDER BY created_at DESC LIMIT $2`
      : `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`;

    const result = await query(query_text, [userId, limit]);
    return result.rows;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: number, userId: number): Promise<void> {
    await query(
      `UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2`,
      [notificationId, userId]
    );
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: number): Promise<void> {
    await query(
      `UPDATE notifications SET read = true WHERE user_id = $1`,
      [userId]
    );
  }

  /**
   * Check health metrics and create alerts if needed
   */
  async checkHealthAlertsAndNotify(userId: number): Promise<void> {
    const thresholds = {
      hrHigh: parseInt(process.env.NOTIFICATION_HR_HIGH || '120'),
      hrLow: parseInt(process.env.NOTIFICATION_HR_LOW || '45'),
      spo2Low: parseInt(process.env.NOTIFICATION_SPO2_LOW || '92'),
      stressHigh: parseInt(process.env.NOTIFICATION_STRESS_HIGH || '80'),
    };

    // Check recent heart rate
    const recentHR = await query(
      `SELECT heart_rate FROM heart_rate_readings
       WHERE user_id = $1 AND timestamp > NOW() - INTERVAL '30 minutes'
       ORDER BY timestamp DESC LIMIT 10`,
      [userId]
    );

    if (recentHR.rows.length > 0) {
      const avgHR = recentHR.rows.reduce((sum, r) => sum + r.heart_rate, 0) / recentHR.rows.length;

      if (avgHR > thresholds.hrHigh) {
        await this.createNotification({
          user_id: userId,
          type: 'hr_high',
          title: 'Frecuencia Cardíaca Alta',
          message: `Tu frecuencia cardíaca promedio (${Math.round(avgHR)} bpm) está por encima del umbral normal. Considera descansar.`,
          severity: 'warning',
          read: false,
        });
      } else if (avgHR < thresholds.hrLow) {
        await this.createNotification({
          user_id: userId,
          type: 'hr_low',
          title: 'Frecuencia Cardíaca Baja',
          message: `Tu frecuencia cardíaca promedio (${Math.round(avgHR)} bpm) está por debajo del umbral normal.`,
          severity: 'warning',
          read: false,
        });
      }
    }

    // Check recent SpO2
    const recentSpO2 = await query(
      `SELECT spo2_value FROM spo2_readings
       WHERE user_id = $1 AND timestamp > NOW() - INTERVAL '2 hours'
       ORDER BY timestamp DESC LIMIT 5`,
      [userId]
    );

    if (recentSpO2.rows.length > 0) {
      const minSpO2 = Math.min(...recentSpO2.rows.map(r => r.spo2_value));

      if (minSpO2 < thresholds.spo2Low) {
        await this.createNotification({
          user_id: userId,
          type: 'spo2_low',
          title: 'Saturación de Oxígeno Baja',
          message: `Tu saturación de oxígeno (${minSpO2}%) está por debajo del nivel recomendado. Considera consultar a un médico si persiste.`,
          severity: 'critical',
          read: false,
        });
      }
    }

    // Check recent stress
    const recentStress = await query(
      `SELECT stress_level FROM stress_readings
       WHERE user_id = $1 AND timestamp > NOW() - INTERVAL '1 hour'
       ORDER BY timestamp DESC LIMIT 10`,
      [userId]
    );

    if (recentStress.rows.length > 0) {
      const avgStress = recentStress.rows.reduce((sum, r) => sum + r.stress_level, 0) / recentStress.rows.length;

      if (avgStress > thresholds.stressHigh) {
        await this.createNotification({
          user_id: userId,
          type: 'stress_high',
          title: 'Nivel de Estrés Elevado',
          message: `Tu nivel de estrés promedio (${Math.round(avgStress)}) está elevado. Considera tomar un descanso o practicar técnicas de relajación.`,
          severity: 'warning',
          read: false,
        });
      }
    }

    // Check daily steps goal
    const today = new Date().toISOString().split('T')[0];
    const todaySteps = await query(
      `SELECT steps FROM daily_summaries
       WHERE user_id = $1 AND date = $2`,
      [userId, today]
    );

    if (todaySteps.rows.length > 0 && todaySteps.rows[0].steps >= 10000) {
      // Check if we already sent this notification today
      const existingNotification = await query(
        `SELECT id FROM notifications
         WHERE user_id = $1 AND type = 'goal_achieved'
         AND created_at::date = CURRENT_DATE`,
        [userId]
      );

      if (existingNotification.rows.length === 0) {
        await this.createNotification({
          user_id: userId,
          type: 'goal_achieved',
          title: '¡Meta Alcanzada!',
          message: `¡Felicidades! Has alcanzado tu meta de 10,000 pasos hoy con ${todaySteps.rows[0].steps} pasos.`,
          severity: 'info',
          read: false,
        });
      }
    }
  }

  /**
   * Delete old notifications (older than 30 days)
   */
  async cleanupOldNotifications(): Promise<void> {
    await query(
      `DELETE FROM notifications WHERE created_at < NOW() - INTERVAL '30 days'`
    );
  }
}
