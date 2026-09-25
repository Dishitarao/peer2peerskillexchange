const Review = require('../models/Review');
const Session = require('../models/Session');
const User = require('../models/User');
const notificationService = require('./notificationService');
const { AppError } = require('../middleware/errorHandler');

class ReviewService {
  // Recalculate average rating and count for a user
  async recalculateUserRating(userId) {
    const reviews = await Review.find({
      reviewedUserId: userId,
      reportedAsInappropriate: false
    });

    if (reviews.length === 0) {
      await User.findByIdAndUpdate(userId, {
        'rating.average': 0,
        'rating.count': 0
      });
      return { average: 0, count: 0 };
    }

    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const average = parseFloat((sum / reviews.length).toFixed(1));

    await User.findByIdAndUpdate(userId, {
      'rating.average': average,
      'rating.count': reviews.length
    });

    return { average, count: reviews.length };
  }

  // Submit a review for a completed session
  async submitReview(reviewerId, { sessionId, rating, reviewText }) {
    const session = await Session.findById(sessionId).populate('skillId', 'title');

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    if (session.status !== 'COMPLETED') {
      throw new AppError('Reviews can only be submitted for COMPLETED sessions.', 400);
    }

    const isLearner = session.learnerId.toString() === reviewerId.toString();
    const isMentor = session.mentorId.toString() === reviewerId.toString();

    if (!isLearner && !isMentor) {
      throw new AppError('Only participants of this session can submit a review.', 403);
    }

    // Determine target reviewed user
    const reviewedUserId = isLearner ? session.mentorId : session.learnerId;

    if (reviewerId.toString() === reviewedUserId.toString()) {
      throw new AppError('You cannot review yourself.', 400);
    }

    // Check if duplicate review exists
    const existingReview = await Review.findOne({
      sessionId,
      reviewerId
    });

    if (existingReview) {
      throw new AppError('You have already submitted a review for this session.', 400);
    }

    // Create review
    const review = await Review.create({
      sessionId,
      reviewerId,
      reviewedUserId,
      skillId: session.skillId?._id || session.skillId,
      rating,
      reviewText
    });

    // Recalculate rating
    await this.recalculateUserRating(reviewedUserId);

    // Notify reviewed user
    const reviewer = await User.findById(reviewerId);
    await notificationService.createNotification({
      userId: reviewedUserId,
      type: 'REVIEW_RECEIVED',
      title: 'New Review Received',
      message: `${reviewer.firstName} ${reviewer.lastName} gave you a ${rating}-star review for "${session.skillId?.title || 'Session'}".`,
      relatedSessionId: session._id,
      relatedUserId: reviewerId
    });

    return review;
  }

  // Get reviews for a specific user (mentor/learner)
  async getReviewsForUser(userId, { page = 1, limit = 10 }) {
    const query = {
      reviewedUserId: userId,
      reportedAsInappropriate: false
    };

    const total = await Review.countDocuments(query);
    const reviews = await Review.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('reviewerId', 'firstName lastName profilePicture')
      .populate('skillId', 'title category');

    const user = await User.findById(userId).select('rating');

    return {
      reviews,
      total,
      averageRating: user?.rating?.average || 0,
      ratingCount: user?.rating?.count || 0,
      page: Number(page),
      totalPages: Math.ceil(total / limit)
    };
  }

  // Check if current user has already reviewed a session
  async getSessionReviewStatus(sessionId, userId) {
    const session = await Session.findById(sessionId);
    if (!session) {
      throw new AppError('Session not found', 404);
    }

    const review = await Review.findOne({ sessionId, reviewerId: userId });
    return {
      canReview: session.status === 'COMPLETED' && !review,
      hasReviewed: !!review,
      review
    };
  }
}

module.exports = new ReviewService();
