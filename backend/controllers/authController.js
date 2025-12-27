const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../init-db');

// API 1: Register Tenant
exports.registerTenant = async (req, res) => {
    const { tenantName, subdomain, adminEmail, adminPassword, adminFullName } = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        const tenantRes = await client.query(
            `INSERT INTO tenants (name, subdomain, subscription_plan) 
             VALUES ($1, $2, 'free') RETURNING id`, 
            [tenantName, subdomain]
        );
        const tenantId = tenantRes.rows[0].id;

        const passwordHash = await bcrypt.hash(adminPassword, 10);
        await client.query(
            `INSERT INTO users (tenant_id, email, password_hash, full_name, role) 
             VALUES ($1, $2, $3, $4, 'tenant_admin')`,
            [tenantId, adminEmail, passwordHash, adminFullName]
        );

        await client.query('COMMIT');
        res.status(201).json({ 
            success: true, 
            message: "Tenant registered",
            data: { tenantId: tenantId } 
        });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(409).json({ success: false, message: "Subdomain or email exists" });
    } finally {
        client.release();
    }
};

// API 2: Login
// This MUST be named "login" to match your authRoutes.js
exports.login = async (req, res) => {
    const { email, password, tenantSubdomain } = req.body;
    try {
        const tenantRes = await pool.query('SELECT id FROM tenants WHERE subdomain = $1', [tenantSubdomain]);
        if (tenantRes.rows.length === 0) return res.status(404).json({ success: false, message: "Tenant not found" });

        const userRes = await pool.query('SELECT * FROM users WHERE email = $1 AND tenant_id = $2', [email, tenantRes.rows[0].id]);
        if (userRes.rows.length === 0) return res.status(401).json({ success: false, message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, userRes.rows[0].password_hash);
        if (!isMatch) return res.status(401).json({ success: false, message: "Invalid credentials" });

        const token = jwt.sign(
            { userId: userRes.rows[0].id, tenantId: userRes.rows[0].tenant_id, role: userRes.rows[0].role },
            process.env.JWT_SECRET || 'your_test_secret',
            { expiresIn: '24h' }
        );

        res.status(200).json({ success: true, token });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};