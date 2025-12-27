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
    const { priority, status } = req.query; // Filters from URL
    const tenantId = req.user.tenantId;

    try {
        // Build a dynamic query to handle optional filters
        let query = 'SELECT * FROM tasks WHERE project_id = $1 AND tenant_id = $2';
        let params = [projectId, tenantId];

        if (priority) {
            params.push(priority);
            query += ` AND priority = $${params.length}`;
        }

        if (status) {
            params.push(status);
            query += ` AND status = $${params.length}`;
        }

        query += ' ORDER BY created_at DESC';

        const tasks = await pool.query(query, params);
        res.status(200).json({ success: true, data: tasks.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Error fetching tasks" });
    }
};
exports.updateTaskStatus = async (req, res) => {
    const { taskId } = req.params;
    const { status } = req.body; // e.g., 'done'
    const tenantId = req.user.tenantId;

    try {
        const result = await pool.query(
            'UPDATE tasks SET status = $1 WHERE id = $2 AND tenant_id = $3 RETURNING *',
            [status, taskId, tenantId]
        );

        if (result.rowCount === 0) return res.status(404).json({ success: false, message: "Task not found" });

        res.status(200).json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error updating task" });
    }
};