const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyAuth } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/authorizationMiddleware');

// All admin routes require auth + admin role
router.use(verifyAuth, adminOnly);

router.get('/analytics', adminController.getAnalytics);
router.get('/users', adminController.getAllUsers);
router.put('/users/:userId/suspend', adminController.suspendUser);
router.put('/users/:userId/activate', adminController.activateUser);

router.get('/skills', adminController.getAllSkills);
router.put('/skills/:skillId/moderate', adminController.moderateSkill);

router.get('/reports', adminController.getReports);
router.put('/reports/:reportId/resolve', adminController.resolveReport);

router.get('/transactions', adminController.getAllTransactions);
router.post('/wallet/adjust', adminController.adjustWallet);

module.exports = router;
