const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'database',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'saas_db',
  port: 5432,
});

const initializeDatabase = async () => {
  let retries = 5;
  while (retries > 0) {
    try {
      await pool.query('SELECT 1');
      console.log('✅ Database connected');

      // STEP 1: Create Tenants FIRST
      await pool.query(`
        CREATE TABLE IF NOT EXISTS tenants (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          subdomain TEXT UNIQUE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // STEP 2: Create Users
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
          full_name TEXT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT DEFAULT 'user',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // STEP 3: Create Projects
      await pool.query(`
        CREATE TABLE IF NOT EXISTS projects (
          id SERIAL PRIMARY KEY,
          tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          description TEXT,
          status TEXT DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      console.log('✅ All tables created successfully');
      return;
    } catch (err) {
      console.log(`❌ Setup failed: ${err.message}. Retries left: ${retries}`);
      retries -= 1;
      await new Promise(res => setTimeout(res, 5000));
    }
  }
  throw new Error('Could not connect to the database');
};

module.exports = { pool, initializeDatabase };