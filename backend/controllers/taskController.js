const { Task, Project } = require('../models');

/* ================= CREATE TASK ================= */
exports.createTask = async (req, res) => {
  const { projectId } = req.params;
  const { title, priority } = req.body;
  const { tenantId } = req.user;

  try {
    const project = await Project.findOne({ where: { id: projectId, tenantId } });

    if (!project) {
      return res.status(403).json({ success: false, message: 'Project access denied' });
    }

    const task = await Task.create({
      projectId,
      tenantId,
      title,
      priority: priority || 'medium',
      status: 'todo'
    });

    res.status(201).json({ success: true, data: task });
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
    const tasks = await Task.findAll({
      where: { projectId, tenantId },
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, data: { tasks } });
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
    const task = await Task.findOne({ where: { id: taskId, tenantId } });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const updatedTask = await task.update({ status });

    res.json({ success: true, data: updatedTask });
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
    const task = await Task.findOne({ where: { id: taskId, tenantId } });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const updatedTask = await task.update({ title, priority, status });

    res.json({ success: true, data: updatedTask });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating task' });
  }
};
