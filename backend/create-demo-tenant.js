require('dotenv').config({ path: __dirname + '/../.env' }); // Load .env from root
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'saas_db'
});

async function createDemoTenant() {
    try {
        console.log('⚡ Creating/Updating Demo Tenant & Admin...');

        // 1. Create or Find Tenant
        const tenantName = 'Demo Company';
        const subdomain = 'demo';

        let tenantId;

        const tenantCheck = await pool.query('SELECT id FROM tenants WHERE subdomain = $1', [subdomain]);

        if (tenantCheck.rows.length > 0) {
            console.log('ℹ️ Tenant "demo" already exists.');
            tenantId = tenantCheck.rows[0].id;
        } else {
            console.log('✨ Creating new Tenant "Demo Company"...');
            // Insert and return ID
            const tenantRes = await pool.query(
                `INSERT INTO tenants (name, subdomain, status, subscription_plan, max_users, max_projects)
                 VALUES ($1, $2, 'active', 'free', 5, 3)
                 RETURNING id`,
                [tenantName, subdomain]
            );
            tenantId = tenantRes.rows[0].id;
        }

        // 2. Create or Find User
        const email = 'admin@demo.com';
        const password = 'Demo@123';
        const passwordHash = await bcrypt.hash(password, 10);

        const userCheck = await pool.query('SELECT id FROM users WHERE email = $1', [email]);

        if (userCheck.rows.length > 0) {
            console.log('ℹ️ User "admin@demo.com" already exists. Updating password...');
            await pool.query('UPDATE users SET password_hash = $1 WHERE email = $2', [passwordHash, email]);
        } else {
            console.log('✨ Creating Demo Admin user...');
            await pool.query(
                `INSERT INTO users (tenant_id, email, password_hash, full_name, role, is_active)
                 VALUES ($1, $2, $3, $4, $5, true)`,
                [tenantId, email, passwordHash, 'Demo Admin', 'tenant_admin']
            );
        }

        console.log('✅ Demo Tenant & Admin ready!');
        console.log(`🏢 Tenant: ${tenantName} (Subdomain: ${subdomain})`);
        console.log(`📧 Email: ${email}`);
        console.log(`🔑 Password: ${password}`);

    } catch (err) {
        console.error('❌ Failed to create Demo Tenant:', err);
    } finally {
        pool.end();
    }
}

createDemoTenant();
