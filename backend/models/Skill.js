const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required for a skill']
    },
    title: {
      type: String,
      required: [true, 'Skill title/name is required'],
      trim: true,
      maxlength: [100, 'Skill title cannot exceed 100 characters']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Programming & Tech',
        'Design & Creative',
        'Languages',
        'Academics & Science',
        'Business & Marketing',
        'Music & Arts',
        'Fitness & Health',
        'Other'
      ],
      default: 'Programming & Tech'
    },
    level: {
      type: String,
      required: [true, 'Skill proficiency level is required'],
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      default: 'Intermediate'
    },
    description: {
      type: String,
      required: [true, 'Skill description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    creditsPerHour: {
      type: Number,
      required: [true, 'Credit cost per hour/session is required'],
      min: [1, 'Credits must be at least 1'],
      max: [500, 'Credits cannot exceed 500'],
      default: 10
    },
    tags: {
      type: [String],
      default: []
    },
    isAvailableToTeach: {
      type: Boolean,
      default: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Search indexes
skillSchema.index({ title: 'text', description: 'text', tags: 'text' });
skillSchema.index({ category: 1, level: 1, userId: 1 });

module.exports = mongoose.model('Skill', skillSchema);
