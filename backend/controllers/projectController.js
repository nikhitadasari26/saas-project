// List projects - Only for the user's tenant!
exports.getProjects = async (req, res) => {
    const tenantId = req.user.tenantId; 
    // The WHERE clause below is the "Wall" between tenants
    const projects = await db.query('SELECT * FROM projects WHERE tenant_id = $1', [tenantId]);
    res.json({ success: true, data: projects.rows });
};