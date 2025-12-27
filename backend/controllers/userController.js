const bcrypt = require('bcrypt');
const { pool } = require('../init-db');

exports.addUser = async (req, res) => {
    const { email, password, fullName, role } = req.body;
    const tenantId = req.user.tenantId; // From Auth Middleware

    try {
        // 1. Check current user count vs limit
        const tenantRes = await pool.query('SELECT max_users FROM tenants WHERE id = $1', [tenantId]);
        const userCountRes = await pool.query('SELECT COUNT(*) FROM users WHERE tenant_id = $1', [tenantId]);
        
        const maxUsers = tenantRes.rows[0].max_users;
        const currentUsers = parseInt(userCountRes.rows[0].count);

        if (currentUsers >= maxUsers) {
            return res.status(403).json({ success: false, message: "Subscription limit reached" }); //
        }

        // 2. Hash password and save
        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = await pool.query(
            `INSERT INTO users (tenant_id, email, password_hash, full_name, role) 
             VALUES ($1, $2, $3, $4, $5) RETURNING id, email, role`,
            [tenantId, email, passwordHash, fullName, role || 'user']
        );

        res.status(201).json({ success: true, data: newUser.rows[0] });
    } catch (err) {
        res.status(409).json({ success: false, message: "Email already exists in this tenant" }); //
    }
};