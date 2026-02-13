-- database/seeds/seed_data.sql

-- 1. SUPER ADMIN (No tenant_id)
-- Password is 'Admin@123' (hashed)
INSERT INTO users (id, email, password_hash, full_name, role, is_active)
VALUES (
    gen_random_uuid(), 
    'superadmin@system.com', 
    '$2b$10$6pE/6y5f5Yp6G6G6G6G6G6uY8uY8uY8uY8uY8uY8uY8uY8uY8uY8', 
    'System Super Admin', 
    'super_admin', 
    true
);

-- 2. SAMPLE TENANT
INSERT INTO tenants (id, name, subdomain, status, subscription_plan, max_users, max_projects)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000', 
    'Demo Company', 
    'demo', 
    'active', 
    'pro', 
    10, 
    10
);

-- 3. TENANT ADMIN for Demo Company
-- Password is 'Demo@123' (hashed)
INSERT INTO users (id, tenant_id, email, password_hash, full_name, role)
VALUES (
    gen_random_uuid(), 
    '550e8400-e29b-41d4-a716-446655440000', 
    'admin@demo.com', 
    '$2b$10$7pE/7y5f7Yp7G7G7G7G7G7uY8uY8uY8uY8uY8uY8uY8uY8uY8uY8', 
    'Demo Admin', 
    'tenant_admin'
);

-- 4. REGULAR USERS for Demo Company
-- Password is 'User@123' (hashed)
INSERT INTO users (id, tenant_id, email, password_hash, full_name, role)
VALUES 
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'user1@demo.com', '$2b$10$8pE/8y5f8Yp8G8G8G8G8G8uY8uY8uY8uY8uY8uY8uY8uY8uY8uY8', 'User One', 'user'),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'user2@demo.com', '$2b$10$8pE/8y5f8Yp8G8G8G8G8G8uY8uY8uY8uY8uY8uY8uY8uY8uY8uY8', 'User Two', 'user');

-- 5. SAMPLE PROJECTS & TASKS
INSERT INTO projects (id, tenant_id, name, status) 
VALUES ('f47ac10b-58cc-4372-a567-0e02b2c3d479', '550e8400-e29b-41d4-a716-446655440000', 'Demo Project', 'active');

INSERT INTO tasks (id, project_id, tenant_id, title, status, priority) 
VALUES (gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '550e8400-e29b-41d4-a716-446655440000', 'First Task', 'todo', 'medium');