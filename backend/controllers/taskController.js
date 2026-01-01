const { pool } = require('../init-db');

// API 16: Create Task
exports.createTask = async (req, res) => {
    // Project ID comes from URL params in Step 3.5 instructions
    const { projectId } = req.params; 
    const { title, description, assignedTo, priority, dueDate } = req.body;
    const { tenantId, userId } = req.user;

    try {
        // 1. Verify project belongs to user's tenant
        const projectCheck = await pool.query(
            'SELECT id FROM projects WHERE id = $1 AND tenant_id = $2', 
            [projectId, tenantId]
        );
        if (projectCheck.rows.length === 0) {
            return res.status(403).json({ success: false, message: "Project access denied" });
        }

        // 2. If assignedTo provided, verify user belongs to same tenant
        if (assignedTo) {
            const userCheck = await pool.query(
                'SELECT id FROM users WHERE id = $1 AND tenant_id = $2', 
                [assignedTo, tenantId]
            );
            if (userCheck.rows.length === 0) {
                return res.status(400).json({ success: false, message: "Assigned user not found in tenant" });
            }
        }

        // 3. Insert Task
        const newTask = await pool.query(
            `INSERT INTO tasks (project_id, tenant_id, title, description, assigned_to, priority, due_date, status) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'todo') RETURNING *`,
            [projectId, tenantId, title, description, assignedTo, priority || 'medium', dueDate]
        );

        // 4. Corrected Audit Log (entity_type/entity_id)
        await pool.query(
            `INSERT INTO audit_logs (tenant_id, user_id, action, entity_type, entity_id) 
             VALUES ($1, $2, $3, $4, $5)`,
            [tenantId, userId, 'CREATE_TASK', 'task', newTask.rows[0].id]
        );

        res.status(201).json({ success: true, data: newTask.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// API 17: List Tasks by Project (with filters)
exports.getTasksByProject = async (req, res) => {
    const { projectId } = req.params;
    const { status, assignedTo, priority, search } = req.query;
    const { tenantId } = req.user;

    try {
        let query = `
            SELECT t.*, u.full_name as "assigneeName" 
            FROM tasks t 
            LEFT JOIN users u ON t.assigned_to = u.id 
            WHERE t.project_id = $1 AND t.tenant_id = $2
        `;
        let params = [projectId, tenantId];

        if (status) {
            params.push(status);
            query += ` AND t.status = $${params.length}`;
        }
        if (assignedTo) {
            params.push(assignedTo);
            query += ` AND t.assigned_to = $${params.length}`;
        }
        if (priority) {
            params.push(priority);
            query += ` AND t.priority = $${params.length}`;
        }
        if (search) {
            params.push(`%${search}%`);
            query += ` AND t.title ILIKE $${params.length}`;
        }

        query += ' ORDER BY t.priority DESC, t.due_date ASC';

        const result = await pool.query(query, params);
        res.status(200).json({ success: true, data: { tasks: result.rows, total: result.rowCount } });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error fetching tasks" });
    }
};

// API 18: Update Task Status
exports.updateTaskStatus = async (req, res) => {
    const { taskId } = req.params;
    const { status } = req.body;
    const { tenantId } = req.user;

    try {
        const result = await pool.query(
            'UPDATE tasks SET status = $1 WHERE id = $2 AND tenant_id = $3 RETURNING *',
            [status, taskId, tenantId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: "Task not found" });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error updating task" });
    }
};

// API 19: Full Task Update (PUT)
exports.updateTask = async (req, res) => {
    const { taskId } = req.params;
    const { title, description, status, priority, assignedTo, dueDate } = req.body;
    const { tenantId, userId } = req.user;

    try {
        // 1. Verify task belongs to user's tenant
        const taskCheck = await pool.query('SELECT id FROM tasks WHERE id = $1 AND tenant_id = $2', [taskId, tenantId]);
        if (taskCheck.rows.length === 0) return res.status(404).json({ success: false, message: "Task not found" });

        // 2. Run Update
        const updatedTask = await pool.query(
            `UPDATE tasks SET 
                title = COALESCE($1, title), 
                description = COALESCE($2, description),
                status = COALESCE($3, status), 
                priority = COALESCE($4, priority),
                assigned_to = COALESCE($5, assigned_to), 
                due_date = COALESCE($6, due_date),
                updated_at = NOW()
             WHERE id = $7 AND tenant_id = $8 RETURNING *`,
            [title, description, status, priority, assignedTo, dueDate, taskId, tenantId]
        );

        // 3. Log to audit_logs
        await pool.query(
            'INSERT INTO audit_logs (tenant_id, user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4, $5)',
            [tenantId, userId, 'UPDATE_TASK', 'task', taskId]
        );

        res.status(200).json({ success: true, message: "Task updated successfully", data: updatedTask.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error during task update" });
    }
};

const pool = require('../config/db');

// GET all tasks for a specific project
exports.getProjectTasks = async (req, res) => {
    const { projectId } = req.params;
    try {
        const result = await pool.query(
            'SELECT * FROM tasks WHERE project_id = $1 AND tenant_id = $2 ORDER BY created_at DESC',
            [projectId, req.user.tenantId]
        );
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error fetching tasks" });
    }
};

// POST Create a new task
exports.createTask = async (req, res) => {
    const { projectId } = req.params;
    const { title, description, priority, status } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO tasks (project_id, tenant_id, title, description, priority, status) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [projectId, req.user.tenantId, title, description, priority || 'medium', status || 'todo']
        );
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error creating task" });
    }
};