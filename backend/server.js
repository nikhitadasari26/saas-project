const express = require('express');
const cors = require('cors');
const { pool, initializeDatabase } = require('./init-db');

const app = express();
app.use(cors());
app.use(express.json());

// Mandatory Health Check
app.get('/api/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.status(200).json({ status: "ok", database: "connected" });
    } catch (err) {
        res.status(500).json({ status: "error", database: "disconnected" });
    }
});

const startServer = async () => {
    // RUN MIGRATIONS AUTOMATICALLY
    await initializeDatabase();
    
    const PORT = 5000;
    app.listen(PORT, () => {
        console.log(`Backend running on port ${PORT}`);
    });
};

startServer();