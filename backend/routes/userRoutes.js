const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth'); // Protect routes

router.post('/:tenantId/users', auth, userController.addUser);

module.exports = router;