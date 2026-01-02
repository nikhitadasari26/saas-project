const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController'); // Check this path!
const authenticateToken = require('../middleware/auth'); // If you use auth

router.get('/', authenticateToken, statsController.getTenantStats);

module.exports = router;