const adminService = require('../services/adminService');
const reportService = require('../services/reportService');
const walletService = require('../services/walletService');

class AdminController {
  async getAnalytics(req, res, next) {
    try {
      const analytics = await adminService.getDashboardAnalytics();
      res.status(200).json({
        success: true,
        data: analytics
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllUsers(req, res, next) {
    try {
      const result = await adminService.getAllUsers(req.query);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async suspendUser(req, res, next) {
    try {
      const user = await adminService.suspendUser(req.params.userId, req.body.reason);
      res.status(200).json({
        success: true,
        message: `User ${user.firstName} ${user.lastName} has been suspended.`,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  async activateUser(req, res, next) {
    try {
      const user = await adminService.activateUser(req.params.userId);
      res.status(200).json({
        success: true,
        message: `User ${user.firstName} ${user.lastName} has been reactivated.`,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllSkills(req, res, next) {
    try {
      const result = await adminService.getAllSkills(req.query);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async moderateSkill(req, res, next) {
    try {
      const { isActive, reason } = req.body;
      const skill = await adminService.moderateSkill(req.params.skillId, isActive, reason);
      res.status(200).json({
        success: true,
        message: isActive ? 'Skill listed.' : 'Skill unlisted.',
        data: skill
      });
    } catch (error) {
      next(error);
    }
  }

  async getReports(req, res, next) {
    try {
      const result = await reportService.getReports(req.query);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async resolveReport(req, res, next) {
    try {
      const report = await reportService.resolveReport(
        req.params.reportId,
        req.user._id,
        req.body
      );
      res.status(200).json({
        success: true,
        message: 'Report updated successfully.',
        data: report
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllTransactions(req, res, next) {
    try {
      const result = await adminService.getAllTransactions(req.query);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async adjustWallet(req, res, next) {
    try {
      const { userId, amount, reason } = req.body;
      const result = await walletService.adjustCredits({
        userId,
        amount: Number(amount),
        reason,
        adminId: req.user._id
      });
      res.status(200).json({
        success: true,
        message: `Wallet adjusted by ${amount > 0 ? '+' : ''}${amount} credits.`,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();
