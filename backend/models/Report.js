const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reporter is required']
    },
    reportedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    reportedSkillId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      default: null
    },
    reportedReviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
      default: null
    },
    reportType: {
      type: String,
      enum: [
        'INAPPROPRIATE_SKILL',
        'INAPPROPRIATE_USER',
        'INAPPROPRIATE_REVIEW',
        'DISPUTE',
        'ABUSE',
        'OTHER'
      ],
      required: [true, 'Report type is required']
    },
    reason: {
      type: String,
      required: [true, 'Reason is required'],
      maxlength: [200, 'Reason cannot exceed 200 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    status: {
      type: String,
      enum: ['PENDING', 'IN_REVIEW', 'RESOLVED', 'DISMISSED'],
      default: 'PENDING'
    },
    adminNotes: {
      type: String,
      default: ''
    },
    actionTaken: {
      type: String,
      default: ''
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    resolvedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

reportSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
