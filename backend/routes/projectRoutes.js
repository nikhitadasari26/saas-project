const express = require('express');
const router = express.Router();
// 1. Ensure the filename matches (authMiddleware.js)
// 2. We'll use 'auth' as the variable name here to match your router lines below
const auth = require('../middleware/authMiddleware'); 
const projectController = require('../controllers/projectController');

// These will now work because 'auth' is defined above
router.post('/', auth, projectController.createProject);
router.get('/', auth, projectController.listProjects);
router.put('/:projectId', auth, projectController.updateProject);
router.delete('/:projectId', auth, projectController.deleteProject);

module.exports = router;