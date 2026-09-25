const User = require('../models/User');
const Skill = require('../models/Skill');
const Review = require('../models/Review');
const walletService = require('./walletService');
const { AppError } = require('../middleware/errorHandler');

class UserService {
  async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    const wallet = await walletService.getWallet(userId);
    const teachingSkills = await Skill.find({ userId, isActive: true });

    return {
      user,
      wallet,
      teachingSkills
    };
  }

  async updateProfile(userId, updateData) {
    const allowedFields = [
      'firstName',
      'lastName',
      'phone',
      'bio',
      'location',
      'profilePicture',
      'interests',
      'skillsToLearn',
      'availability'
    ];

    const filteredUpdate = {};
    for (const key of allowedFields) {
      if (updateData[key] !== undefined) {
        filteredUpdate[key] = updateData[key];
      }
    }

    const updatedUser = await User.findByIdAndUpdate(userId, filteredUpdate, {
      new: true,
      runValidators: true
    });

    if (!updatedUser) {
      throw new AppError('User not found', 404);
    }

    return updatedUser;
  }

  async getMentorProfile(mentorId) {
    const mentor = await User.findById(mentorId).select(
      'firstName lastName bio location profilePicture rating availability createdAt interests'
    );

    if (!mentor) {
      throw new AppError('Mentor not found', 404);
    }

    const skills = await Skill.find({ userId: mentorId, isActive: true, isAvailableToTeach: true });
    const reviews = await Review.find({ reviewedUserId: mentorId, reportedAsInappropriate: false })
      .sort({ createdAt: -1 })
      .populate('reviewerId', 'firstName lastName profilePicture')
      .populate('skillId', 'title category');

    return {
      mentor,
      skills,
      reviews
    };
  }

  async updateAvailability(userId, availability) {
    const user = await User.findByIdAndUpdate(
      userId,
      { availability },
      { new: true, runValidators: true }
    );
    return user.availability;
  }
}

module.exports = new UserService();
