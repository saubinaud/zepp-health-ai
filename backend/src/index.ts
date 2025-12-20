import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import cron from 'node-cron';

// Routes
import authRoutes from './routes/auth.routes';
import dataRoutes from './routes/data.routes';
import aiRoutes from './routes/ai.routes';
import notificationsRoutes from './routes/notifications.routes';
import healthRoutes from './routes/health.routes';
import settingsRoutes from './routes/settings.routes';

// Services
import { NotificationService } from './services/notification.service';
import { SyncService } from './services/sync.service';
import { AuthService } from './services/auth.service';

// Sockets
import { setupNotificationSocket } from './sockets/notification.socket';

// Database
import { query } from './db';

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup WebSocket
const io = setupNotificationSocket(server);
const notificationService = new NotificationService();
notificationService.setSocketServer(io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/settings', settingsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Zepp Health Data API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      data: '/api/data',
      ai: '/api/ai',
      notifications: '/api/notifications',
    },
  });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// Automatic sync cron job
const syncInterval = parseInt(process.env.SYNC_INTERVAL_MINUTES || '60');
const authService = new AuthService();

// Run every X minutes (default: 60)
cron.schedule(`*/${syncInterval} * * * *`, async () => {
  console.log('Running automatic sync...');

  try {
    // Get all users
    const usersResult = await query('SELECT id, app_token, user_id FROM users WHERE app_token IS NOT NULL');

    for (const user of usersResult.rows) {
      try {
        console.log(`Syncing data for user ${user.id}...`);

        // Get date range (last 7 days)
        const toDate = new Date().toISOString().split('T')[0];
        const fromDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        // Perform sync
        const syncService = new SyncService(user.app_token, user.user_id);
        await syncService.syncAllData(user.id, fromDate, toDate);

        // Check for health alerts
        await notificationService.checkHealthAlertsAndNotify(user.id);

        console.log(`Sync completed for user ${user.id}`);
      } catch (error: any) {
        console.error(`Error syncing user ${user.id}:`, error.message);

        // If token expired, try to refresh
        if (error.message.includes('token') || error.message.includes('auth')) {
          try {
            await authService.refreshZeppToken(user.id);
            console.log(`Refreshed token for user ${user.id}`);
          } catch (refreshError: any) {
            console.error(`Failed to refresh token for user ${user.id}:`, refreshError.message);
          }
        }
      }
    }
  } catch (error: any) {
    console.error('Automatic sync error:', error);
  }
});

// Cleanup old notifications daily at 3 AM
cron.schedule('0 3 * * *', async () => {
  console.log('Cleaning up old notifications...');
  try {
    await notificationService.cleanupOldNotifications();
    console.log('Cleanup completed');
  } catch (error: any) {
    console.error('Cleanup error:', error);
  }
});

// Start server
server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║   Zepp Health Data API Server Started     ║
╠════════════════════════════════════════════╣
║  Port: ${PORT.toString().padEnd(38)}║
║  Environment: ${(process.env.NODE_ENV || 'development').padEnd(28)}║
║  Sync Interval: ${(syncInterval + ' minutes').padEnd(26)}║
╚════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

export default app;
