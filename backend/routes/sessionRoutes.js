const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const { verifyAuth } = require('../middleware/authMiddleware');
const { validate, sessionRequestSchema } = require('../middleware/validationMiddleware');

// All session routes require authentication
router.use(verifyAuth);

router.post('/request', validate(sessionRequestSchema), sessionController.requestSession);
router.get('/upcoming', sessionController.getUpcomingSessions);
router.get('/requests/incoming', sessionController.getIncomingRequests);
router.get('/requests/outgoing', sessionController.getOutgoingRequests);
router.get('/my-sessions', sessionController.getUserSessions);
router.get('/:sessionId', sessionController.getSessionById);

router.put('/:sessionId/accept', sessionController.acceptSession);
router.put('/:sessionId/reject', sessionController.rejectSession);
router.put('/:sessionId/cancel', sessionController.cancelSession);
router.put('/:sessionId/reschedule', sessionController.rescheduleSession);

// CRITICAL MANUAL COMPLETION ENDPOINT
router.put('/:sessionId/confirm-completion', sessionController.confirmCompletion);

module.exports = router;
