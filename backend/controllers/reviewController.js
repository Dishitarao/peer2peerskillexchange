const reviewService = require('../services/reviewService');

class ReviewController {
  async submitReview(req, res, next) {
    try {
      const review = await reviewService.submitReview(req.user._id, req.body);
      res.status(201).json({
        success: true,
        message: 'Review submitted successfully. Thank you for your feedback!',
        data: review
      });
    } catch (error) {
      next(error);
    }
  }

  async getReviewsForUser(req, res, next) {
    try {
      const result = await reviewService.getReviewsForUser(req.params.userId, req.query);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getSessionReviewStatus(req, res, next) {
    try {
      const result = await reviewService.getSessionReviewStatus(
        req.params.sessionId,
        req.user._id
      );
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReviewController();
