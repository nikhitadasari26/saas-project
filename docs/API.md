# API Documentation

**Base URL:** `http://localhost:5000/api`  
**Response Format:** All APIs return `{ "success": boolean, "message": string, "data": object }`

## 1. Authentication Module
- **POST /auth/register-tenant**: Register a new company and admin.
- **POST /auth/login**: Login and receive JWT.
- **GET /auth/me**: Get current user profile and tenant limits.
- **POST /auth/logout**: Clear session/log out.

## 2. Tenant Management
- **GET /tenants/:tenantId**: Get organization stats (Users/Projects count).
- **PUT /tenants/:tenantId**: Update organization name or status.
- **GET /tenants**: List all tenants (Super Admin Only).

## 3. User Management
- **POST /tenants/:tenantId/users**: Add new team member (Checks user limit).
- **GET /tenants/:tenantId/users**: List all users in tenant.
- **PUT /users/:userId**: Update user role or name.
- **DELETE /users/:userId**: Remove user (Tenant Admin only).

## 4. Project Management
- **POST /projects**: Create new project (Checks project limit).
- **GET /projects**: List projects for current tenant.
- **PUT /projects/:projectId**: Update project status or details.
- **DELETE /projects/:projectId**: Remove project (Cascade deletes tasks).

## 5. Task Management
- **POST /projects/:projectId/tasks**: Create task within a project.
- **GET /projects/:projectId/tasks**: List tasks for a specific project.
- **PATCH /tasks/:taskId/status**: Update task status (todo -> completed).
- **PUT /tasks/:taskId**: Update task title, priority, or assignee.

## 6. System
- **GET /health**: Returns `{"status": "ok", "database": "connected"}`.