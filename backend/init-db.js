const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    host: process.env.DB_HOST || 'database',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password123',
    database: process.env.DB_NAME || 'saas_db',
    port: 5432,
});

const initializeDatabase = async () => {
    try {
        console.log(" Initializing database...");
        const sqlPath = path.join(__dirname, 'migrations', '001_initial_schema.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        await pool.query(sql);
        console.log(" Database tables and indexes created.");
    } catch (err) {
        console.error("Initialization Error:", err.message);
        process.exit(1);
    }
};

module.exports = { pool, initializeDatabase };