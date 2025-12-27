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
    const tenantId = req.user.tenantId; // From Auth Middleware
    const userId = req.user.userId;

    try {
        // Enforce Subscription Limits
        const tenantRes = await pool.query('SELECT max_projects FROM tenants WHERE id = $1', [tenantId]);
        const projectCountRes = await pool.query('SELECT COUNT(*) FROM projects WHERE tenant_id = $1', [tenantId]);
        
        if (parseInt(projectCountRes.rows[0].count) >= tenantRes.rows[0].max_projects) {
            return res.status(403).json({ success: false, message: "Project limit reached" });
        }

        const newProject = await pool.query(
            `INSERT INTO projects (tenant_id, name, description, created_by) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [tenantId, name, description, userId]
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