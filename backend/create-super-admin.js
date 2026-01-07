const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'saas_db'
});

async function createSuperAdmin() {
    try {
        console.log('⚡ Creating/Updating Super Admin user...');

        const oldEmail = 'super@admin.com';
        const newEmail = 'superadmin@system.com';
        const password = 'Admin@123';
        const passwordHash = await bcrypt.hash(password, 10);

        // 1. Delete old super admin if exists (cleanup)
        await pool.query('DELETE FROM users WHERE email = $1', [oldEmail]);

        // 2. Check if new email exists
        const check = await pool.query('SELECT id FROM users WHERE email = $1', [newEmail]);

        if (check.rows.length > 0) {
            console.log('ℹ️ User already exists. Updating password...');
            await pool.query('UPDATE users SET password_hash = $1 WHERE email = $2', [passwordHash, newEmail]);
        } else {
            console.log('✨ Creating new Super Admin...');
            await pool.query(
                `INSERT INTO users (tenant_id, email, password_hash, full_name, role)
         VALUES (NULL, $1, $2, $3, $4)`,
                [newEmail, passwordHash, 'System Administrator', 'super_admin']
            );
        }

        console.log('✅ Super Admin credentials updated!');
        console.log(`📧 Email: ${newEmail}`);
        console.log(`🔑 Password: ${password}`);

    } catch (err) {
        console.error('❌ Failed to create Super Admin:', err.message);
    } finally {
        pool.end();
    }
}

createSuperAdmin();
