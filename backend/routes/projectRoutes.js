const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const projectController = require('../controllers/projectController');

// Ensure these names match the controller exports above
router.post('/', auth, projectController.createProject);
router.get('/', auth, projectController.listProjects);
router.put('/:projectId', auth, projectController.updateProject); // Update
router.delete('/:projectId', auth, projectController.deleteProject);

module.exports = router;