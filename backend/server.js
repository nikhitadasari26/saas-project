const express = require('express');
const cors = require('cors');
const { pool } = require('./init-db');
const { execSync } = require('child_process');
const { seed } = require('./run-seed');

const tenantResolver = require('./middleware/tenantResolver');
const authMiddleware = require('./middleware/authMiddleware');

const authRoutes = require('./routes/authRoutes');
const tenantRoutes = require('./routes/tenantRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

app.use(cors({
  origin: true, // Allow all origins for debugging
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use(tenantResolver);

/* PUBLIC */
app.use('/api/auth', authRoutes);

/* HEALTH - Put this BEFORE protected middleware */
app.get('/api/health', async (req, res) => {
  await pool.query('SELECT 1');
  res.json({ status: 'ok' });
});

/* PROTECTED */
app.use('/api/projects', authMiddleware, projectRoutes);
// taskRoutes already has auth middleware on its routes, so we don't strictly need it here, 
// BUT to be safe and avoid "Get and post error" on other paths, let's keep it but ensure it doesn't block others.
// Actually, since mapped to /api, it should be last.
app.use('/api/tenants', authMiddleware, tenantRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);

// Generic /api mount should be last to avoid catching specific routes above if possible,
// or better, relies on router matching.
// Since taskRoutes defines /projects/... and /tasks/..., we mount at /api.
// REMOVING global authMiddleware here because taskRoutes already includes it per-route
// and mounting at /api with authMiddleware blocks everything else under /api.
app.use('/api', taskRoutes);

const startServer = async () => {
  try {
    console.log('⏳ Running migrations...');
    execSync('npm run migrate', { stdio: 'inherit' });

    await seed();

    app.listen(5000, () => {
      console.log('✅ Backend running on port 5000');
    });

  } catch (err) {
    console.error('❌ Startup failed:', err);
    process.exit(1);
  }
};

startServer();