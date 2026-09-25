const userService = require('../services/userService');

class UserController {
  async getProfile(req, res, next) {
    try {
      const data = await userService.getProfile(req.user._id);
      res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const updatedUser = await userService.updateProfile(req.user._id, req.body);
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully.',
        data: updatedUser
      });
    } catch (error) {
      next(error);
    }
  }

  async getMentorProfile(req, res, next) {
    try {
      const data = await userService.getMentorProfile(req.params.mentorId);
      res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  }

  async updateAvailability(req, res, next) {
    try {
      const availability = await userService.updateAvailability(req.user._id, req.body.availability);
      res.status(200).json({
        success: true,
        message: 'Availability schedule updated.',
        data: availability
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
