const express = require('express');
const router = express.Router();

const taskController = require('../controllers/taskController');
const auth = require('../middleware/authMiddleware');

/* Project based */
router.post('/projects/:projectId/tasks', auth, taskController.createTask);
router.get('/projects/:projectId/tasks', auth, taskController.getTasksByProject);

/* Task based */
router.patch('/tasks/:taskId/status', auth, taskController.updateTaskStatus);
router.put('/tasks/:taskId', auth, taskController.updateTask);

module.exports = router;
