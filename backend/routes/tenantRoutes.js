const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Protects these routes

// Placeholder: You will create these functions in tenantController.js later
router.get('/:tenantId', auth, (req, res) => res.json({ message: "Tenant details" }));
router.put('/:tenantId', auth, (req, res) => res.json({ message: "Update tenant" }));

module.exports = router;