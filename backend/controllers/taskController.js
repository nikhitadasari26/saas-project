const { pool } = require('../init-db');

// API 16: Create Task
exports.createTask = async (req, res) => {
    const { projectId, title, description, priority, status } = req.body;
    const tenantId = req.user.tenantId;

    try {
        const newTask = await pool.query(
            `INSERT INTO tasks (project_id, tenant_id, title, description, priority, status) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [projectId, tenantId, title, description, priority || 'medium', status || 'todo']
        );

        // Audit Log for Task Creation
        await pool.query(
            `INSERT INTO audit_logs (tenant_id, user_id, action, target_type, target_id) 
             VALUES ($1, $2, $3, $4, $5)`,
            [tenantId, req.user.userId, 'CREATE_TASK', 'TASK', newTask.rows[0].id]
        );

        res.status(201).json({ success: true, data: newTask.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Error creating task" });
    }
};

// API 17: List Tasks by Project
exports.getTasksByProject = async (req, res) => {
    const { projectId } = req.params;
    const tenantId = req.user.tenantId;

    try {
        const tasks = await pool.query(
            'SELECT * FROM tasks WHERE project_id = $1 AND tenant_id = $2 ORDER BY created_at DESC',
            [projectId, tenantId]
        );
        res.status(200).json({ success: true, data: tasks.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error fetching tasks" });
    }
};