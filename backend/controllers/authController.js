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
    const { email, password } = req.body;

    try {
        // Update query to select password_hash
        const userRes = await pool.query(
            `SELECT id, email, password_hash, tenant_id FROM users WHERE email = $1`, 
            [email]
        );

        if (userRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const user = userRes.rows[0];

        // Match the bcrypt check to the correct column name
        const isMatch = await bcrypt.compare(password, user.password_hash);
        
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { userId: user.id, tenantId: user.tenant_id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

        res.status(200).json({ success: true, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};