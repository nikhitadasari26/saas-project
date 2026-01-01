const bcrypt = require('bcrypt');
const { pool } = require('../init-db');

// API 8: Add User to Tenant
exports.addUser = async (req, res) => {
    const { email, password, fullName, role } = req.body;
    const tenantId = req.user.tenantId;

    try {
        // 1. Subscription limit check
        const tenantRes = await pool.query('SELECT max_users FROM tenants WHERE id = $1', [tenantId]);
        const userCountRes = await pool.query('SELECT COUNT(*) FROM users WHERE tenant_id = $1', [tenantId]);
        
        if (parseInt(userCountRes.rows[0].count) >= tenantRes.rows[0].max_users) {
            return res.status(403).json({ success: false, message: "Subscription limit reached" });
        }

        // 2. Hash password and save
        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = await pool.query(
            `INSERT INTO users (tenant_id, email, password_hash, full_name, role) 
             VALUES ($1, $2, $3, $4, $5) RETURNING id, email, full_name, role, is_active, created_at`,
            [tenantId, email, passwordHash, fullName, role || 'user']
        );

        // 3. Log action
        await pool.query(
            'INSERT INTO audit_logs (tenant_id, user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4, $5)',
            [tenantId, req.user.userId, 'CREATE_USER', 'user', newUser.rows[0].id]
        );

        res.status(201).json({ 
            success: true, 
            message: "User created successfully", 
            data: newUser.rows[0] 
        });
    } catch (err) {
        res.status(409).json({ success: false, message: "Email already exists in this tenant" });
    }
};

// API 9: List Users
exports.listUsers = async (req, res) => {
    const tenantId = req.user.tenantId;
    try {
        const result = await pool.query(
            'SELECT id, email, full_name, role, is_active, created_at FROM users WHERE tenant_id = $1 ORDER BY created_at DESC',
            [tenantId]
        );
        res.status(200).json({ 
            success: true, 
            data: { users: result.rows, total: result.rowCount } 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error fetching users" });
    }
};

// API 10: Update User
exports.updateUser = async (req, res) => {
    const { userId } = req.params;
    const { fullName, role, isActive } = req.body;
    const tenantId = req.user.tenantId;

    try {
        // Users can update self, but only admins can update roles
        const isSelf = req.user.userId === userId;
        const isAdmin = req.user.role === 'tenant_admin';

        if (!isSelf && !isAdmin) {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        const result = await pool.query(
            `UPDATE users SET 
                full_name = COALESCE($1, full_name), 
                role = CASE WHEN $4 = true THEN COALESCE($2, role) ELSE role END,
                is_active = CASE WHEN $4 = true THEN COALESCE($5, is_active) ELSE is_active END,
                updated_at = NOW()
             WHERE id = $3 AND tenant_id = $6 RETURNING id, email, full_name, role`,
            [fullName, role, userId, isAdmin, isActive, tenantId]
        );

        if (result.rows.length === 0) return res.status(404).json({ success: false, message: "User not found" });

        await pool.query(
            'INSERT INTO audit_logs (tenant_id, user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4, $5)',
            [tenantId, req.user.userId, 'UPDATE_USER', 'user', userId]
        );

        res.status(200).json({ success: true, message: "User updated successfully", data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error updating user" });
    }
};

// API 11: Delete User
exports.deleteUser = async (req, res) => {
    const { userId } = req.params;
    const tenantId = req.user.tenantId;

    // Prevent self-deletion
    if (req.user.userId === userId) {
        return res.status(403).json({ success: false, message: "Cannot delete self" });
    }

    try {
        const result = await pool.query(
            'DELETE FROM users WHERE id = $1 AND tenant_id = $2 RETURNING id',
            [userId, tenantId]
        );

        if (result.rowCount === 0) return res.status(404).json({ success: false, message: "User not found" });

        await pool.query(
            'INSERT INTO audit_logs (tenant_id, user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4, $5)',
            [tenantId, req.user.userId, 'DELETE_USER', 'user', userId]
        );

        res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error deleting user" });
    }
};

exports.updatePassword = async (req, res) => {
    const { newPassword } = req.body;
    const userId = req.user.id; 

    try {
        // 1. Generate hash on the server
        const salt = await bcrypt.genSalt(10);
        const hashedBtn = await bcrypt.hash(newPassword, salt);

        // 2. Update and check if a row was actually changed
        const result = await pool.query(
            'UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING id',
            [hashedBtn, userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: "User not found in database" });
        }

        res.json({ success: true, message: "Password hash updated in DB!" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error during update" });
    }
};