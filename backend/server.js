const express = require('express');
const cors = require('cors');
const { pool, initializeDatabase } = require('./init-db');

const authMiddleware = require('./middleware/authMiddleware');

const authRoutes = require('./routes/authRoutes');
const tenantRoutes = require('./routes/tenantRoutes');
const projectRoutes = require('./routes/projectRoutes');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

/* ================= MIDDLEWARE ================= */

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

/* ================= ROUTES ================= */

// 🔓 Public (NO token)
app.use('/api/auth', authRoutes);

// 🔐 Protected (token REQUIRED)
app.use('/api/tenants', authMiddleware, tenantRoutes);
app.use('/api/tenants', authMiddleware, userRoutes);   // ✅ /api/tenants/:tenantId/users

app.use('/api/projects', authMiddleware, projectRoutes);
app.use('/api/projects', authMiddleware, taskRoutes);  // ✅ /api/projects/:projectId/tasks

// Health check (public)
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(503).json({ status: 'error', message: err.message });
  }
});

/* ================= START SERVER ================= */

const startServer = async () => {
  try {
    console.log('Starting database initialization...');
    await initializeDatabase();

    const PORT = 5000;
    app.listen(PORT, () => {
      console.log(`✅ Backend listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Critical Startup Error:', error);
    process.exit(1);
  }
};

startServer();
