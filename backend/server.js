const express = require('express');
const cors = require('cors');
const { pool, initializeDatabase } = require('./init-db');

const app = express();

const authRoutes = require('./routes/authRoutes');
const tenantRoutes = require('./routes/tenantRoutes');
const projectRoutes = require('./routes/projectRoutes');

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'], // Allow both ports
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/projects', projectRoutes);

// Mandatory Health Check for Docker Evaluation
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: "ok", database: "connected" });
  } catch (err) {
    res.status(503).json({ status: "error", message: err.message });
  }
});

const startServer = async () => {
  try {
    console.log("Starting database initialization...");
    await initializeDatabase(); // This creates your tables
    
    const PORT = 5000;
    app.listen(PORT, () => {
      console.log(`✅ Backend listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Critical Startup Error:", error);
    process.exit(1); // Force exit so Docker knows it failed
  }
};

startServer();