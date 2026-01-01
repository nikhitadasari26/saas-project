const { pool } = require('../init-db');

// API 5: Get Tenant Details
exports.getTenantDetails = async (req, res) => {
    const { tenantId } = req.params;
    
    // Authorization: User must belong to this tenant OR be super_admin
    if (req.user.role !== 'super_admin' && req.user.tenantId !== tenantId) {
        return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    try {
        const tenantRes = await pool.query('SELECT * FROM tenants WHERE id = $1', [tenantId]);
        if (tenantRes.rows.length === 0) return res.status(404).json({ success: false, message: "Tenant not found" });

        // Calculate stats (count from related tables)
        const stats = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM users WHERE tenant_id = $1) as "totalUsers",
                (SELECT COUNT(*) FROM projects WHERE tenant_id = $1) as "totalProjects",
                (SELECT COUNT(*) FROM tasks WHERE tenant_id = $1) as "totalTasks"
        `, [tenantId]);

        res.status(200).json({
            success: true,
            data: { ...tenantRes.rows[0], stats: stats.rows[0] }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// API 6: Update Tenant
exports.updateTenant = async (req, res) => {
    const { tenantId } = req.params;
    const { name, status, subscriptionPlan, maxUsers, maxProjects } = req.body;

    if (req.user.role !== 'super_admin' && req.user.tenantId !== tenantId) {
        return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    try {
        // Tenant admins can only update 'name'
        if (req.user.role === 'tenant_admin') {
            await pool.query('UPDATE tenants SET name = $1, updated_at = NOW() WHERE id = $2', [name, tenantId]);
        } else if (req.user.role === 'super_admin') {
            // Super admins can update all fields
            await pool.query(`
                UPDATE tenants SET 
                name = COALESCE($1, name), 
                status = COALESCE($2, status), 
                subscription_plan = COALESCE($3, subscription_plan),
                max_users = COALESCE($4, max_users),
                max_projects = COALESCE($5, max_projects),
                updated_at = NOW() 
                WHERE id = $6`, 
                [name, status, subscriptionPlan, maxUsers, maxProjects, tenantId]
            );
        }

        res.status(200).json({ success: true, message: "Tenant updated successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// API 7: List All Tenants (Super Admin Only)
exports.listAllTenants = async (req, res) => {
    if (req.user.role !== 'super_admin') return res.status(403).json({ success: false, message: "Forbidden" });

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        const tenants = await pool.query(`
            SELECT t.*, 
            (SELECT COUNT(*) FROM users WHERE tenant_id = t.id) as "totalUsers",
            (SELECT COUNT(*) FROM projects WHERE tenant_id = t.id) as "totalProjects"
            FROM tenants t 
            LIMIT $1 OFFSET $2`, [limit, offset]);

        const total = await pool.query('SELECT COUNT(*) FROM tenants');

        res.status(200).json({
            success: true,
            data: {
                tenants: tenants.rows,
                pagination: { currentPage: page, totalTenants: parseInt(total.rows[0].count) }
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};