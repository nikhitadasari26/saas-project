// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Verify that registerTenant and login are actually functions
console.log('Register handler:', typeof authController.registerTenant);
console.log('Login handler:', typeof authController.login);

router.post('/register-tenant', authController.registerTenant);
router.post('/login', authController.login);

module.exports = router;