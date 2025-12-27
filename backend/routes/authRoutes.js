const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Public routes
router.post('/register-tenant', authController.registerTenant);
router.post('/login', authController.login);

module.exports = router;