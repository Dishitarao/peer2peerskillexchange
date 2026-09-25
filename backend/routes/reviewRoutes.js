const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { verifyAuth, optionalAuth } = require('../middleware/authMiddleware');
const { validate, reviewCreateSchema } = require('../middleware/validationMiddleware');

router.post('/', verifyAuth, validate(reviewCreateSchema), reviewController.submitReview);
router.get('/user/:userId', optionalAuth, reviewController.getReviewsForUser);
router.get('/session/:sessionId/status', verifyAuth, reviewController.getSessionReviewStatus);

module.exports = router;
