const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { verifyAuth } = require('../middleware/authMiddleware');

router.use(verifyAuth);

router.get('/', notificationController.getMyNotifications);
router.put('/mark-all-read', notificationController.markAllAsRead);
router.put('/:notificationId/read', notificationController.markAsRead);
router.delete('/:notificationId', notificationController.deleteNotification);

module.exports = router;
