const { pool } = require('../init-db');

/**
 * API 12: Create Project
 */
exports.createProject = async (req, res) => {
  const tenantId = req.user.tenantId;
  const userId = req.user.id;
  const role = req.user.role;

  // ✅ FIX: extract body values
  const { name, description, status } = req.body;

  try {
    // 1. Subscription Limit Check
    const tenantRes = await pool.query(
      'SELECT max_projects FROM tenants WHERE id = $1',
      [tenantId]
    );

    if (tenantRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    const projectCountRes = await pool.query(
      'SELECT COUNT(*) FROM projects WHERE tenant_id = $1',
      [tenantId]
    );

    const currentCount = parseInt(projectCountRes.rows[0].count);
    const maxAllowed = tenantRes.rows[0].max_projects;

    if (currentCount >= maxAllowed) {
      return res.status(403).json({
        success: false,
        message: `Project limit reached. Your plan allows only ${maxAllowed} projects.`,
      });
    }

    // 2. Insert Project
    const newProject = await pool.query(
      `INSERT INTO projects (tenant_id, name, description, status, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
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
    console.error('CREATE PROJECT ERROR:', err);
    res.status(500).json({ success: false, message: 'Error creating project' });
  }
};

/**
 * API 13: List Projects
 */
exports.listProjects = async (req, res) => {
  const tenantId = req.user.tenantId;

  try {
    const query = `
      SELECT p.*, u.full_name AS "creatorName",
        (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) AS "taskCount",
        (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'completed') AS "completedTaskCount"
      FROM projects p
      LEFT JOIN users u ON p.created_by = u.id
      WHERE p.tenant_id = $1
      ORDER BY p.created_at DESC
    `;

    const result = await pool.query(query, [tenantId]);

    res.status(200).json({
      success: true,
      data: { projects: result.rows, total: result.rowCount },
    });
  } catch (err) {
    console.error('LIST PROJECTS ERROR:', err);
    res.status(500).json({ success: false, message: 'Error fetching projects' });
  }
};

/**
 * API 14: Update Project
 */
exports.updateProject = async (req, res) => {
  const { projectId } = req.params;
  const { name, description, status } = req.body;

  // ✅ FIXED
  const tenantId = req.user.tenantId;
  const userId = req.user.id;
  const role = req.user.role;

  try {
    const projectCheck = await pool.query(
      'SELECT created_by FROM projects WHERE id = $1 AND tenant_id = $2',
      [projectId, tenantId]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (role !== 'tenant_admin' && projectCheck.rows[0].created_by !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const result = await pool.query(
      `UPDATE projects
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           status = COALESCE($3, status)
       WHERE id = $4 AND tenant_id = $5
       RETURNING *`,
      [name, description, status, projectId, tenantId]
    );

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: result.rows[0],
    });
  } catch (err) {
    console.error('UPDATE PROJECT ERROR:', err);
    res.status(500).json({ success: false, message: 'Error updating project' });
  }
};

/**
 * API 15: Delete Project
 */
exports.deleteProject = async (req, res) => {
  const { projectId } = req.params;

  // ✅ FIXED
  const tenantId = req.user.tenantId;
  const userId = req.user.id;
  const role = req.user.role;

  try {
    const projectCheck = await pool.query(
      'SELECT created_by FROM projects WHERE id = $1 AND tenant_id = $2',
      [projectId, tenantId]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (role !== 'tenant_admin' && projectCheck.rows[0].created_by !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await pool.query(
      'DELETE FROM projects WHERE id = $1 AND tenant_id = $2',
      [projectId, tenantId]
    );

    await pool.query(
      `INSERT INTO audit_logs (tenant_id, user_id, action, entity_type, entity_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [tenantId, userId, 'DELETE_PROJECT', 'project', projectId]
    );

    res.status(200).json({ success: true, message: 'Project deleted successfully' });
  } catch (err) {
    console.error('DELETE PROJECT ERROR:', err);
    res.status(500).json({ success: false, message: 'Error deleting project' });
  }
};


// API: Get Single Project by ID
exports.getProjectById = async (req, res) => {
  const { projectId } = req.params;
  const { tenantId } = req.user;

  try {
    const result = await pool.query(
      `SELECT * FROM projects WHERE id = $1 AND tenant_id = $2`,
      [projectId, tenantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Error fetching project'
    });
  }
};
