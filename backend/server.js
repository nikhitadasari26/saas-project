const express = require('express');
const cors = require('cors');
const { pool, initializeDatabase } = require('./init-db');

const app = express();
const authRoutes = require('./routes/authRoutes');
const tenantRoutes = require('./routes/tenantRoutes');
const projectRoutes = require('./routes/projectRoutes');
const userRoutes = require('./routes/userRoutes');


app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tenants', userRoutes);

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