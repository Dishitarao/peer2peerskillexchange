const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skillController');
const { verifyAuth, optionalAuth } = require('../middleware/authMiddleware');
const {
  validate,
  skillCreateSchema,
  skillUpdateSchema
} = require('../middleware/validationMiddleware');

router.get('/categories', skillController.getCategories);
router.get('/trending', skillController.getTrendingSkills);
router.get('/recommendations', optionalAuth, skillController.getRecommendedMentors);
router.get('/search', skillController.searchSkills);
router.get('/my-skills', verifyAuth, skillController.getMySkills);
router.get('/:skillId', skillController.getSkillById);
router.post('/', verifyAuth, validate(skillCreateSchema), skillController.createSkill);
router.put('/:skillId', verifyAuth, validate(skillUpdateSchema), skillController.updateSkill);
router.delete('/:skillId', verifyAuth, skillController.deleteSkill);

module.exports = router;
