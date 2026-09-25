const crypto = require('crypto');
const User = require('../models/User');
const walletService = require('./walletService');
const emailService = require('./emailService');
const notificationService = require('./notificationService');
const { AppError } = require('../middleware/errorHandler');

class AuthService {
  async register(userData) {
    const { firstName, lastName, email, phone, password, bio, location, interests, skillsToLearn } =
      userData;

    // 1. Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new AppError('An account with this email address already exists.', 400);
    }

    // 2. Create user
    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone: phone || '',
      password,
      bio: bio || '',
      location: location || '',
      interests: interests || [],
      skillsToLearn: skillsToLearn || []
    });

    // 3. Initialize wallet with starter credits
    const wallet = await walletService.initializeWallet(user._id);

    // 4. Send welcome notification & email
    await notificationService.createNotification({
      userId: user._id,
      type: 'SYSTEM',
      title: 'Welcome to P2P Skill Exchange!',
      message: `Your account has been set up with ${wallet.currentBalance} starter credits.`
    });

    emailService.sendWelcomeEmail(user).catch(() => {});

    // 5. Generate token
    const token = user.generateAuthToken();

    return {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profilePicture: user.profilePicture,
        bio: user.bio,
        location: user.location,
        interests: user.interests,
        skillsToLearn: user.skillsToLearn,
        rating: user.rating,
        walletBalance: wallet.currentBalance
      },
      token
    };
  }

  async login(loginIdentifier, password) {
    // Find by email or phone
    const user = await User.findOne({
      $or: [
        { email: loginIdentifier.toLowerCase() },
        { phone: loginIdentifier }
      ]
    }).select('+password');

    if (!user) {
      throw new AppError('Invalid email/phone or password.', 401);
    }

    if (user.isSuspended) {
      throw new AppError(
        `Account suspended: ${user.suspensionReason || 'Please contact platform administrator.'}`,
        403
      );
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid email/phone or password.', 401);
    }

    const wallet = await walletService.getWallet(user._id);
    const token = user.generateAuthToken();

    return {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profilePicture: user.profilePicture,
        bio: user.bio,
        location: user.location,
        interests: user.interests,
        skillsToLearn: user.skillsToLearn,
        rating: user.rating,
        walletBalance: wallet.currentBalance
      },
      token
    };
  }

  async getMe(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found.', 404);
    }
    const wallet = await walletService.getWallet(userId);

    return {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profilePicture: user.profilePicture,
      bio: user.bio,
      location: user.location,
      interests: user.interests,
      skillsToLearn: user.skillsToLearn,
      availability: user.availability,
      rating: user.rating,
      isSuspended: user.isSuspended,
      walletBalance: wallet.currentBalance,
      createdAt: user.createdAt
    };
  }

  async forgotPassword(email) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't leak user existence for security
      return { message: 'If an account with that email exists, a password reset token has been issued.' };
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save({ validateBeforeSave: false });

    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
    await emailService.sendPasswordResetEmail(user, resetUrl);

    return {
      message: 'Password reset link sent to your email address.',
      demoToken: resetToken // Included for easy dev/demo testing
    };
  }

  async resetPassword(token, newPassword) {
    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      throw new AppError('Password reset token is invalid or has expired.', 400);
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const authToken = user.generateAuthToken();
    return {
      message: 'Password has been reset successfully.',
      token: authToken
    };
  }
}

module.exports = new AuthService();
