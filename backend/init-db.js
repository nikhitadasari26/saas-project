const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost', // Ensure this is localhost, not "database"
  database: 'saas_db',
  password: 'postgres', // Change this!
  port: 5432,
});

const initializeDatabase = async () => {
    let retries = 5;
    while (retries > 0) {
        try {
            const client = await pool.connect();
            console.log("✅ Database Connected - Starting Migrations");

            // 1. Create the migrations table first to track progress
            await client.query(`
                CREATE TABLE IF NOT EXISTS migrations (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) UNIQUE NOT NULL,
                    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);

            // 2. Run your migration files
            const migrationsDir = path.join(__dirname, 'migrations');
            const files = fs.readdirSync(migrationsDir).sort();

            for (const file of files) {
                const migrationName = file;
                const check = await client.query('SELECT * FROM migrations WHERE name = $1', [migrationName]);
                
                if (check.rows.length === 0) {
                    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
                    await client.query(sql);
                    await client.query('INSERT INTO migrations (name) VALUES ($1)', [migrationName]);
                    console.log(`Successfully Executed: ${file}`);
                }
            }

            client.release();
            console.log("✅ All Migrations Completed");
            return; // Exit the function successfully
        } catch (err) {
            retries -= 1;
            console.log(`❌ Connection failed (${err.message}). Retries left: ${retries}`);
            if (retries === 0) throw err;
            await new Promise(res => setTimeout(res, 3000)); // Wait 3 seconds
        }
    }
};

module.exports = { pool, initializeDatabase };