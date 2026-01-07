const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Tenant, sequelize } = require('../models');
const { Op } = require('sequelize');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_123';

/**
 * API 1: Register Tenant
 */
exports.registerTenant = async (req, res) => {
  const { organizationName, subdomain, email, fullName, password } = req.body;
  const t = await sequelize.transaction();

  try {
    const tenant = await Tenant.create({
      name: organizationName,
      subdomain: subdomain
    }, { transaction: t });

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      tenantId: tenant.id,
      full_name: fullName,
      email: email,
      password_hash: hashedPassword,
      role: 'tenant_admin'
    }, { transaction: t });

    await t.commit();

    res.status(201).json({
      success: true,
      message: 'Organization registered successfully'
    });
  } catch (err) {
    await t.rollback();
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
    const { email, password, subdomain } = req.body;
    const urlTenant = req.tenant; // From tenantResolver middleware

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Missing login fields'
      });
    }

    let user;

    if (subdomain) {
      // 1. Subdomain Login: Find Tenant first, then User in that Tenant
      const tenant = await Tenant.findOne({ where: { subdomain: { [Op.iLike]: subdomain } } });

      if (!tenant) {
        return res.status(404).json({ success: false, message: 'Organization not found' });
      }

      user = await User.findOne({
        where: {
          email: { [Op.iLike]: email },
          tenantId: tenant.id
        },
        include: [{ model: Tenant, as: 'tenant' }]
      });

    } else {
      // 2. Super Admin / Global Login (No subdomain provided)
      user = await User.findOne({
        where: {
          email: { [Op.iLike]: email },
          [Op.or]: [
            { tenantId: null },
            { role: 'super_admin' }
          ]
        },
        include: [{ model: Tenant, as: 'tenant' }]
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        tenantId: user.tenantId,
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
          fullName: user.full_name,
          tenantId: user.tenantId,
          tenantSubdomain: user.tenant ? user.tenant.subdomain : null,
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

    const user = await User.findByPk(userId, {
      include: [{
        model: Tenant,
        as: 'tenant'
      }]
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        tenant: user.tenant ? {
          id: user.tenant.id,
          name: user.tenant.name,
          subdomain: user.tenant.subdomain
        } : null
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
