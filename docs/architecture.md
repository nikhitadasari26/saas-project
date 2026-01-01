# System Architecture

## Overview
This is a 3-tier SaaS application. 
- **Frontend**: React (Port 3000).
- **Backend**: Node/Express (Port 5000).
- **Database**: PostgreSQL (Port 5432).



## Database ERD
Our schema uses a **Shared Database + Shared Schema** approach. Every record includes a `tenant_id` to ensure complete data isolation.

## API Endpoint List (The 19 Requirements)
### Auth Module
1. `POST /api/auth/register-tenant` - Public registration
2. `POST /api/auth/login` - User login
3. `GET /api/auth/me` - Current user info
4. `POST /api/auth/logout` - Logout

### Tenant Management
5. `GET /api/tenants/:tenantId` - View organization
6. `PUT /api/tenants/:tenantId` - Update organization
7. `GET /api/tenants` - List all (Super Admin)

### User Management
8. `POST /api/tenants/:tenantId/users` - Add member
9. `GET /api/tenants/:tenantId/users` - List members
10. `PUT /api/users/:userId` - Update member
11. `DELETE /api/users/:userId` - Remove member

### Project Management
12. `POST /api/projects` - Create (Limit check)
13. `GET /api/projects` - List (Tenant scoped)
14. `PUT /api/projects/:projectId` - Edit project
15. `DELETE /api/projects/:projectId` - Remove project

### Task Management
16. `POST /api/projects/:projectId/tasks` - Create task
17. `GET /api/projects/:projectId/tasks` - List tasks
18. `PATCH /api/tasks/:taskId/status` - Update status
19. `PUT /api/tasks/:taskId` - Full task update

### System
- `GET /api/health` - Mandatory Health Check