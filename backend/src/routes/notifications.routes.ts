import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { AuthRequest } from '../types';
import { NotificationService } from '../services/notification.service';

const router = Router();
const notificationService = new NotificationService();

/**
 * GET /api/notifications
 * Get user notifications
 */
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { limit = '50', unreadOnly = 'false' } = req.query;

    const notifications = await notificationService.getUserNotifications(
      req.user.id,
      parseInt(limit as string),
      unreadOnly === 'true'
    );

    res.json(notifications);
  } catch (error: any) {
    console.error('Notifications error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/notifications/:id/read
 * Mark notification as read
 */
router.put('/:id/read', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { id } = req.params;

    await notificationService.markAsRead(parseInt(id), req.user.id);

    res.json({ message: 'Notification marked as read' });
  } catch (error: any) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/notifications/read-all
 * Mark all notifications as read
 */
router.put('/read-all', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    await notificationService.markAllAsRead(req.user.id);

    res.json({ message: 'All notifications marked as read' });
  } catch (error: any) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
