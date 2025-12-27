// List projects - Only for the user's tenant!
exports.getProjects = async (req, res) => {
    const tenantId = req.user.tenantId; 
    // The WHERE clause below is the "Wall" between tenants
    const projects = await db.query('SELECT * FROM projects WHERE tenant_id = $1', [tenantId]);
    res.json({ success: true, data: projects.rows });
};const { pool } = require('../init-db');

// API 12: Create Project
exports.createProject = async (req, res) => {
    const { name, description } = req.body;
    const tenantId = req.user.tenantId; 
    const userId = req.user.userId;

    try {
        // 1. Enforce Subscription Limits (Your existing code)
        const tenantRes = await pool.query('SELECT max_projects FROM tenants WHERE id = $1', [tenantId]);
        const projectCountRes = await pool.query('SELECT COUNT(*) FROM projects WHERE tenant_id = $1', [tenantId]);
        
        if (parseInt(projectCountRes.rows[0].count) >= tenantRes.rows[0].max_projects) {
            return res.status(403).json({ success: false, message: "Project limit reached" });
        }

        // 2. Insert the Project (Your existing code)
        const newProject = await pool.query(
            `INSERT INTO projects (tenant_id, name, description, created_by) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [tenantId, name, description, userId]
        );

        // 3. ADD THIS: Log the creation in audit_logs
        await pool.query(
            `INSERT INTO audit_logs (tenant_id, user_id, action, target_type, target_id) 
             VALUES ($1, $2, $3, $4, $5)`,
            [tenantId, userId, 'CREATE_PROJECT', 'PROJECT', newProject.rows[0].id]
        );

        res.status(201).json({ success: true, data: newProject.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Error creating project" });
    }
};

// API 13: List Projects
exports.listProjects = async (req, res) => {
    const tenantId = req.user.tenantId;

    try {
        const projects = await pool.query(
            'SELECT * FROM projects WHERE tenant_id = $1 ORDER BY created_at DESC', 
            [tenantId]
        );
        res.status(200).json({ success: true, data: projects.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error fetching projects" });
    }
};

exports.updateProject = async (req, res) => {
    const { projectId } = req.params;
    const { name, description, status } = req.body;
    const tenantId = req.user.tenantId;

    try {
        const result = await pool.query(
            `UPDATE projects SET name = $1, description = $2, status = $3 
             WHERE id = $4 AND tenant_id = $5 RETURNING *`,
            [name, description, status, projectId, tenantId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }
        res.status(200).json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error updating project" });
    }
};

// API 15: Delete Project
exports.deleteProject = async (req, res) => {
    const { projectId } = req.params;
    const tenantId = req.user.tenantId;

    try {
        const result = await pool.query(
            'DELETE FROM projects WHERE id = $1 AND tenant_id = $2 RETURNING name',
            [projectId, tenantId]
        );

        if (result.rowCount > 0) {
            // INSERT INTO audit_logs
            await pool.query(
                `INSERT INTO audit_logs (tenant_id, user_id, action, target_type, target_id) 
                 VALUES ($1, $2, $3, $4, $5)`,
                [tenantId, req.user.userId, 'DELETE_PROJECT', 'PROJECT', projectId]
            );
            
            return res.status(200).json({ success: true, message: "Project deleted and logged" });
        }
        res.status(404).json({ success: false, message: "Project not found" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error deleting project" });
    }
};