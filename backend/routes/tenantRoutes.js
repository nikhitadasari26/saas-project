const express = require('express');
const router = express.Router();
const { pool } = require('../init-db');

// GET users for a tenant
router.get('/:tenantId/users', async (req, res) => {
  const { tenantId } = req.params;

  // extra safety
  if (tenantId !== req.user.tenantId) {
    return res.status(403).json({ message: 'Access denied' });
  }

  const result = await pool.query(
    'SELECT id, full_name, email, role FROM users WHERE tenant_id = $1',
    [tenantId]
  );

  res.json({ success: true, data: result.rows });
});

// CREATE user for a tenant
router.post('/:tenantId/users', async (req, res) => {
  const { tenantId } = req.params;
  const { fullName, email, password, role } = req.body;

  if (tenantId !== req.user.tenantId) {
    return res.status(403).json({ message: 'Access denied' });
  }

  const bcrypt = require('bcrypt');
  const hashed = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `INSERT INTO users (tenant_id, full_name, email, password_hash, role)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING id, full_name, email, role`,
    [tenantId, fullName, email, hashed, role || 'user']
  );

  res.status(201).json({ success: true, data: result.rows[0] });
});

module.exports = router;
