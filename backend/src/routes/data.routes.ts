import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { AuthRequest } from '../types';
import { query } from '../db';
import { SyncService } from '../services/sync.service';
import { AuthService } from '../services/auth.service';

const router = Router();
const authService = new AuthService();

/**
 * GET /api/data/dashboard
 * Get dashboard summary data
 */
router.get('/dashboard', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const today = new Date().toISOString().split('T')[0];
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Get today's summary
    const todaySummary = await query(
      'SELECT * FROM daily_summaries WHERE user_id = $1 AND date = $2',
      [req.user.id, today]
    );

    // Get last 7 days summaries
    const weekSummaries = await query(
      'SELECT * FROM daily_summaries WHERE user_id = $1 AND date >= $2 ORDER BY date DESC',
      [req.user.id, sevenDaysAgo]
    );

    // Get recent heart rate (last 24 hours)
    const recentHR = await query(
      `SELECT timestamp, heart_rate FROM heart_rate_readings
       WHERE user_id = $1 AND timestamp > NOW() - INTERVAL '24 hours'
       ORDER BY timestamp ASC`,
      [req.user.id]
    );

    // Get unread notifications count
    const notificationsCount = await query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND read = false',
      [req.user.id]
    );

    res.json({
      today: todaySummary.rows[0] || null,
      last7Days: weekSummaries.rows,
      recentHeartRate: recentHR.rows,
      unreadNotifications: parseInt(notificationsCount.rows[0].count),
    });
  } catch (error: any) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/data/daily/:date
 * Get daily summary for specific date
 */
router.get('/daily/:date', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { date } = req.params;

    const result = await query(
      'SELECT * FROM daily_summaries WHERE user_id = $1 AND date = $2',
      [req.user.id, date]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No data for this date' });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/data/heart-rate
 * Get heart rate data for date range
 */
router.get('/heart-rate', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { from, to, interval = '5' } = req.query;

    const fromDate = from || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const toDate = to || new Date().toISOString();

    // Sample data based on interval to reduce payload
    const result = await query(
      `SELECT timestamp, heart_rate FROM heart_rate_readings
       WHERE user_id = $1 AND timestamp BETWEEN $2 AND $3
       AND EXTRACT(MINUTE FROM timestamp) % $4 = 0
       ORDER BY timestamp ASC`,
      [req.user.id, fromDate, toDate, parseInt(interval as string)]
    );

    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/data/sleep
 * Get sleep data for date range
 */
router.get('/sleep', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { from, to } = req.query;

    const fromDate = from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const toDate = to || new Date().toISOString().split('T')[0];

    const result = await query(
      `SELECT date, sleep_start, sleep_end, sleep_duration, deep_sleep, light_sleep, rem_sleep, awake_time
       FROM daily_summaries
       WHERE user_id = $1 AND date BETWEEN $2 AND $3 AND sleep_duration IS NOT NULL
       ORDER BY date DESC`,
      [req.user.id, fromDate, toDate]
    );

    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/data/stress
 * Get stress data
 */
router.get('/stress', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { from, to } = req.query;

    const fromDate = from || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const toDate = to || new Date().toISOString();

    const result = await query(
      `SELECT timestamp, stress_level FROM stress_readings
       WHERE user_id = $1 AND timestamp BETWEEN $2 AND $3
       ORDER BY timestamp ASC`,
      [req.user.id, fromDate, toDate]
    );

    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/data/spo2
 * Get SpO2 data
 */
router.get('/spo2', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { from, to } = req.query;

    const fromDate = from || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const toDate = to || new Date().toISOString();

    const result = await query(
      `SELECT timestamp, spo2_value FROM spo2_readings
       WHERE user_id = $1 AND timestamp BETWEEN $2 AND $3
       ORDER BY timestamp ASC`,
      [req.user.id, fromDate, toDate]
    );

    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/data/workouts
 * Get workouts
 */
router.get('/workouts', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { limit = '50' } = req.query;

    const result = await query(
      `SELECT * FROM workouts
       WHERE user_id = $1
       ORDER BY start_time DESC
       LIMIT $2`,
      [req.user.id, parseInt(limit as string)]
    );

    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/data/sync
 * Trigger manual sync
 */
router.post('/sync', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { fromDate, toDate } = req.body;

    const from = fromDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const to = toDate || new Date().toISOString().split('T')[0];

    // Get Zepp credentials
    const credentials = await authService.getZeppCredentials(req.user.id);

    if (!credentials.appToken || !credentials.zeppUserId) {
      // Refresh token if needed
      await authService.refreshZeppToken(req.user.id);
      const refreshedCreds = await authService.getZeppCredentials(req.user.id);
      credentials.appToken = refreshedCreds.appToken;
      credentials.zeppUserId = refreshedCreds.zeppUserId;
    }

    // Perform sync
    const syncService = new SyncService(credentials.appToken!, credentials.zeppUserId!);
    const result = await syncService.syncAllData(req.user.id, from, to);

    res.json({
      message: 'Sync completed',
      ...result,
    });
  } catch (error: any) {
    console.error('Sync error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
