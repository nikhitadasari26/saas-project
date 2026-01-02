const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../init-db');

// API 1: Register Tenant (Step 4.1)
exports.registerTenant = async (req, res) => {
    // Destructure exactly what the frontend sends
    const { organizationName, subdomain, email, fullName, password } = req.body;
    
    try {
        // 1. Check if subdomain is taken
        const existingTenant = await pool.query('SELECT id FROM tenants WHERE subdomain = $1', [subdomain]);
        if (existingTenant.rows.length > 0) {
            return res.status(400).json({ success: false, message: "Subdomain already taken" });
        }

        // 2. Create Tenant (Step 4.1)
        const tenantRes = await pool.query(
            'INSERT INTO tenants (name, subdomain) VALUES ($1, $2) RETURNING id',
            [organizationName, subdomain]
        );
        const tenantId = tenantRes.rows[0].id;

        // 3. Create Admin User
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            'INSERT INTO users (tenant_id, email, full_name, password_hash, role) VALUES ($1, $2, $3, $4, $5)',
            [tenantId, email, fullName, hashedPassword, 'tenant_admin']
        );

        res.status(201).json({ success: true, message: "Tenant and Admin created successfully" });
    } catch (err) {
        // Log the exact DB error to your terminal so you can see it!
        console.error("REGISTRATION DB ERROR:", err.message); 
        res.status(500).json({ success: false, message: "Registration failed: " + err.message });
    }
};

// API 2: Login (Step 4.1)
exports.login = async (req, res) => {
    // Frontend sends 'tenantSubdomain'
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
        
        // Verify Password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        // Generate the JWT token (Step 4.1)
        const token = jwt.sign(
            { id: user.id, email: user.email, tenantId: user.tenant_id, role: user.role },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '24h' }
        );

        // Sending data in the structure expected by the frontend
        res.json({
            success: true,
            data: {
                token,
                user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role }
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