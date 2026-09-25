const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: [
        'SESSION_REQUESTED',
        'SESSION_ACCEPTED',
        'SESSION_REJECTED',
        'SESSION_CANCELLED',
        'SESSION_RESCHEDULED',
        'SESSION_COMPLETED',
        'SESSION_CONFIRMATION_REMINDER',
        'CREDIT_EARNED',
        'CREDIT_SPENT',
        'REVIEW_RECEIVED',
        'ADMIN_ANNOUNCEMENT',
        'SYSTEM'
      ],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    isRead: {
      type: Boolean,
      default: false
    },
    relatedSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      default: null
    },
    relatedSkillId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      default: null
    },
    relatedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    channels: {
      type: [String],
      enum: ['IN_APP', 'EMAIL', 'PUSH'],
      default: ['IN_APP']
    }
  },
  {
    timestamps: true
  }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
