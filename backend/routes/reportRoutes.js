const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyAuth } = require('../middleware/authMiddleware');
const { validate, reportCreateSchema } = require('../middleware/validationMiddleware');

router.post('/', verifyAuth, validate(reportCreateSchema), reportController.createReport);

module.exports = router;
