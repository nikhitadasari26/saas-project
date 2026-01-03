const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../init-db');

// API 1: Register Tenant (Step 4.1)
// FIND THIS FUNCTION IN authController.js
exports.registerTenant = async (req, res) => {
    const { organizationName, subdomain, email, fullName, password } = req.body;
    try {
        const tenantRes = await pool.query(
            'INSERT INTO tenants (name, subdomain) VALUES ($1, $2) RETURNING id',
            [organizationName, subdomain]
        );
        const tenantId = tenantRes.rows[0].id;
        const hashedPassword = await bcrypt.hash(password, 10);

        // FIXED INSERT QUERY
        await pool.query(
            'INSERT INTO users (tenant_id, full_name, email, password, role) VALUES ($1, $2, $3, $4, $5)',
            [tenantId, fullName, email, hashedPassword, 'admin']
        );

        res.status(201).json({ success: true, message: "Organization registered successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.login = async (req, res) => {
    const { email, password, tenantSubdomain } = req.body;

    try {
        // FIXED: Removed t.status because it isn't in your DB schema
        const userRes = await pool.query(
            `SELECT u.*, t.name as tenant_name 
             FROM users u 
             JOIN tenants t ON u.tenant_id = t.id 
             WHERE LOWER(u.email) = LOWER($1) AND LOWER(t.subdomain) = LOWER($2)`,
            [email, tenantSubdomain]
        );

        if (userRes.rows.length === 0) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const user = userRes.rows[0];
        
        // Verify Password - Uses 'password' column from your init-db.js
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, tenantId: user.tenant_id, role: user.role },
            process.env.JWT_SECRET || 'your_super_secret_key_123',
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            data: {
                token,
                user: { id: user.id, email: user.email, role: user.role }
            }
        });

    } catch (err) {
        console.error("SERVER LOGIN ERROR:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// API 3: Get Current User (Step 4.1 & 4.2)
exports.getMe = async (req, res) => {
    try {
        // Note: Ensure your auth middleware sets req.user.id correctly
        const userId = req.user.id; 

        const userRes = await pool.query(
            `SELECT u.id, u.email, u.full_name, u.role, u.is_active, 
                    t.id as tenant_id, t.name as tenant_name, t.subdomain 
             FROM users u 
             LEFT JOIN tenants t ON u.tenant_id = t.id 
             WHERE u.id = $1`,
            [userId]
        );

        if (userRes.rows.length === 0) return res.status(404).json({ success: false, message: "User not found" });

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
        console.error("GET_ME ERROR:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// API 4: Logout (Step 4.1)
exports.logout = async (req, res) => {
    res.status(200).json({ success: true, message: "Logged out successfully" });
};