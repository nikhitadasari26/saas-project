const express = require('express');
const router = express.Router();

const projectController = require('../controllers/projectController');
const auth = require('../middleware/authMiddleware'); // ✅ THIS WAS MISSING

// Create project
router.post('/', auth, projectController.createProject);

// List projects
router.get('/', auth, projectController.listProjects);

// ✅ Get single project (FIXES 404)
router.get('/:projectId', auth, projectController.getProjectById);

// Update project
router.put('/:projectId', auth, projectController.updateProject);

// Delete project
router.delete('/:projectId', auth, projectController.deleteProject);

module.exports = router;
