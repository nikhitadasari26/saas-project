const pool = require('../config/db');

exports.getTenantStats = async (req, res) => {
    const { tenantId } = req.user;
    try {
        // Run multiple counts in one go for efficiency
        const stats = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM projects WHERE tenant_id = $1) as project_count,
                (SELECT COUNT(*) FROM tasks WHERE tenant_id = $1) as task_count,
                (SELECT COUNT(*) FROM users WHERE tenant_id = $1) as user_count,
                (SELECT COUNT(*) FROM tasks WHERE tenant_id = $1 AND status = 'completed') as completed_tasks
        `, [tenantId]);

        res.json({ success: true, data: stats.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error fetching stats" });
    }
};