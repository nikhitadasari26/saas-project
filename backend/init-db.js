const { Pool } = require('pg');
const { execSync } = require('child_process');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const initializeDatabase = async () => {
  try {
    console.log('⏳ Running database migrations...');
    execSync('npx node-pg-migrate up', { stdio: 'inherit' });

    await pool.query('SELECT 1');
    console.log('✅ Database ready with tables');
  } catch (err) {
    console.error('❌ Database initialization failed:', err);
    throw err;
  }
};

module.exports = { pool, initializeDatabase };
