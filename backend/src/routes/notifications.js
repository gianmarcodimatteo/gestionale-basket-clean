import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { isAdmin } from '../middleware/auth.js';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  sendNotification,
  broadcastNotification,
} from '../controllers/notificationsController.js';

const router = express.Router();

// Middleware for role-based access
const checkNotificationAccess = (req, res, next) => {
  const user = req.user;
  if (!['ADMIN', 'EDITOR'].includes(user?.role)) {
    return res.status(403).json({ success: false, error: 'Unauthorized' });
  }
  next();
};

// User routes
router.get('/', verifyToken, getNotifications);
router.get('/unread-count', verifyToken, getUnreadCount);
router.put('/:id/read', verifyToken, markAsRead);
router.put('/mark-all-read', verifyToken, markAllAsRead);
router.delete('/:id', verifyToken, deleteNotification);

// Admin routes for sending notifications
router.post('/send', verifyToken, isAdmin, sendNotification);
router.post('/broadcast', verifyToken, isAdmin, broadcastNotification);

export default router;
