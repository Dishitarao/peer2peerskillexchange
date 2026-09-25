const reportService = require('../services/reportService');

class ReportController {
  async createReport(req, res, next) {
    try {
      const report = await reportService.createReport(req.user._id, req.body);
      res.status(201).json({
        success: true,
        message: 'Report submitted successfully. Platform administrators will review it promptly.',
        data: report
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReportController();
