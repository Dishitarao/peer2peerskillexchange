const User = require('../models/User');
const Skill = require('../models/Skill');
const Session = require('../models/Session');
const Transaction = require('../models/Transaction');
const Report = require('../models/Report');
const Review = require('../models/Review');
const notificationService = require('./notificationService');
const { AppError } = require('../middleware/errorHandler');

class AdminService {
  async getDashboardAnalytics() {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isSuspended: false });
    const suspendedUsers = await User.countDocuments({ isSuspended: true });

    const totalSkills = await Skill.countDocuments();
    const activeSkills = await Skill.countDocuments({ isActive: true });

    const totalSessions = await Session.countDocuments();
    const completedSessions = await Session.countDocuments({ status: 'COMPLETED' });
    const requestedSessions = await Session.countDocuments({ status: 'REQUESTED' });
    const acceptedSessions = await Session.countDocuments({ status: 'ACCEPTED' });
    const cancelledSessions = await Session.countDocuments({ status: 'CANCELLED' });

    const pendingReports = await Report.countDocuments({ status: 'PENDING' });
    const totalReviews = await Review.countDocuments();

    // Sum of credits exchanged from completed sessions
    const creditStats = await Transaction.aggregate([
      { $match: { type: 'SESSION_CREDIT_EARNED', status: 'COMPLETED' } },
      { $group: { _id: null, totalCreditsExchanged: { $sum: '$amount' } } }
    ]);
    const totalCreditsExchanged = creditStats[0]?.totalCreditsExchanged || 0;

    // Recent activity log
    const recentSessions = await Session.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('learnerId', 'firstName lastName')
      .populate('mentorId', 'firstName lastName')
      .populate('skillId', 'title');

    const recentReports = await Report.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('reporterId', 'firstName lastName');

    return {
      users: { total: totalUsers, active: activeUsers, suspended: suspendedUsers },
      skills: { total: totalSkills, active: activeSkills },
      sessions: {
        total: totalSessions,
        completed: completedSessions,
        requested: requestedSessions,
        accepted: acceptedSessions,
        cancelled: cancelledSessions
      },
      reports: { pending: pendingReports },
      credits: { totalExchanged: totalCreditsExchanged },
      reviews: { total: totalReviews },
      recentSessions,
      recentReports
    };
  }

  async getAllUsers({ search, isSuspended, role, page = 1, limit = 15 }) {
    const query = {};
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (isSuspended !== undefined && isSuspended !== 'ALL') {
      query.isSuspended = isSuspended === 'true' || isSuspended === true;
    }
    if (role && role !== 'ALL') {
      query.role = role;
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      users,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit)
    };
  }

  async suspendUser(userId, reason = 'Violation of platform policies') {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    if (user.role === 'admin') {
      throw new AppError('Admin users cannot be suspended', 400);
    }

    user.isSuspended = true;
    user.suspensionReason = reason;
    await user.save();

    await notificationService.createNotification({
      userId: user._id,
      type: 'SYSTEM',
      title: 'Account Suspended',
      message: `Your account has been suspended by an administrator. Reason: ${reason}`
    });

    return user;
  }

  async activateUser(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    user.isSuspended = false;
    user.suspensionReason = '';
    await user.save();

    await notificationService.createNotification({
      userId: user._id,
      type: 'SYSTEM',
      title: 'Account Re-Activated',
      message: 'Your account has been reactivated by an administrator. You can now use all platform services.'
    });

    return user;
  }

  async getAllSkills({ search, category, isActive, page = 1, limit = 15 }) {
    const query = {};
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    if (category && category !== 'All') {
      query.category = category;
    }
    if (isActive !== undefined && isActive !== 'ALL') {
      query.isActive = isActive === 'true' || isActive === true;
    }

    const total = await Skill.countDocuments(query);
    const skills = await Skill.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('userId', 'firstName lastName email isSuspended');

    return {
      skills,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit)
    };
  }

  async moderateSkill(skillId, isActive, reason = '') {
    const skill = await Skill.findById(skillId);
    if (!skill) {
      throw new AppError('Skill not found', 404);
    }

    skill.isActive = isActive;
    await skill.save();

    await notificationService.createNotification({
      userId: skill.userId,
      type: 'SYSTEM',
      title: isActive ? 'Skill Listing Approved' : 'Skill Listing Removed',
      message: isActive
        ? `Your skill listing "${skill.title}" is now active.`
        : `Your skill listing "${skill.title}" was deactivated by an administrator. Reason: ${reason || 'Community guideline violation'}`
    });

    return skill;
  }

  async getAllTransactions({ page = 1, limit = 20, type }) {
    const query = {};
    if (type && type !== 'ALL') {
      query.type = type;
    }

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('userId', 'firstName lastName email')
      .populate('sessionId');

    return {
      transactions,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit)
    };
  }
}

module.exports = new AdminService();
