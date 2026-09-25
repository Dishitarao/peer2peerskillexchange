const Skill = require('../models/Skill');
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');

class SkillService {
  async createSkill(userId, skillData) {
    const skill = await Skill.create({
      userId,
      ...skillData
    });
    return skill;
  }

  async updateSkill(skillId, userId, updateData, userRole = 'user') {
    const skill = await Skill.findById(skillId);
    if (!skill) {
      throw new AppError('Skill not found', 404);
    }

    if (skill.userId.toString() !== userId.toString() && userRole !== 'admin') {
      throw new AppError('You are not authorized to update this skill', 403);
    }

    const updatedSkill = await Skill.findByIdAndUpdate(skillId, updateData, {
      new: true,
      runValidators: true
    });

    return updatedSkill;
  }

  async deleteSkill(skillId, userId, userRole = 'user') {
    const skill = await Skill.findById(skillId);
    if (!skill) {
      throw new AppError('Skill not found', 404);
    }

    if (skill.userId.toString() !== userId.toString() && userRole !== 'admin') {
      throw new AppError('You are not authorized to delete this skill', 403);
    }

    // Soft delete or hard delete: we can set isActive: false
    skill.isActive = false;
    await skill.save();

    return { message: 'Skill deleted successfully' };
  }

  async getSkillById(skillId) {
    const skill = await Skill.findOne({ _id: skillId, isActive: true }).populate(
      'userId',
      'firstName lastName bio location profilePicture rating availability'
    );
    if (!skill) {
      throw new AppError('Skill not found', 404);
    }
    return skill;
  }

  async getMySkills(userId) {
    return await Skill.find({ userId, isActive: true }).sort({ createdAt: -1 });
  }

  async searchSkills({
    search = '',
    category,
    level,
    minRating,
    sortBy = 'newest',
    page = 1,
    limit = 12
  }) {
    const query = { isActive: true, isAvailableToTeach: true };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (level && level !== 'All') {
      query.level = level;
    }

    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { tags: { $in: [new RegExp(search.trim(), 'i')] } }
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sortBy === 'credits-asc') {
      sortOption = { creditsPerHour: 1 };
    } else if (sortBy === 'credits-desc') {
      sortOption = { creditsPerHour: -1 };
    } else if (sortBy === 'title') {
      sortOption = { title: 1 };
    }

    const total = await Skill.countDocuments(query);
    let skills = await Skill.find(query)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('userId', 'firstName lastName bio location profilePicture rating availability isSuspended');

    // Filter out skills whose mentors are suspended
    skills = skills.filter((s) => s.userId && !s.userId.isSuspended);

    // Filter by minRating if specified
    if (minRating && Number(minRating) > 0) {
      skills = skills.filter((s) => (s.userId?.rating?.average || 0) >= Number(minRating));
    }

    return {
      skills,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit)
    };
  }

  async getCategories() {
    return [
      'Programming & Tech',
      'Design & Creative',
      'Languages',
      'Academics & Science',
      'Business & Marketing',
      'Music & Arts',
      'Fitness & Health',
      'Other'
    ];
  }

  async getTrendingSkills() {
    return await Skill.find({ isActive: true, isAvailableToTeach: true })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('userId', 'firstName lastName profilePicture rating');
  }

  async getRecommendedMentors(userId) {
    let interestedSkills = [];
    if (userId) {
      const user = await User.findById(userId);
      if (user && user.skillsToLearn && user.skillsToLearn.length > 0) {
        interestedSkills = user.skillsToLearn;
      }
    }

    let query = { isActive: true, isAvailableToTeach: true };
    if (userId) {
      query.userId = { $ne: userId };
    }

    if (interestedSkills.length > 0) {
      query.$or = interestedSkills.map((keyword) => ({
        $or: [
          { title: { $regex: keyword, $options: 'i' } },
          { tags: { $in: [new RegExp(keyword, 'i')] } }
        ]
      }));
    }

    let recommended = await Skill.find(query)
      .limit(8)
      .populate('userId', 'firstName lastName bio location profilePicture rating availability');

    // Fallback if no matching interested skills found
    if (recommended.length === 0) {
      recommended = await Skill.find(userId ? { userId: { $ne: userId }, isActive: true } : { isActive: true })
        .sort({ 'userId.rating.average': -1 })
        .limit(8)
        .populate('userId', 'firstName lastName bio location profilePicture rating availability');
    }

    return recommended;
  }
}

module.exports = new SkillService();
