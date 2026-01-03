const { Pool } = require('pg');

const pool = new Pool({
host: 'localhost',

  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'saas_db',
  port: 5432,
});

const initializeDatabase = async () => {
  try {
    await pool.query('SELECT 1');
    console.log('✅ Database connected (schema already exists)');
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    throw err;
  }
};

module.exports = { pool, initializeDatabase };
