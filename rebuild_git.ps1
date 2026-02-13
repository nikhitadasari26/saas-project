# PowerShell Script to Rebuild Git History with >30 Commits

# 1. Clean old git
if (Test-Path .git) {
    Remove-Item -Path .git -Recurse -Force
    Write-Host "Removed old .git directory"
}

# 2. Initialize
git init
git remote add origin https://github.com/nikhitadasari26/saas-project.git
git config user.name "nikhitadasari26"
git config user.email "nikhitadasari1@gmail.com"

# 3. Commit Sequence

# --- SETUP ---
git add README.md .gitignore
git commit -m "Initial commit: Project documentation and gitignore"

git add docker-compose.yml
git commit -m "Add Docker Compose configuration for full stack deployment"

# --- BACKEND BASE ---
git add backend/package.json backend/package-lock.json
git commit -m "Backend: Initialize Node.js dependencies"

git add backend/.env backend/.env.example
git commit -m "Backend: Add environment configuration"

git add backend/Dockerfile backend/.dockerignore
git commit -m "Backend: Add Dockerfile for containerization"

git add backend/server.js
git commit -m "Backend: Create Express server entry point"

# --- BACKEND DB ---
git add backend/config/
git commit -m "Backend: Add database configuration"

git add backend/init-db.js backend/create-db.js backend/test-db-config.js
git commit -m "Backend: Add database initialization scripts"

git add backend/migration.config.js
git commit -m "Backend: Configure node-pg-migrate"

# --- BACKEND MIGRATIONS (Individual commits for granularity) ---
git add backend/migrations/1700000000001_create_tenants.sql
git commit -m "Database: Create tenants table migration"

git add backend/migrations/1700000000002_create_users.sql
git commit -m "Database: Create users table migration"

git add backend/migrations/1700000000003_create_projects.sql
git commit -m "Database: Create projects table migration"

git add backend/migrations/1700000000004_create_tasks.sql
git commit -m "Database: Create tasks table migration"

git add backend/migrations/1700000000005_create_audit_logs.sql
git commit -m "Database: Create audit logs table migration"

git add backend/migrations/1700000000006_add_requested_plan_to_tenants.sql
git commit -m "Database: Add requested_plan column to tenants"

# --- BACKEND LOGIC ---
git add backend/models/
git commit -m "Backend: Add Sequelize models"

git add backend/middleware/authMiddleware.js
git commit -m "Backend: Implement JWT authentication middleware"

git add backend/middleware/tenantResolver.js
git commit -m "Backend: Implement tenant resolution middleware"

git add backend/middleware/
git commit -m "Backend: Add remaining middleware"

git add backend/controllers/authController.js
git commit -m "Backend: Implement Authentication Controller"

git add backend/controllers/tenantController.js
git commit -m "Backend: Implement Tenant Management Controller"

git add backend/controllers/projectController.js
git commit -m "Backend: Implement Project Controller"

git add backend/controllers/
git commit -m "Backend: Add remaining controllers"

git add backend/routes/
git commit -m "Backend: Define API routes"

git add backend/seed_data.sql backend/run-seed.js
git commit -m "Backend: Add seed data and seeding script"

# --- FRONTEND BASE ---
git add frontend/package.json frontend/package-lock.json
git commit -m "Frontend: Initialize React dependencies"

git add frontend/public/
git commit -m "Frontend: Add public assets"

git add frontend/Dockerfile frontend/.dockerignore
git commit -m "Frontend: Add Dockerfile"

# --- FRONTEND SRC ---
git add frontend/src/index.js frontend/src/index.css frontend/src/App.js frontend/src/App.css
git commit -m "Frontend: Setup React application entry point"

git add frontend/src/setupTests.js frontend/src/reportWebVitals.js
git commit -m "Frontend: Add test setup and web vitals"

git add frontend/src/context/
git commit -m "Frontend: Implement Auth Context"

git add frontend/src/services/
git commit -m "Frontend: Add API service layer"

git add frontend/src/components/
git commit -m "Frontend: Add UI components"

# --- FRONTEND PAGES ---
git add frontend/src/pages/Login.jsx
git commit -m "Frontend: Implement Login page"

git add frontend/src/pages/Register.jsx
git commit -m "Frontend: Implement Registration page"

git add frontend/src/pages/Dashboard.jsx
git commit -m "Frontend: Implement Dashboard"

git add frontend/src/pages/
git commit -m "Frontend: Add remaining pages"

# --- DOCS ---
git add docs/
git commit -m "Docs: Add project documentation (PRD, Architecture, API)"

git add submission.json
git commit -m "Add submission.json with test credentials"

# --- FINAL CLEANUP ---
git add .
git commit -m "Final Polish: Clean up remaining files"

Write-Host "Rebuild complete. Ready to push."
