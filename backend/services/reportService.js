const Report = require('../models/Report');
const User = require('../models/User');
const Skill = require('../models/Skill');
const Review = require('../models/Review');
const notificationService = require('./notificationService');
const { AppError } = require('../middleware/errorHandler');

class ReportService {
  async createReport(reporterId, reportData) {
    const { reportedUserId, reportedSkillId, reportedReviewId, reportType, reason, description } =
      reportData;

    const report = await Report.create({
      reporterId,
      reportedUserId,
      reportedSkillId,
      reportedReviewId,
      reportType,
      reason,
      description,
      status: 'PENDING'
    });

    return report;
  }

  async getReports({ status, page = 1, limit = 15 }) {
    const query = {};
    if (status && status !== 'ALL') {
      query.status = status;
    }

    const total = await Report.countDocuments(query);
    const reports = await Report.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('reporterId', 'firstName lastName email')
      .populate('reportedUserId', 'firstName lastName email isSuspended')
      .populate('reportedSkillId', 'title category isActive')
      .populate('reportedReviewId', 'rating reviewText')
      .populate('resolvedBy', 'firstName lastName');

    return {
      reports,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit)
    };
  }

  async resolveReport(reportId, adminId, { status, adminNotes, actionTaken }) {
    const report = await Report.findById(reportId);
    if (!report) {
      throw new AppError('Report not found', 404);
    }

    report.status = status || 'RESOLVED';
    report.adminNotes = adminNotes || '';
    report.actionTaken = actionTaken || '';
    report.resolvedBy = adminId;
    report.resolvedAt = new Date();
    await report.save();

    // If report resolution involved taking action, notify reporter
    await notificationService.createNotification({
      userId: report.reporterId,
      type: 'SYSTEM',
      title: 'Report Update',
      message: `Your report regarding "${report.reason}" has been reviewed and marked as ${report.status}. Action: ${actionTaken || 'Reviewed by moderator'}`
    });

    return report;
  }
}

module.exports = new ReportService();
