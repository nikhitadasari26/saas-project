const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { pool } = require('../init-db');

router.get('/stats', auth, async (req, res) => {
  const { tenantId } = req.user;

  try {
    const projects = await pool.query(
      'SELECT COUNT(*) FROM projects WHERE tenant_id = $1',
      [tenantId]
    );

    const activeTasks = await pool.query(
      "SELECT COUNT(*) FROM tasks WHERE tenant_id = $1 AND status != 'completed'",
      [tenantId]
    );

    const completedTasks = await pool.query(
      "SELECT COUNT(*) FROM tasks WHERE tenant_id = $1 AND status = 'completed'",
      [tenantId]
    );

    const users = await pool.query(
      'SELECT COUNT(*) FROM users WHERE tenant_id = $1',
      [tenantId]
    );

    res.json({
      success: true,
      data: {
        totalProjects: projects.rows[0].count,
        activeTasks: activeTasks.rows[0].count,
        completedTasks: completedTasks.rows[0].count,
        teamMembers: users.rows[0].count
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to load stats' });
  }
});

module.exports = router;
