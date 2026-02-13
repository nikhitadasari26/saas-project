const pool = require('../init-db');

exports.getTenantStats = async (req, res) => {
    // Ensure your auth middleware is actually attaching tenantId to req.user
    const tenantId = req.user.tenantId; 
    
    try {
        const stats = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM projects WHERE tenant_id = $1) as project_count,
                (SELECT COUNT(*) FROM tasks WHERE tenant_id = $1) as task_count,
                (SELECT COUNT(*) FROM users WHERE tenant_id = $1) as user_count,
                (SELECT COUNT(*) FROM tasks WHERE tenant_id = $1 AND status = 'completed') as completed_tasks
        `, [tenantId]);

        res.json({ success: true, data: stats.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Error fetching stats" });
    }
};