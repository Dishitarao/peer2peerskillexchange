const sessionService = require('../services/sessionService');

class SessionController {
  async requestSession(req, res, next) {
    try {
      const session = await sessionService.requestSession(req.user._id, req.body);
      res.status(201).json({
        success: true,
        message: 'Session requested successfully! The mentor has been notified.',
        data: session
      });
    } catch (error) {
      next(error);
    }
  }

  async acceptSession(req, res, next) {
    try {
      const session = await sessionService.acceptSession(req.params.sessionId, req.user._id);
      res.status(200).json({
        success: true,
        message: 'Session request accepted successfully.',
        data: session
      });
    } catch (error) {
      next(error);
    }
  }

  async rejectSession(req, res, next) {
    try {
      const session = await sessionService.rejectSession(
        req.params.sessionId,
        req.user._id,
        req.body.reason
      );
      res.status(200).json({
        success: true,
        message: 'Session request rejected.',
        data: session
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelSession(req, res, next) {
    try {
      const session = await sessionService.cancelSession(
        req.params.sessionId,
        req.user._id,
        req.body.reason
      );
      res.status(200).json({
        success: true,
        message: 'Session cancelled successfully.',
        data: session
      });
    } catch (error) {
      next(error);
    }
  }

  async rescheduleSession(req, res, next) {
    try {
      const session = await sessionService.rescheduleSession(
        req.params.sessionId,
        req.user._id,
        req.body
      );
      res.status(200).json({
        success: true,
        message: 'Session reschedule proposal sent.',
        data: session
      });
    } catch (error) {
      next(error);
    }
  }

  // DUAL CONFIRMATION MANUAL COMPLETION WORKFLOW
  async confirmCompletion(req, res, next) {
    try {
      const result = await sessionService.confirmCompletion(req.params.sessionId, req.user._id);
      res.status(200).json({
        success: true,
        message: result.message,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getSessionById(req, res, next) {
    try {
      const session = await sessionService.getSessionById(
        req.params.sessionId,
        req.user._id,
        req.user.role
      );
      res.status(200).json({
        success: true,
        data: session
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserSessions(req, res, next) {
    try {
      const result = await sessionService.getUserSessions(req.user._id, req.query);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getUpcomingSessions(req, res, next) {
    try {
      const sessions = await sessionService.getUpcomingSessions(req.user._id);
      res.status(200).json({
        success: true,
        data: sessions
      });
    } catch (error) {
      next(error);
    }
  }

  async getIncomingRequests(req, res, next) {
    try {
      const requests = await sessionService.getIncomingRequests(req.user._id);
      res.status(200).json({
        success: true,
        data: requests
      });
    } catch (error) {
      next(error);
    }
  }

  async getOutgoingRequests(req, res, next) {
    try {
      const requests = await sessionService.getOutgoingRequests(req.user._id);
      res.status(200).json({
        success: true,
        data: requests
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SessionController();
