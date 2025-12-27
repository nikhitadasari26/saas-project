const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Mandatory for isolation

// Placeholder: You will create these functions in projectController.js
router.post('/', auth, (req, res) => res.json({ message: "Create project" }));
router.get('/', auth, (req, res) => res.json({ message: "List projects" }));
router.put('/:projectId', auth, (req, res) => res.json({ message: "Update project" }));
router.delete('/:projectId', auth, (req, res) => res.json({ message: "Delete project" }));

module.exports = router;