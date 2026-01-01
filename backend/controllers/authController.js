const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../init-db');

// API 1: Register Tenant
exports.registerTenant = async (req, res) => {
    const { tenantName, subdomain, adminEmail, adminPassword, adminFullName } = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Create tenant with default limits
        const tenantRes = await client.query(
            `INSERT INTO tenants (name, subdomain, subscription_plan, max_users, max_projects) 
             VALUES ($1, $2, 'free', 5, 3) RETURNING id, subdomain`,
            [tenantName, subdomain]
        );
        const tenantId = tenantRes.rows[0].id;

        const passwordHash = await bcrypt.hash(adminPassword, 10);
        const userRes = await client.query(
            `INSERT INTO users (tenant_id, email, password_hash, full_name, role) 
             VALUES ($1, $2, $3, $4, 'tenant_admin') RETURNING id, email, full_name, role`,
            [tenantId, adminEmail, passwordHash, adminFullName]
        );

        await client.query('COMMIT');

        // Response must follow exact format
        res.status(201).json({
            success: true,
            message: "Tenant registered successfully",
            data: {
                tenantId: tenantId,
                subdomain: tenantRes.rows[0].subdomain,
                adminUser: userRes.rows[0]
            }
        });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(409).json({ success: false, message: "Subdomain or email already exists" });
    } finally {
        client.release();
    }
};

// API 2: Login
exports.login = async (req, res) => {
    const { email, password, tenantSubdomain } = req.body;

    try {
        const userRes = await pool.query(
            `SELECT u.*, t.status as tenant_status 
             FROM users u 
             JOIN tenants t ON u.tenant_id = t.id 
             WHERE LOWER(u.email) = LOWER($1) AND LOWER(t.subdomain) = LOWER($2)`,
            [email, tenantSubdomain]
        );

        if (userRes.rows.length === 0) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const user = userRes.rows[0];
        
        // Check password normally
        const isMatch = await bcrypt.compare(password, user.password_hash);
        
        // EMERGENCY BYPASS: If normal check fails, check if password is 'Password123!'
        

        
        
        if (!isMatch) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
}

        // Generate the JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, tenantId: user.tenant_id, role: user.role },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            data: {
                token,
                user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role }
            }
        });

    } catch (err) {
        console.error("SERVER ERROR:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
// API 3: Get Current User
exports.getMe = async (req, res) => {
    try {
        const userRes = await pool.query(
            `SELECT u.id, u.email, u.full_name, u.role, u.is_active, 
                    t.id as tenant_id, t.name as tenant_name, t.subdomain, 
                    t.subscription_plan, t.max_users, t.max_projects
             FROM users u 
             LEFT JOIN tenants t ON u.tenant_id = t.id 
             WHERE u.id = $1`,
            [req.user.userId]
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
                isActive: user.is_active,
                tenant: {
                    id: user.tenant_id,
                    name: user.tenant_name,
                    subdomain: user.subdomain,
                    subscriptionPlan: user.subscription_plan,
                    maxUsers: user.max_users,
                    maxProjects: user.max_projects
                }
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// API 4: Logout
exports.logout = async (req, res) => {
    // Log action in audit_logs
    await pool.query(
        'INSERT INTO audit_logs (tenant_id, user_id, action, entity_type) VALUES ($1, $2, $3, $4)',
        [req.user.tenantId, req.user.userId, 'LOGOUT', 'user']
    );

    res.status(200).json({ success: true, message: "Logged out successfully" });
};