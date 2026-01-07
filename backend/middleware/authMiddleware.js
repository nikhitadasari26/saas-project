const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_123';

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication token is required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'tenantId', 'role', 'is_active']
    });

    if (!user || !user.is_active) {
      return res.status(401).json({ message: 'User not found or is inactive' });
    }

    // Tenant verification: ONLY enforce if we are ON a tenant subdomain
    if (req.tenant && user.role !== 'super_admin') {
      if (user.tenantId !== req.tenant.id) {
        return res.status(403).json({ message: 'Forbidden: You are logged in, but this workspace belongs to another organization.' });
      }
    }

    // REMOVED: The block that blocked users accessing root domain.
    // Why? Because login often happens at root, and redirects happen after.
    // Strict enforcement here causes a loop if the frontend calls root API first.


    req.user = user.toJSON();

    next();
  } catch (err) {
    console.error('JWT VERIFY FAILED:', err.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
