const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    const { email, password, tenantSubdomain } = req.body;

    try {
        // 1. Verify tenant exists and is active
        const tenantRes = await pool.query(
            'SELECT id, status FROM tenants WHERE subdomain = $1', 
            [tenantSubdomain]
        );
        
        if (tenantRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Tenant not found" });
        }
        
        if (tenantRes.rows[0].status !== 'active') {
            return res.status(403).json({ success: false, message: "Account suspended" });
        }

        const tenantId = tenantRes.rows[0].id;

        // 2. Verify user exists in that specific tenant
        const userRes = await pool.query(
            'SELECT * FROM users WHERE email = $1 AND tenant_id = $2', 
            [email, tenantId]
        );

        if (userRes.rows.length === 0) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const user = userRes.rows[0];

        // 3. Verify password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        // 4. Generate JWT with { userId, tenantId, role }
        const token = jwt.sign(
            { userId: user.id, tenantId: user.tenant_id, role: user.role },
            process.env.JWT_SECRET || 'your_test_secret',
            { expiresIn: '24h' }
        );

        res.status(200).json({
            success: true,
            data: {
                user: { id: user.id, email: user.email, role: user.role, tenantId: user.tenant_id },
                token: token,
                expiresIn: 86400 // 24 hours
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};