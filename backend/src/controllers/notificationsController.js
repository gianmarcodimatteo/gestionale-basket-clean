import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all notifications for user
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { unreadOnly } = req.query;

    const where = { userId };
    if (unreadOnly === 'true') {
      where.read = false;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json({ success: true, notifications });
  } catch (error) {
    console.error('Error in getNotifications:', error);
    res.status(500).json({ error: 'Error retrieving notifications' });
  }
};

// Get unread count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await prisma.notification.count({
      where: { userId, read: false },
    });

    res.json({ success: true, count });
  } catch (error) {
    console.error('Error in getUnreadCount:', error);
    res.status(500).json({ error: 'Error retrieving unread count' });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true },
    });

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error in markAsRead:', error);
    res.status(500).json({ error: 'Error updating notification' });
  }
};

// Mark all as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error in markAllAsRead:', error);
    res.status(500).json({ error: 'Error updating notifications' });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await prisma.notification.deleteMany({
      where: { id, userId },
    });

    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    console.error('Error in deleteNotification:', error);
    res.status(500).json({ error: 'Error deleting notification' });
  }
};

// Admin: Send notification to user
export const sendNotification = async (req, res) => {
  try {
    const { userId, title, message, type } = req.body;

    if (!userId || !title || !message) {
      return res.status(400).json({ error: 'userId, title and message are required' });
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type: type || 'INFO',
      },
    });

    res.json({ success: true, notification });
  } catch (error) {
    console.error('Error in sendNotification:', error);
    res.status(500).json({ error: 'Error sending notification' });
  }
};

// Admin: Send notification to multiple users
export const broadcastNotification = async (req, res) => {
  try {
    const { userIds, title, message, type } = req.body;

    if (!userIds || userIds.length === 0 || !title || !message) {
      return res.status(400).json({ error: 'userIds, title and message are required' });
    }

    const notifications = await prisma.notification.createMany({
      data: userIds.map(userId => ({
        userId,
        title,
        message,
        type: type || 'INFO',
      })),
    });

    res.json({ success: true, count: notifications.count });
  } catch (error) {
    console.error('Error in broadcastNotification:', error);
    res.status(500).json({ error: 'Error sending notifications' });
  }
};
