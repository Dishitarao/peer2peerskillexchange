const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      default: null
    },
    type: {
      type: String,
      enum: [
        'INITIAL_BONUS',
        'SESSION_CREDIT_EARNED',
        'SESSION_CREDIT_SPENT',
        'ADMIN_ADJUSTMENT',
        'REFUND'
      ],
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    balanceAfter: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['COMPLETED', 'PENDING', 'FAILED'],
      default: 'COMPLETED'
    },
    reference: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ sessionId: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
