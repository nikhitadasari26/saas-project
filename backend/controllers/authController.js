const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../init-db');

// ✅ SINGLE SOURCE OF TRUTH (THIS WAS MISSING)
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_123';

/**
 * API 1: Register Tenant
 */
exports.registerTenant = async (req, res) => {
  const { organizationName, subdomain, email, fullName, password } = req.body;

  try {
    const tenantRes = await pool.query(
      'INSERT INTO tenants (name, subdomain) VALUES ($1, $2) RETURNING id',
      [organizationName, subdomain]
    );

    const tenantId = tenantRes.rows[0].id;

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users (tenant_id, full_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)`,
      [tenantId, fullName, email, hashedPassword, 'tenant_admin']
    );

    res.status(201).json({
      success: true,
      message: 'Organization registered successfully'
    });
  } catch (err) {
    console.error('REGISTER ERROR:', err);
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
};

/**
 * API 2: Login
 */
exports.login = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const tenantSubdomain = req.body.tenantSubdomain || req.body.subdomain;

    if (!email || !password || !tenantSubdomain) {
      return res.status(400).json({
        success: false,
        message: 'Missing login fields'
      });
    }

    const userRes = await pool.query(
      `SELECT u.*, t.subdomain
       FROM users u
       JOIN tenants t ON u.tenant_id = t.id
       WHERE LOWER(u.email) = LOWER($1)
       AND LOWER(t.subdomain) = LOWER($2)`,
      [email, tenantSubdomain]
    );

    if (userRes.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = userRes.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // ✅ JWT SIGN — SAME SECRET AS MIDDLEWARE
    const token = jwt.sign(
  {
    id: user.id,
    tenantId: user.tenant_id,
    role: user.role
  },
  JWT_SECRET,
  { expiresIn: '24h' }
);


    return res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          tenantId: user.tenant_id,
          role: user.role
        }
      }
    });

  } catch (err) {
    console.error('LOGIN ERROR:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * API 3: Get Current User
 */
exports.getMe = async (req, res) => {
  try {
    const userId = req.user.id;

    const userRes = await pool.query(
      `SELECT u.id, u.email, u.full_name, u.role,
              t.id AS tenant_id, t.name AS tenant_name, t.subdomain
       FROM users u
       LEFT JOIN tenants t ON u.tenant_id = t.id
       WHERE u.id = $1`,
      [userId]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = userRes.rows[0];

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        tenant: {
          id: user.tenant_id,
          name: user.tenant_name,
          subdomain: user.subdomain
        }
      }
    });
  } catch (err) {
    console.error('GET_ME ERROR:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * API 4: Logout
 */
exports.logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};
