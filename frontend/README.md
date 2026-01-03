#  Multi-Tenant SaaS Project & Task Management System

A **full-stack, multi-tenant SaaS application** for managing projects, tasks, and users with **strict tenant isolation**, **role-based access control**, and **JWT authentication**.

This project is built as part of an academic / evaluation submission.

---

##  Features

###  Authentication & Security
- JWT-based authentication
- Secure password hashing using **bcrypt**
- Protected routes using middleware
- Token stored in frontend and attached to API requests

###  Multi-Tenancy
- Each organization is a **tenant**
- Strict data isolation using `tenant_id`
- Users, projects, and tasks are scoped per tenant

###  User Management
- Tenant Admin can:
  - View users
  - Add new users
  - Assign roles (`tenant_admin`, `user`)
- Users belong to **one tenant only**

###  Project Management
- Create, list, update, delete projects
- Subscription-based project limits
- View project details
- Each project belongs to one tenant

###  Task Management
- Create tasks under a project
- List tasks per project
- Task attributes:
  - Title
  - Priority
  - Status
- Tasks are tenant-isolated

###  Dashboard
- Overview of:
  - Total projects
  - Active tasks
  - Completed tasks
  - Team members
- Sidebar navigation (Dashboard, Projects, Users)

---

##  Tech Stack

### Backend
- Node.js
- Express.js
- PostgreSQL
- JWT
- bcrypt
- CORS

### Frontend
- React
- React Router v6
- Axios
- Tailwind CSS

---

##  Project Structure

saas-project/
│
├── backend/
│ ├── controllers/
│ ├── routes/
│ ├── middleware/
│ ├── init-db.js
│ ├── server.js
│
├── frontend/
│ ├── src/
│ │ ├── components/
│ │ ├── pages/
│ │ ├── services/
│ │ ├── App.js
│ │ └── index.js
│
└── README.md


---

## Backend Setup

### 1. Install dependencies
cd backend
npm install


### 2 Start PostgreSQL
Make sure PostgreSQL is running and credentials are correct in `init-db.js`.

### 3 Start backend server

node server.js


### Backend runs at:
 http://localhost:5000


### Health check:

GET /api/health


---

##  Frontend Setup

### 1. Install dependencies

cd frontend
npm install


### 2 Start frontend

npm start

### Frontend runs at:
http://localhost:3000


---

##  Authentication Flow

1. Register tenant (organization)
2. Login using:
   - Email
   - Password
   - Tenant subdomain
3. JWT token returned
4. Token stored in `localStorage`
5. Axios attaches token to all protected API calls

---

##  API Overview

### Auth
- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/auth/me`

### Tenants & Users
- GET `/api/tenants/:tenantId/users`
- POST `/api/tenants/:tenantId/users`

### Projects
- POST `/api/projects`
- GET `/api/projects`
- GET `/api/projects/:projectId`

### Tasks
- POST `/api/projects/:projectId/tasks`
- GET `/api/projects/:projectId/tasks`

---

##  Roles

| Role | Permissions |
|-----|------------|
| tenant_admin | Full access |
| user | View projects & tasks |

---

##  Sample Login Credentials

Email: test@demo.com
Password: test123
Tenant Subdomain: demo2


---

##  Submission Checklist

- ✔ Multi-tenant architecture
- ✔ JWT authentication
- ✔ Role-based access control
- ✔ PostgreSQL schema
- ✔ Frontend + Backend integration
- ✔ Protected APIs
- ✔ Clean UI with sidebar navigation

---

## Notes

- All APIs are protected except login & registration
- Sidebar layout is shared using React Router `<Outlet />`
- Token is validated on every request using middleware

---




