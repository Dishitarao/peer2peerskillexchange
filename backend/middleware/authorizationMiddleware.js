const { AppError } = require('./errorHandler');

// Authorize specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('User authentication context not found.', 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access forbidden: User role '${req.user.role}' is not authorized to access this resource.`,
          403
        )
      );
    }
    next();
  };
};

const adminOnly = authorize('admin');

module.exports = {
  authorize,
  adminOnly
};
