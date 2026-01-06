const { pool } = require('../init-db');

/* ================= CREATE TASK ================= */
exports.createTask = async (req, res) => {
  const { projectId } = req.params;
  const { title, priority } = req.body;
  const { tenantId, id: userId } = req.user;

  try {
    const projectCheck = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND tenant_id = $2',
      [projectId, tenantId]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(403).json({ success: false, message: 'Project access denied' });
    }

    const result = await pool.query(
      `INSERT INTO tasks (project_id, tenant_id, title, priority, status)
       VALUES ($1, $2, $3, $4, 'todo')
       RETURNING *`,
      [projectId, tenantId, title, priority || 'medium']
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error creating task' });
  }
};

/* ================= LIST TASKS ================= */
exports.getTasksByProject = async (req, res) => {
  const { projectId } = req.params;
  const { tenantId } = req.user;

  try {
    const result = await pool.query(
      `SELECT * FROM tasks
       WHERE project_id = $1 AND tenant_id = $2
       ORDER BY created_at DESC`,
      [projectId, tenantId]
    );

    res.json({ success: true, data: { tasks: result.rows } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching tasks' });
  }
};

/* ================= UPDATE STATUS ================= */
exports.updateTaskStatus = async (req, res) => {
  const { taskId } = req.params;
  const { status } = req.body;
  const { tenantId } = req.user;

  try {
    const result = await pool.query(
      `UPDATE tasks
       SET status = $1
       WHERE id = $2 AND tenant_id = $3
       RETURNING *`,
      [status, taskId, tenantId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating task' });
  }
};

/* ================= FULL UPDATE ================= */
exports.updateTask = async (req, res) => {
  const { taskId } = req.params;
  const { title, priority, status } = req.body;
  const { tenantId } = req.user;

  try {
    const result = await pool.query(
      `UPDATE tasks
       SET title = COALESCE($1, title),
           priority = COALESCE($2, priority),
           status = COALESCE($3, status),
           updated_at = NOW()
       WHERE id = $4 AND tenant_id = $5
       RETURNING *`,
      [title, priority, status, taskId, tenantId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating task' });
  }
};
