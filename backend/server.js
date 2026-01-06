const express = require('express');
const cors = require('cors');
const { pool } = require('./init-db');
const { execSync } = require('child_process');

const authMiddleware = require('./middleware/authMiddleware');

const authRoutes = require('./routes/authRoutes');
const tenantRoutes = require('./routes/tenantRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

/* PUBLIC */
app.use('/api/auth', authRoutes);

/* PROTECTED */
app.use('/api/projects', authMiddleware, projectRoutes);
app.use('/api', authMiddleware, taskRoutes);
app.use('/api/tenants', authMiddleware, tenantRoutes);
app.use('/api/users', authMiddleware, userRoutes);

/* HEALTH */
app.get('/api/health', async (req, res) => {
  await pool.query('SELECT 1');
  res.json({ status: 'ok' });
});

const startServer = async () => {
  try {
    console.log('⏳ Running migrations...');
    execSync('npm run migrate', { stdio: 'inherit' });

    // ✅ Seed ONLY if users table is empty
    const { rows } = await pool.query('SELECT COUNT(*) FROM users');
    if (Number(rows[0].count) === 0) {
      console.log('🌱 Running seed...');
      execSync(
        `psql postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME} -f seed_data.sql`,
        { stdio: 'inherit' }
      );
    } else {
      console.log('✅ Seed skipped (data already exists)');
    }

    app.listen(5000, () => {
      console.log('✅ Backend running on port 5000');
    });

  } catch (err) {
    console.error('❌ Startup failed:', err);
    process.exit(1);
  }
};

startServer();
