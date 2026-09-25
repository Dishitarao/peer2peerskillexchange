const Notification = require('../models/Notification');

class NotificationService {
  async createNotification({
    userId,
    type,
    title,
    message,
    relatedSessionId = null,
    relatedSkillId = null,
    relatedUserId = null,
    channels = ['IN_APP']
  }) {
    try {
      const notification = await Notification.create({
        userId,
        type,
        title,
        message,
        relatedSessionId,
        relatedSkillId,
        relatedUserId,
        channels
      });
      return notification;
    } catch (error) {
      console.error('[Notification Error]:', error.message);
      return null;
    }
  }

  async getUserNotifications(userId, { page = 1, limit = 20, unreadOnly = false }) {
    const query = { userId };
    if (unreadOnly) {
      query.isRead = false;
    }

    const total = await Notification.countDocuments(query);
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('relatedUserId', 'firstName lastName profilePicture')
      .populate('relatedSessionId', 'sessionDate startTime endTime status')
      .populate('relatedSkillId', 'title category');

    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    return {
      notifications,
      total,
      unreadCount,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async markAsRead(notificationId, userId) {
    return await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true },
      { new: true }
    );
  }

  async markAllAsRead(userId) {
    return await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );
  }

  async deleteNotification(notificationId, userId) {
    return await Notification.findOneAndDelete({ _id: notificationId, userId });
  }
}

module.exports = new NotificationService();
