const walletService = require('../services/walletService');

class WalletController {
  async getWallet(req, res, next) {
    try {
      const wallet = await walletService.getWallet(req.user._id);
      res.status(200).json({
        success: true,
        data: wallet
      });
    } catch (error) {
      next(error);
    }
  }

  async getTransactions(req, res, next) {
    try {
      const result = await walletService.getTransactions(req.user._id, req.query);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyBalance(req, res, next) {
    try {
      const amount = Number(req.params.amount);
      const hasEnough = await walletService.checkSufficientBalance(req.user._id, amount);
      const wallet = await walletService.getWallet(req.user._id);
      res.status(200).json({
        success: true,
        data: {
          hasSufficientBalance: hasEnough,
          requiredAmount: amount,
          currentBalance: wallet.currentBalance
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new WalletController();
