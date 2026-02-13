const { Tenant, User, Project, Task, sequelize } = require('../models');

// API 5: Get Tenant Details
exports.getTenantDetails = async (req, res) => {
    const { tenantId } = req.params;

    // Authorization: User must be super_admin, or tenant_admin of this tenant.
    const isSuperAdmin = req.user.role === 'super_admin';
    const isCorrectTenantAdmin = req.user.role === 'tenant_admin' && req.user.tenantId === tenantId;

    if (!isSuperAdmin && !isCorrectTenantAdmin) {
        return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    try {
        const tenant = await Tenant.findByPk(tenantId);
        if (!tenant) return res.status(404).json({ success: false, message: "Tenant not found" });

        const totalUsers = await User.count({ where: { tenantId } });
        const totalProjects = await Project.count({ where: { tenantId } });
        const totalTasks = await Task.count({ where: { tenantId } });

        res.status(200).json({
            success: true,
            data: {
                ...tenant.toJSON(),
                stats: { totalUsers, totalProjects, totalTasks }
            }
        });
    } catch (err) {
        console.error("GET TENANT DETAILS ERROR:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// API 6: Update Tenant
exports.updateTenant = async (req, res) => {
    const { tenantId } = req.params;
    const { name, status, subscriptionPlan } = req.body;

    // Authorization check
    if (req.user.role !== 'super_admin' && (req.user.role !== 'tenant_admin' || req.user.tenantId !== tenantId)) {
        return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    try {
        const tenant = await Tenant.findByPk(tenantId);
        if (!tenant) return res.status(404).json({ success: false, message: "Tenant not found" });

        const PLAN_LIMITS = {
            free: { maxUsers: 5, maxProjects: 3 },
            pro: { maxUsers: 25, maxProjects: 15 },
            enterprise: { maxUsers: 100, maxProjects: 50 }
        };

        let updateData = {};
        if (req.user.role === 'tenant_admin') {
            // Tenant admins can only update the tenant's name
            if (name) updateData.name = name;
        } else if (req.user.role === 'super_admin') {
            // Super admins can manage plans and status
            updateData = { name, status };

            if (subscriptionPlan && PLAN_LIMITS[subscriptionPlan]) {
                updateData.subscription_plan = subscriptionPlan;
                updateData.max_users = PLAN_LIMITS[subscriptionPlan].maxUsers;
                updateData.max_projects = PLAN_LIMITS[subscriptionPlan].maxProjects;
                updateData.requested_plan = null; // Clear the request
                updateData.status = 'active'; // Ensure tenant is active after approval
            }
        }

        // Remove undefined values so they don't overwrite existing data in the request body
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ success: false, message: "No update data provided." });
        }

        await tenant.update(updateData);

        res.status(200).json({ success: true, message: "Tenant updated successfully" });
    } catch (err) {
        console.error("UPDATE TENANT ERROR:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// API 7: List All Tenants (Super Admin Only)
exports.listAllTenants = async (req, res) => {
    if (req.user.role !== 'super_admin') return res.status(403).json({ success: false, message: "Forbidden" });

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        const { rows: tenants, count: total } = await Tenant.findAndCountAll({
            attributes: {
                include: [
                    [sequelize.literal('(SELECT COUNT(*) FROM "users" WHERE "users"."tenant_id" = "Tenant"."id")'), 'totalUsers'],
                    [sequelize.literal('(SELECT COUNT(*) FROM "projects" WHERE "projects"."tenant_id" = "Tenant"."id")'), 'totalProjects']
                ]
            },
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            success: true,
            data: {
                tenants,
                pagination: { currentPage: page, totalTenants: total, totalPages: Math.ceil(total / limit) }
            }
        });
    } catch (err) {
        console.error("LIST ALL TENANTS ERROR:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// API 8: Request Plan Upgrade (Tenant Admin only)
exports.requestUpgrade = async (req, res) => {
    const { plan } = req.body; // 'pro' or 'enterprise'
    const tenantId = req.user.tenantId;

    if (req.user.role !== 'tenant_admin') {
        return res.status(403).json({ success: false, message: "Only tenant admins can request upgrades." });
    }

    if (!['pro', 'enterprise'].includes(plan)) {
        return res.status(400).json({ success: false, message: "Invalid plan specified." });
    }

    try {
        const tenant = await Tenant.findByPk(tenantId);
        if (!tenant) {
            return res.status(404).json({ success: false, message: "Tenant not found." });
        }

        // Optional: Add logic to prevent requesting the same plan or a downgrade
        if (tenant.subscription_plan === plan) {
            return res.status(400).json({ success: false, message: "You are already on this plan." });
        }
        if (tenant.requested_plan === plan) {
            return res.status(400).json({ success: false, message: "An upgrade to this plan has already been requested." });
        }

        await tenant.update({ requested_plan: plan, status: 'pending_approval' });

        res.status(200).json({ success: true, message: `Upgrade to ${plan} plan requested successfully.` });

    } catch (err) {
        console.error("REQUEST UPGRADE ERROR:", err);
        res.status(500).json({ success: false, message: "Server error while requesting upgrade." });
    }
};