const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenantController'); // Import your actual controller
const auth = require('../middleware/auth'); // Ensure this matches your middleware filename

// API 7: List All Tenants (Super Admin Only)
router.get('/', auth, tenantController.listAllTenants);

// API 5: Get Tenant Details
router.get('/:tenantId', auth, tenantController.getTenantDetails);

// API 6: Update Tenant
router.put('/:tenantId', auth, tenantController.updateTenant);

module.exports = router;