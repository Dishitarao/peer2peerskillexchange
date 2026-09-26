const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    learnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Learner is required']
    },
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Mentor is required']
    },
    skillId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      required: [true, 'Skill is required']
    },
    sessionDate: {
      type: Date,
      required: [true, 'Session date is required']
    },
    startTime: {
      type: String, // e.g. "14:00"
      required: [true, 'Start time is required']
    },
    endTime: {
      type: String, // e.g. "15:00"
      required: [true, 'End time is required']
    },
    durationMinutes: {
      type: Number,
      default: 60,
      min: 2,
      max: 240
    },
    creditsExchanged: {
      type: Number,
      required: [true, 'Credits amount is required'],
      min: [1, 'Credits must be at least 1']
    },
    notes: {
      type: String,
      default: '',
      maxlength: [1000, 'Notes cannot exceed 1000 characters']
    },
    status: {
      type: String,
      enum: ['REQUESTED', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'COMPLETED', 'RESCHEDULED'],
      default: 'REQUESTED'
    },
    // Manual completion double confirmation workflow
    mentorConfirmedCompletion: {
      type: Boolean,
      default: false
    },
    mentorConfirmedAt: {
      type: Date,
      default: null
    },
    learnerConfirmedCompletion: {
      type: Boolean,
      default: false
    },
    learnerConfirmedAt: {
      type: Date,
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    },
    creditsTransferred: {
      type: Boolean,
      default: false
    },
    cancellationReason: {
      type: String,
      default: ''
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    rescheduleDetails: {
      proposedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      proposedDate: Date,
      proposedStartTime: String,
      proposedEndTime: String,
      reason: String,
      createdAt: Date
    },
    // Future video conferencing extensibility hooks
    meetingProvider: {
      type: String,
      default: null
    },
    meetingUrl: {
      type: String,
      default: null
    },
    meetingId: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

sessionSchema.index({ mentorId: 1, sessionDate: 1, status: 1 });
sessionSchema.index({ learnerId: 1, sessionDate: 1, status: 1 });

module.exports = mongoose.model('Session', sessionSchema);
