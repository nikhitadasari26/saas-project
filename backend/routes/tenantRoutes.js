const express = require('express');
const router = express.Router();
const {
    getTenantDetails,
    updateTenant,
    listAllTenants,
    requestUpgrade
} = require('../controllers/tenantController');

// Note: All routes in this file are protected by authMiddleware as defined in server.js

// GET /api/tenants - List all tenants (Super Admin)
// This should be the root route for /api/tenants
router.get('/', listAllTenants);

// POST /api/tenants/request-upgrade - Request a plan upgrade (Tenant Admin)
router.post('/request-upgrade', requestUpgrade);

// GET /api/tenants/:tenantId - Get details for a specific tenant
router.get('/:tenantId', getTenantDetails);

// PUT /api/tenants/:tenantId - Update a tenant
router.put('/:tenantId', updateTenant);

module.exports = router;
