const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { verifyAuth } = require('../middleware/authMiddleware');

router.use(verifyAuth);

router.get('/balance', walletController.getWallet);
router.get('/transactions', walletController.getTransactions);
router.get('/verify-balance/:amount', walletController.verifyBalance);

module.exports = router;
