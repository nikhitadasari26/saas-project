const { pool } = require('./init-db');
const bcrypt = require('bcrypt');

async function seed() {
  try {
    console.log('🌱 Starting database seeding...');

    // --- 1. SUPER ADMIN (System Level) ---
    const superAdminEmail = 'superadmin@system.com';
    const superAdminPass = await bcrypt.hash('Admin@123', 10);

    // Check if exists
    const superCheck = await pool.query("SELECT id FROM users WHERE email = $1", [superAdminEmail]);
    if (superCheck.rows.length === 0) {
      await pool.query(
        `INSERT INTO users (tenant_id, email, password_hash, full_name, role)
         VALUES (NULL, $1, $2, $3, 'super_admin')`,
        [superAdminEmail, superAdminPass, 'System Super Admin']
      );
      console.log('✅ Super Admin created');
    } else {
      // Update password just in case
      await pool.query("UPDATE users SET password_hash = $1 WHERE email = $2", [superAdminPass, superAdminEmail]);
      console.log('ℹ️ Super Admin password updated');
    }

    // --- 2. TENANT (Demo Company) ---
    const tenantSubdomain = 'demo';
    let tenantId;

    const tenantCheck = await pool.query("SELECT id FROM tenants WHERE subdomain = $1", [tenantSubdomain]);

    if (tenantCheck.rows.length === 0) {
      const tenantRes = await pool.query(
        `INSERT INTO tenants (name, subdomain, status, subscription_plan, max_users, max_projects)
         VALUES ('Demo Company', $1, 'active', 'pro', 10, 10)
         RETURNING id`,
        [tenantSubdomain]
      );
      tenantId = tenantRes.rows[0].id;
      console.log('✅ Demo Tenant created');
    } else {
      tenantId = tenantCheck.rows[0].id;
      console.log('ℹ️ Demo Tenant exists');
    }

    // --- 3. TENANT ADMIN ---
    const adminEmail = 'admin@demo.com';
    const adminPass = await bcrypt.hash('Demo@123', 10);

    const adminCheck = await pool.query("SELECT id FROM users WHERE email = $1", [adminEmail]);

    if (adminCheck.rows.length === 0) {
      await pool.query(
        `INSERT INTO users (tenant_id, email, password_hash, full_name, role)
         VALUES ($1, $2, $3, 'Demo Admin', 'tenant_admin')`,
        [tenantId, adminEmail, adminPass]
      );
      console.log('✅ Tenant Admin created');
    } else {
      await pool.query("UPDATE users SET password_hash = $1, tenant_id = $2 WHERE email = $3", [adminPass, tenantId, adminEmail]);
      console.log('ℹ️ Tenant Admin updated');
    }

    // --- 4. REGULAR USERS (user1, user2) ---
    const users = [
      { email: 'user1@demo.com', name: 'User One' },
      { email: 'user2@demo.com', name: 'User Two' }
    ];
    const userPass = await bcrypt.hash('User@123', 10);

    for (const u of users) {
      const uCheck = await pool.query("SELECT id FROM users WHERE email = $1", [u.email]);
      if (uCheck.rows.length === 0) {
        await pool.query(
          `INSERT INTO users (tenant_id, email, password_hash, full_name, role)
           VALUES ($1, $2, $3, $4, 'user')`,
          [tenantId, u.email, userPass, u.name]
        );
        console.log(`✅ ${u.name} created`);
      } else {
        await pool.query("UPDATE users SET password_hash = $1, tenant_id = $2 WHERE email = $3", [userPass, tenantId, u.email]);
        console.log(`ℹ️ ${u.name} updated`);
      }
    }

    // --- 5. PROJECTS (Alpha & Beta) ---
    const projects = [
      { name: 'Project Alpha', description: 'First demo project' },
      { name: 'Project Beta', description: 'Second demo project' }
    ];

    // We need a creator ID for the project, pick admin
    const adminIdRes = await pool.query("SELECT id FROM users WHERE email = $1", [adminEmail]);
    const adminId = adminIdRes.rows[0].id;

    const projectIds = [];

    for (const p of projects) {
      const pCheck = await pool.query("SELECT id FROM projects WHERE tenant_id = $1 AND name = $2", [tenantId, p.name]);
      if (pCheck.rows.length === 0) {
        const projRes = await pool.query(
          `INSERT INTO projects (tenant_id, name, description, created_by, status)
           VALUES ($1, $2, $3, $4, 'active')
           RETURNING id`,
          [tenantId, p.name, p.description, adminId]
        );
        projectIds.push(projRes.rows[0].id);
        console.log(`✅ ${p.name} created`);
      } else {
        projectIds.push(pCheck.rows[0].id);
        console.log(`ℹ️ ${p.name} exists`);
      }
    }

    // --- 6. TASKS (5 Tasks) ---
    const tasks = [
      { title: 'Design Database Schema', priority: 'high', projIdx: 0 },
      { title: 'Setup Docker', priority: 'high', projIdx: 0 },
      { title: 'Implement Auth API', priority: 'medium', projIdx: 0 },
      { title: 'Frontend Login Page', priority: 'medium', projIdx: 1 },
      { title: 'User Dashboard', priority: 'low', projIdx: 1 }
    ];

    for (const t of tasks) {
      const targetProjId = projectIds[t.projIdx];
      // Check duplicate by title + project
      const tCheck = await pool.query("SELECT id FROM tasks WHERE project_id = $1 AND title = $2", [targetProjId, t.title]);
      if (tCheck.rows.length === 0) {
        await pool.query(
          `INSERT INTO tasks (tenant_id, project_id, title, description, status, priority)
           VALUES ($1, $2, $3, 'Seeded task for demonstration', 'todo', $4)`,
          [tenantId, targetProjId, t.title, t.priority]
        );
        console.log(`✅ Task "${t.title}" created`);
      } else {
        console.log(`ℹ️ Task "${t.title}" exists`);
      }
    }

    console.log('✅ Seed process completed successfully');
  } catch (err) {
    console.error('❌ Seed failed:', err);
    // Don't exit process, just log error so server can continue if possible
  }
}

module.exports = { seed };
