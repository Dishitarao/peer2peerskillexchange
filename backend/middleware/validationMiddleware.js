const Joi = require('joi');
const { AppError } = require('./errorHandler');

// Validation middleware generator
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorDetails = error.details.map((detail) => detail.message).join('; ');
      return next(new AppError(`Validation error: ${errorDetails}`, 400));
    }

    req[property] = value;
    next();
  };
};

// Validation Schemas
const registerSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).required().messages({
    'string.empty': 'First name cannot be empty',
    'any.required': 'First name is required'
  }),
  lastName: Joi.string().trim().min(1).max(50).required().messages({
    'string.empty': 'Last name cannot be empty',
    'any.required': 'Last name is required'
  }),
  email: Joi.string().trim().email().required().messages({
    'string.email': 'Please provide a valid email',
    'any.required': 'Email is required'
  }),
  phone: Joi.string().trim().allow('').optional(),
  password: Joi.string().min(6).max(100).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required'
  }),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Passwords do not match',
    'any.required': 'Confirm password is required'
  }),
  bio: Joi.string().allow('').max(1000).optional(),
  location: Joi.string().allow('').max(100).optional(),
  interests: Joi.array().items(Joi.string()).optional(),
  skillsToLearn: Joi.array().items(Joi.string()).optional()
});

const loginSchema = Joi.object({
  email: Joi.string().trim().required().messages({
    'any.required': 'Email or phone is required'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'any.required': 'Email is required'
  })
});

const resetPasswordSchema = Joi.object({
  password: Joi.string().min(6).required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required()
});

const profileUpdateSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50),
  lastName: Joi.string().trim().min(1).max(50),
  phone: Joi.string().trim().allow(''),
  bio: Joi.string().allow('').max(1000),
  location: Joi.string().allow('').max(100),
  profilePicture: Joi.string().allow(''),
  interests: Joi.array().items(Joi.string()),
  skillsToLearn: Joi.array().items(Joi.string()),
  availability: Joi.array().items(
    Joi.object({
      day: Joi.string().valid(
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday'
      ),
      startTime: Joi.string(),
      endTime: Joi.string()
    })
  )
});

const skillCreateSchema = Joi.object({
  title: Joi.string().trim().min(2).max(100).required(),
  category: Joi.string()
    .valid(
      'Programming & Tech',
      'Design & Creative',
      'Languages',
      'Academics & Science',
      'Business & Marketing',
      'Music & Arts',
      'Fitness & Health',
      'Other'
    )
    .required(),
  level: Joi.string().valid('Beginner', 'Intermediate', 'Advanced', 'Expert').required(),
  description: Joi.string().min(10).max(2000).required(),
  creditsPerHour: Joi.number().min(1).max(500).required(),
  tags: Joi.array().items(Joi.string()).optional(),
  isAvailableToTeach: Joi.boolean().optional()
});

const skillUpdateSchema = Joi.object({
  title: Joi.string().trim().min(2).max(100),
  category: Joi.string().valid(
    'Programming & Tech',
    'Design & Creative',
    'Languages',
    'Academics & Science',
    'Business & Marketing',
    'Music & Arts',
    'Fitness & Health',
    'Other'
  ),
  level: Joi.string().valid('Beginner', 'Intermediate', 'Advanced', 'Expert'),
  description: Joi.string().min(10).max(2000),
  creditsPerHour: Joi.number().min(1).max(500),
  tags: Joi.array().items(Joi.string()),
  isAvailableToTeach: Joi.boolean(),
  isActive: Joi.boolean()
});

const sessionRequestSchema = Joi.object({
  mentorId: Joi.string().hex().length(24).required(),
  skillId: Joi.string().hex().length(24).required(),
  sessionDate: Joi.date().iso().required(),
  startTime: Joi.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/).required().messages({
    'string.pattern.base': 'Start time must be formatted as HH:mm (e.g., 14:00)'
  }),
  durationMinutes: Joi.number().min(15).max(240).default(60),
  notes: Joi.string().allow('').max(1000).optional()
});

const reviewCreateSchema = Joi.object({
  sessionId: Joi.string().hex().length(24).required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  reviewText: Joi.string().trim().min(5).max(1000).required()
});

const reportCreateSchema = Joi.object({
  reportedUserId: Joi.string().hex().length(24).allow(null).optional(),
  reportedSkillId: Joi.string().hex().length(24).allow(null).optional(),
  reportedReviewId: Joi.string().hex().length(24).allow(null).optional(),
  reportType: Joi.string()
    .valid(
      'INAPPROPRIATE_SKILL',
      'INAPPROPRIATE_USER',
      'INAPPROPRIATE_REVIEW',
      'DISPUTE',
      'ABUSE',
      'OTHER'
    )
    .required(),
  reason: Joi.string().trim().min(3).max(200).required(),
  description: Joi.string().trim().min(10).max(2000).required()
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  profileUpdateSchema,
  skillCreateSchema,
  skillUpdateSchema,
  sessionRequestSchema,
  reviewCreateSchema,
  reportCreateSchema
};
