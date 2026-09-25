const skillService = require('../services/skillService');

class SkillController {
  async createSkill(req, res, next) {
    try {
      const skill = await skillService.createSkill(req.user._id, req.body);
      res.status(201).json({
        success: true,
        message: 'Skill listing created successfully.',
        data: skill
      });
    } catch (error) {
      next(error);
    }
  }

  async updateSkill(req, res, next) {
    try {
      const updatedSkill = await skillService.updateSkill(
        req.params.skillId,
        req.user._id,
        req.body,
        req.user.role
      );
      res.status(200).json({
        success: true,
        message: 'Skill updated successfully.',
        data: updatedSkill
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteSkill(req, res, next) {
    try {
      const result = await skillService.deleteSkill(
        req.params.skillId,
        req.user._id,
        req.user.role
      );
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  async getSkillById(req, res, next) {
    try {
      const skill = await skillService.getSkillById(req.params.skillId);
      res.status(200).json({
        success: true,
        data: skill
      });
    } catch (error) {
      next(error);
    }
  }

  async getMySkills(req, res, next) {
    try {
      const skills = await skillService.getMySkills(req.user._id);
      res.status(200).json({
        success: true,
        data: skills
      });
    } catch (error) {
      next(error);
    }
  }

  async searchSkills(req, res, next) {
    try {
      const results = await skillService.searchSkills(req.query);
      res.status(200).json({
        success: true,
        data: results
      });
    } catch (error) {
      next(error);
    }
  }

  async getCategories(req, res, next) {
    try {
      const categories = await skillService.getCategories();
      res.status(200).json({
        success: true,
        data: categories
      });
    } catch (error) {
      next(error);
    }
  }

  async getTrendingSkills(req, res, next) {
    try {
      const trending = await skillService.getTrendingSkills();
      res.status(200).json({
        success: true,
        data: trending
      });
    } catch (error) {
      next(error);
    }
  }

  async getRecommendedMentors(req, res, next) {
    try {
      const userId = req.user ? req.user._id : null;
      const recommended = await skillService.getRecommendedMentors(userId);
      res.status(200).json({
        success: true,
        data: recommended
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SkillController();
