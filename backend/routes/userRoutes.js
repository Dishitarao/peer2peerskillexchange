const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyAuth, optionalAuth } = require('../middleware/authMiddleware');
const { validate, profileUpdateSchema } = require('../middleware/validationMiddleware');

router.get('/profile', verifyAuth, userController.getProfile);
router.put('/profile', verifyAuth, validate(profileUpdateSchema), userController.updateProfile);
router.put('/availability', verifyAuth, userController.updateAvailability);
router.get('/mentors/:mentorId', optionalAuth, userController.getMentorProfile);

module.exports = router;
