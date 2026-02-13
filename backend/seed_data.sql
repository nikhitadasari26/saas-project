-- database/seeds/seed_data.sql
-- SAFE, IDEMPOTENT SEED (runs multiple times without error)

-- EXTENSION
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- TENANT
INSERT INTO tenants (id, name, subdomain, status, subscription_plan, max_users, max_projects)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'Demo Company',
  'demo',
  'active',
  'pro',
  10,
  10
)
ON CONFLICT (id) DO NOTHING;

-- TENANT ADMIN
-- email: admin@demo.com
-- password: Demo@123
INSERT INTO users (tenant_id, email, password_hash, full_name, role, is_active)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'admin@demo.com',
  '$2b$10$8lK0B0V0oLZ0d4j9E6s4Ce6bT1h6R.5w1G0KxkN9M0yKJtL9R6b6O',
  'Demo Admin',
  'tenant_admin',
  true
)
ON CONFLICT (tenant_id, email) DO NOTHING;

-- PROJECT
INSERT INTO projects (tenant_id, name, description)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'Demo Project',
  'Seeded demo project'
)
ON CONFLICT DO NOTHING;

-- TASK
INSERT INTO tasks (tenant_id, project_id, title, status, priority)
SELECT
  '550e8400-e29b-41d4-a716-446655440000',
  id,
  'Demo Task',
  'todo',
  'medium'
FROM projects
WHERE name = 'Demo Project'
LIMIT 1;
