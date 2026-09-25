const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');
const { AppError } = require('./errorHandler');

// Protect routes - requires valid JWT
const verifyAuth = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Authentication required. Please log in.', 401));
    }

    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      const currentUser = await User.findById(decoded.id);

      if (!currentUser) {
        return next(
          new AppError('The user belonging to this token no longer exists.', 401)
        );
      }

      if (currentUser.isSuspended) {
        return next(
          new AppError(
            `Your account has been suspended: ${currentUser.suspensionReason || 'Violation of terms.'}`,
            403
          )
        );
      }

      // Attach user to request object
      req.user = currentUser;
      next();
    } catch (err) {
      return next(new AppError('Invalid or expired token. Please log in again.', 401));
    }
  } catch (error) {
    next(error);
  }
};

// Optional auth - attaches user if token exists, but doesn't block guests
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, config.jwtSecret);
        const currentUser = await User.findById(decoded.id);
        if (currentUser && !currentUser.isSuspended) {
          req.user = currentUser;
        }
      } catch (err) {
        // Ignore invalid token in optional auth
      }
    }
    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  verifyAuth,
  optionalAuth
};
