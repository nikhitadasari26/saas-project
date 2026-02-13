const { pool } = require('./init-db');
const bcrypt = require('bcrypt');

async function seed() {
  try {
    // 🔍 Check if tenants already exist
    const tenantCheck = await pool.query('SELECT COUNT(*) FROM tenants');
    const tenantCount = parseInt(tenantCheck.rows[0].count);

    if (tenantCount === 0) {
      console.log('🌱 Running seed data...');

      // 1️⃣ Create Tenant
      const tenantRes = await pool.query(
        `INSERT INTO tenants (name, subdomain)
         VALUES ('Demo Organization', 'demo')
         RETURNING id`
      );

      const tenantId = tenantRes.rows[0].id;

      // 2️⃣ Hash password
      const passwordHash = await bcrypt.hash('Demo@123', 10);

      // 3️⃣ Create Admin User
      const userRes = await pool.query(
        `INSERT INTO users (tenant_id, email, password_hash, full_name, role)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [tenantId, 'admin@demo.com', passwordHash, 'Demo Admin', 'tenant_admin']
      );

      const userId = userRes.rows[0].id;

      // 4️⃣ Create Project
      const projectRes = await pool.query(
        `INSERT INTO projects (tenant_id, name, description, created_by)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [tenantId, 'Demo Project', 'Seeded demo project', userId]
      );

      // 5️⃣ Create Task
      await pool.query(
        `INSERT INTO tasks (tenant_id, project_id, title, priority)
         VALUES ($1, $2, $3, $4)`,
        [tenantId, projectRes.rows[0].id, 'Demo Task', 'high']
      );

      console.log('✅ Tenant seed data inserted successfully');
    } else {
      console.log('ℹ️ Tenant seed already exists. Skipping tenant seed.');
    }

    // 6️⃣ Create Super Admin (ALWAYS CHECK)
    const superAdminCheck = await pool.query("SELECT * FROM users WHERE role = 'super_admin'");
    if (superAdminCheck.rows.length === 0) {
      console.log('⚡ Creating Super Admin...');
      const superAdminPass = await bcrypt.hash('Admin@123', 10);
      await pool.query(
        `INSERT INTO users (tenant_id, email, password_hash, full_name, role)
         VALUES (NULL, $1, $2, $3, $4)`,
        ['superadmin@system.com', superAdminPass, 'System Super Admin', 'super_admin']
      );
      console.log('✅ Super Admin created');
    } else {
      console.log('ℹ️ Super Admin already exists');
    }

    console.log('✅ Seed process completed');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    throw err; // Re-throw the error to be caught by the caller
  }
}

module.exports = { seed };
