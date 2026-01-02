const express = require('express');
const cors = require('cors');
const { pool, initializeDatabase } = require('./init-db');
const path = require('path');
const fs = require('fs');

const app = express();
const authRoutes = require('./routes/authRoutes');
const tenantRoutes = require('./routes/tenantRoutes');
const projectRoutes = require('./routes/projectRoutes');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
const statsRoutes = require('./routes/statsRoutes');

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'], 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/stats', statsRoutes)

// Mandatory Health Check
// Health Check Endpoint (Step 5.2.1)
app.get('/api/health', async (req, res) => {
  try {
    const dbStatus = await pool.query('SELECT 1'); // Check DB connection
    res.status(200).json({ 
      status: "ok", 
      database: "connected" 
    });
  } catch (err) {
    res.status(503).json({ 
      status: "error", 
      database: "disconnected", 
      message: err.message 
    });
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