const bcrypt = require('bcrypt');
const { User, Tenant } = require('../models');

/**
 * Create a new user within the current tenant.
 */
exports.createUser = async (req, res) => {
  const { email, password, fullName, role } = req.body;
  const { tenantId, role: currentUserRole } = req.user;

  if (currentUserRole !== 'tenant_admin') {
    return res.status(403).json({ success: false, message: "Only tenant admins can create users." });
  }

  try {
    const tenant = await Tenant.findByPk(tenantId);
    if (!tenant) {
      return res.status(404).json({ success: false, message: "Tenant not found" });
    }

    const userCount = await User.count({ where: { tenantId } });
    if (userCount >= tenant.max_users) {
      return res.status(403).json({ success: false, message: "User limit reached for your subscription plan." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      tenantId,
      email,
      password_hash: passwordHash,
      full_name: fullName,
      role: role || 'member'
    });

    // TODO: Audit log

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role,
        isActive: newUser.is_active
      }
    });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ success: false, message: "Email already exists in this tenant" });
    }
    console.error("CREATE USER ERROR:", err);
    res.status(500).json({ success: false, message: "Error creating user" });
  }
};

/**
 * List all users for the current tenant.
 */
exports.listUsers = async (req, res) => {
  const { tenantId, role: currentUserRole } = req.user;

  if (currentUserRole !== 'tenant_admin') {
    return res.status(403).json({ success: false, message: "Only tenant admins can list users." });
  }

  try {
    const users = await User.findAll({
      where: { tenantId },
      attributes: ['id', 'email', 'full_name', 'role', 'is_active', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json({
      success: true,
      data: { users, total: users.length }
    });
  } catch (err) {
    console.error("LIST USERS ERROR:", err);
    res.status(500).json({ success: false, message: "Error fetching users" });
  }
};

/**
 * Update a user's details.
 */
exports.updateUser = async (req, res) => {
  const { userId } = req.params;
  const { fullName, role, isActive } = req.body;
  const { tenantId, id: currentUserId, role: currentUserRole } = req.user;

  try {
    const user = await User.findOne({ where: { id: userId, tenantId } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isSelf = currentUserId === user.id;
    const isAdmin = currentUserRole === 'tenant_admin';

    if (!isSelf && !isAdmin) {
      return res.status(403).json({ success: false, message: "Not authorized to update this user" });
    }

    const updateData = { fullName };
    if (isAdmin) {
      if (role) updateData.role = role;
      if (isActive !== undefined) updateData.is_active = isActive;
    }

    const updatedUser = await user.update(updateData);

    // TODO: Audit log

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.full_name,
        role: updatedUser.role,
        isActive: updatedUser.is_active
      }
    });
  } catch (err) {
    console.error("UPDATE USER ERROR:", err);
    res.status(500).json({ success: false, message: "Error updating user" });
  }
};

/**
 * Delete a user from the tenant.
 */
exports.deleteUser = async (req, res) => {
  const { userId } = req.params;
  const { tenantId, id: currentUserId, role: currentUserRole } = req.user;

  if (parseInt(userId, 10) === currentUserId) {
    return res.status(403).json({ success: false, message: "You cannot delete yourself." });
  }

  if (currentUserRole !== 'tenant_admin') {
    return res.status(403).json({ success: false, message: "Only tenant admins can delete users." });
  }

  try {
    const user = await User.findOne({ where: { id: userId, tenantId } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await user.destroy();

    // TODO: Audit log

    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    console.error("DELETE USER ERROR:", err);
    res.status(500).json({ success: false, message: "Error deleting user" });
  }
};

/**
 * Update the current user's password.
 */
exports.updatePassword = async (req, res) => {
  const { newPassword } = req.body;
  const { id: userId } = req.user;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, message: "Password must be at least 6 characters long." });
  }

  try {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await User.update({ password_hash: passwordHash }, { where: { id: userId } });
    res.json({ success: true, message: "Password updated successfully!" });
  } catch (err) {
    console.error("UPDATE PASSWORD ERROR:", err);
    res.status(500).json({ success: false, message: "Server error during password update" });
  }
};