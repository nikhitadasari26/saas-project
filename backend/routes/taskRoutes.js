const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const taskController = require('../controllers/taskController');

// All task routes require authentication
router.post('/', auth, taskController.createTask);
router.get('/:projectId', auth, taskController.getTasksByProject);

module.exports = router;