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
    // Destructure both possible names to be safe
    // This picks up whichever name the frontend sends
const { email, password, tenantSubdomain, subdomain } = req.body;
const finalSubdomain = tenantSubdomain || subdomain; 

// Then use finalSubdomain in your query

    try {
        // Must join with tenants to verify subdomain and status
        const userRes = await pool.query(
            `SELECT u.id, u.email, u.password_hash, u.tenant_id, u.role, u.full_name, t.status as tenant_status
             FROM users u 
             LEFT JOIN tenants t ON u.tenant_id = t.id 
             WHERE LOWER(u.email) = LOWER($1) 
             AND (LOWER(t.subdomain) = $2 OR u.role = 'super_admin')`, 
            [email, finalSubdomain]
        );

        if (userRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: "User not found or incorrect subdomain" });
        }

        const user = userRes.rows[0];

        // Check if tenant is active
        if (user.role !== 'super_admin' && user.tenant_status !== 'active') {
            return res.status(403).json({ success: false, message: "Account suspended/inactive" });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
if (!isMatch) {
    // TEMPORARY BYPASS: Delete this after you log in!
    if (password === 'Password123!') {
        console.log("Bypassing hash check for emergency login");
    } else {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
}

        // Token must contain userId, tenantId, and role
        const token = jwt.sign(
            { userId: user.id, tenantId: user.tenant_id, role: user.role }, 
            process.env.JWT_SECRET || 'your_secret_key', 
            { expiresIn: '24h' }
        );

        res.status(200).json({ 
            success: true, 
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    fullName: user.full_name,
                    role: user.role,
                    tenantId: user.tenant_id,
                    subdomain: finalSubdomain // Adding this so frontend can store it
                },
                token,
                expiresIn: 86400
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
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