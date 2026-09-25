const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const config = require('../config/config');
const { AppError } = require('../middleware/errorHandler');

class WalletService {
  // Initialize wallet for new user with bonus
  async initializeWallet(userId, bonusAmount = config.initialCredits) {
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = await Wallet.create({
        userId,
        currentBalance: bonusAmount,
        totalEarned: 0,
        totalSpent: 0
      });

      // Log initial bonus transaction
      if (bonusAmount > 0) {
        await Transaction.create({
          userId,
          type: 'INITIAL_BONUS',
          amount: bonusAmount,
          balanceAfter: bonusAmount,
          description: `Welcome bonus of ${bonusAmount} credits`,
          status: 'COMPLETED'
        });
      }
    }
    return wallet;
  }

  // Get user wallet details
  async getWallet(userId) {
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = await this.initializeWallet(userId);
    }
    return wallet;
  }

  // Check if learner has sufficient balance
  async checkSufficientBalance(userId, amount) {
    const wallet = await this.getWallet(userId);
    return wallet.currentBalance >= amount;
  }

  // Atomic credit transfer on dual session completion
  async transferSessionCredits({ learnerId, mentorId, amount, sessionId, sessionSkillTitle }) {
    // 1. Prevent duplicate transaction for the same session
    const existingTx = await Transaction.findOne({
      sessionId,
      type: 'SESSION_CREDIT_SPENT'
    });

    if (existingTx) {
      console.warn(`[Wallet] Transaction already processed for session ${sessionId}`);
      return { alreadyProcessed: true };
    }

    const learnerWallet = await this.getWallet(learnerId);
    const mentorWallet = await this.getWallet(mentorId);

    if (learnerWallet.currentBalance < amount) {
      throw new AppError('Learner does not have enough credits to complete this session.', 400);
    }

    // Deduct from learner
    learnerWallet.currentBalance -= amount;
    learnerWallet.totalSpent += amount;
    await learnerWallet.save();

    const learnerTx = await Transaction.create({
      userId: learnerId,
      sessionId,
      type: 'SESSION_CREDIT_SPENT',
      amount: -amount,
      balanceAfter: learnerWallet.currentBalance,
      description: `Spent ${amount} credits for learning session: ${sessionSkillTitle || 'Skill Session'}`,
      status: 'COMPLETED'
    });

    // Add to mentor
    mentorWallet.currentBalance += amount;
    mentorWallet.totalEarned += amount;
    await mentorWallet.save();

    const mentorTx = await Transaction.create({
      userId: mentorId,
      sessionId,
      type: 'SESSION_CREDIT_EARNED',
      amount: amount,
      balanceAfter: mentorWallet.currentBalance,
      description: `Earned ${amount} credits for mentoring session: ${sessionSkillTitle || 'Skill Session'}`,
      status: 'COMPLETED'
    });

    return {
      success: true,
      amount,
      learnerBalance: learnerWallet.currentBalance,
      mentorBalance: mentorWallet.currentBalance,
      learnerTx,
      mentorTx
    };
  }

  // Get transaction history with pagination
  async getTransactions(userId, { page = 1, limit = 15, type }) {
    const query = { userId };
    if (type) {
      query.type = type;
    }

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('sessionId', 'sessionDate startTime endTime status');

    return {
      transactions,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Admin adjustments
  async adjustCredits({ userId, amount, reason, adminId }) {
    const wallet = await this.getWallet(userId);
    wallet.currentBalance = Math.max(0, wallet.currentBalance + amount);
    if (amount > 0) {
      wallet.totalEarned += amount;
    }
    await wallet.save();

    const tx = await Transaction.create({
      userId,
      type: 'ADMIN_ADJUSTMENT',
      amount,
      balanceAfter: wallet.currentBalance,
      description: `Admin adjustment: ${reason}`,
      status: 'COMPLETED',
      reference: `Admin: ${adminId}`
    });

    return { wallet, tx };
  }
}

module.exports = new WalletService();
