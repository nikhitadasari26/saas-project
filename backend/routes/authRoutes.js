const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// ADD THIS LINE: This is what was missing!
const authenticate = require('../middleware/authMiddleware'); 

// Public Routes
router.post('/register-tenant', authController.registerTenant);
router.post('/login', authController.login);

// Protected Routes (Now 'authenticate' is defined)
router.get('/me', authenticate, authController.getMe);
router.post('/logout', authenticate, authController.logout);

module.exports = router;