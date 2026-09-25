const notificationService = require('../services/notificationService');

class NotificationController {
  async getMyNotifications(req, res, next) {
    try {
      const result = await notificationService.getUserNotifications(req.user._id, req.query);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const notification = await notificationService.markAsRead(
        req.params.notificationId,
        req.user._id
      );
      res.status(200).json({
        success: true,
        message: 'Notification marked as read.',
        data: notification
      });
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req, res, next) {
    try {
      await notificationService.markAllAsRead(req.user._id);
      res.status(200).json({
        success: true,
        message: 'All notifications marked as read.'
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteNotification(req, res, next) {
    try {
      await notificationService.deleteNotification(req.params.notificationId, req.user._id);
      res.status(200).json({
        success: true,
        message: 'Notification deleted.'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotificationController();
