const { pool } = require('./init-db');
const bcrypt = require('bcrypt');

async function seed() {
  try {
    // 🔍 Check if tenants already exist
    const tenantCheck = await pool.query('SELECT COUNT(*) FROM tenants');
    if (parseInt(tenantCheck.rows[0].count) > 0) {
      console.log('ℹ️ Seed already exists. Skipping seed.');
      process.exit(0);
    }

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

    console.log('✅ Seed data inserted successfully');
    process.exit(0);

  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
