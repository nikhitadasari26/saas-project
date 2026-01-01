const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const auth = require('../middleware/authMiddleware');

// Note: API 16 and 17 use project-based paths
router.post('/projects/:projectId/tasks', auth, taskController.createTask);
router.get('/projects/:projectId/tasks', auth, taskController.getTasksByProject);

// Note: API 18 and 19 use task-based paths
router.patch('/:taskId/status', auth, taskController.updateTaskStatus);

router.put('/:taskId', auth, taskController.updateTask);

module.exports = router;