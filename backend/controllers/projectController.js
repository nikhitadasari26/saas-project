const { pool } = require('../init-db');

// API 12: Create Project
exports.createProject = async (req, res) => {
    const { name, description, status } = req.body;
    const { tenantId, userId } = req.user;

    try {
        // 1. Subscription Limit Check (KEEP THIS AT THE TOP)
        const tenantRes = await pool.query('SELECT max_projects FROM tenants WHERE id = $1', [tenantId]);
        
        // Safety check: Ensure tenant exists
        if (tenantRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Tenant not found" });
        }

        const projectCountRes = await pool.query('SELECT COUNT(*) FROM projects WHERE tenant_id = $1', [tenantId]);
        
        const currentCount = parseInt(projectCountRes.rows[0].count);
        const maxAllowed = tenantRes.rows[0].max_projects;

        // The Limit Logic
        if (currentCount >= maxAllowed) {
            return res.status(403).json({ 
                success: false, 
                message: `Project limit reached. Your plan allows only ${maxAllowed} projects.` 
            });
        }

        // 2. Insert Project
        const newProject = await pool.query(
            `INSERT INTO projects (tenant_id, name, description, status, created_by) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [tenantId, name, description, status || 'active', userId]
        );

        // 3. Audit Log
        await pool.query(
            `INSERT INTO audit_logs (tenant_id, user_id, action, entity_type, entity_id) 
             VALUES ($1, $2, $3, $4, $5)`,
            [tenantId, userId, 'CREATE_PROJECT', 'project', newProject.rows[0].id]
        );

        res.status(201).json({ success: true, data: newProject.rows[0] });
    } catch (err) {
        console.error(err); // Log the error to Docker console for debugging
        res.status(500).json({ success: false, message: "Error creating project" });
    }
};
// API 13: List Projects (With Task Counts)
exports.listProjects = async (req, res) => {
    const { tenantId } = req.user;
    try {
        const query = `
            SELECT p.*, u.full_name as "creatorName",
            (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as "taskCount",
            (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'completed') as "completedTaskCount"
            FROM projects p
            LEFT JOIN users u ON p.created_by = u.id
            WHERE p.tenant_id = $1 
            ORDER BY p.created_at DESC`;
        
        const result = await pool.query(query, [tenantId]);
        res.status(200).json({ success: true, data: { projects: result.rows, total: result.rowCount } });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error fetching projects" });
    }
};

// API 14: Update Project
exports.updateProject = async (req, res) => {
    const { projectId } = req.params;
    const { name, description, status } = req.body;
    const { tenantId, userId, role } = req.user;

    try {
        // Check if user is owner or admin
        const projectCheck = await pool.query('SELECT created_by FROM projects WHERE id = $1 AND tenant_id = $2', [projectId, tenantId]);
        if (projectCheck.rows.length === 0) return res.status(404).json({ success: false, message: "Project not found" });

        if (role !== 'tenant_admin' && projectCheck.rows[0].created_by !== userId) {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        const result = await pool.query(
            `UPDATE projects SET name = COALESCE($1, name), description = COALESCE($2, description), status = COALESCE($3, status) 
             WHERE id = $4 AND tenant_id = $5 RETURNING *`,
            [name, description, status, projectId, tenantId]
        );

        res.status(200).json({ success: true, message: "Project updated successfully", data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error updating project" });
    }
};

// API 15: Delete Project
exports.deleteProject = async (req, res) => {
    const { projectId } = req.params;
    const { tenantId, userId, role } = req.user;

    try {
        const projectCheck = await pool.query('SELECT created_by FROM projects WHERE id = $1 AND tenant_id = $2', [projectId, tenantId]);
        if (projectCheck.rows.length === 0) return res.status(404).json({ success: false, message: "Project not found" });

        if (role !== 'tenant_admin' && projectCheck.rows[0].created_by !== userId) {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        await pool.query('DELETE FROM projects WHERE id = $1 AND tenant_id = $2', [projectId, tenantId]);
        
        await pool.query(
            `INSERT INTO audit_logs (tenant_id, user_id, action, entity_type, entity_id) 
             VALUES ($1, $2, $3, $4, $5)`,
            [tenantId, userId, 'DELETE_PROJECT', 'project', projectId]
        );

        res.status(200).json({ success: true, message: "Project deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error deleting project" });
    }
};