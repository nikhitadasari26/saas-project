const { Project, Tenant, User, Task, sequelize } = require('../models');

/**
 * API 12: Create Project
 */
exports.createProject = async (req, res) => {
  const { tenantId, id: userId, role } = req.user;
  const { name, description, status } = req.body;

  // RBAC: Only tenant admins can create projects
  if (role !== 'tenant_admin') {
    return res.status(403).json({ success: false, message: 'Only tenant admins can create projects.' });
  }

  try {
    const tenant = await Tenant.findByPk(tenantId);
    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    const projectCount = await Project.count({ where: { tenantId } });

    if (projectCount >= tenant.max_projects) {
      return res.status(403).json({
        success: false,
        message: `Project limit reached. Your plan allows only ${tenant.max_projects} projects.`,
      });
    }

    const newProject = await Project.create({
      tenantId,
      name,
      description,
      status: status || 'active',
      createdBy: userId,
    });

    // TODO: Add audit log here when the model is created.

    res.status(201).json({ success: true, data: newProject });
  } catch (err) {
    console.error('CREATE PROJECT ERROR:', err);
    res.status(500).json({ success: false, message: 'Error creating project' });
  }
};

/**
 * API 13: List Projects
 */
exports.listProjects = async (req, res) => {
  const { tenantId } = req.user;

  try {
    const { rows: projects, count: total } = await Project.findAndCountAll({
      where: { tenantId },
      include: [{
        model: User,
        as: 'creator',
        attributes: ['full_name']
      }],
      attributes: {
        include: [
          [sequelize.literal('(SELECT COUNT(*) FROM "tasks" WHERE "tasks"."project_id" = "Project"."id")'), 'taskCount'],
          [sequelize.literal('(SELECT COUNT(*) FROM "tasks" WHERE "tasks"."project_id" = "Project"."id" AND "tasks"."status" = \'completed\')'), 'completedTaskCount']
        ]
      },
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: { projects, total },
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
  const { tenantId, id: userId, role } = req.user;

  try {
    const project = await Project.findOne({ where: { id: projectId, tenantId } });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (role !== 'tenant_admin' && project.createdBy !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updatedProject = await project.update({ name, description, status });

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: updatedProject,
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
  const { tenantId, id: userId, role } = req.user;

  try {
    const project = await Project.findOne({ where: { id: projectId, tenantId } });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (role !== 'tenant_admin' && project.createdBy !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await project.destroy();

    // TODO: Add audit log here when the model is created.

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
    const project = await Project.findOne({ where: { id: projectId, tenantId } });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Error fetching project'
    });
  }
};
