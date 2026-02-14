# Enterprise Multi-Tenant SaaS Platform

A production-grade SaaS application featuring **Strict Multi-Tenancy**, **Role-Based Access Control (RBAC)**, and a **Subscription Management Engine** with an approval workflow.

Built with **React (Vite)**, **Node.js (Express)**, **PostgreSQL**, and **Docker**.

---

## 🚀 Key Features

### 1. Multi-Tenancy Architecture
- **Data Isolation:** Each tenant (company) sees only their own data.
- **Subdomain Logic:** Users are identified by their workspace subdomain (e.g., `tesla.saas-platform.com`).

### 2. Subscription Engine with "Approval Workflow"
- **Tiered Plans:** Free (Default), Pro, Enterprise.
- **Limit Enforcement:**
  - **Free:** Max 5 Users, 3 Projects.
  - **Pro:** Max 25 Users, 15 Projects.
  - **Enterprise:** Max 100 Users, 50 Projects.
- **Upgrade Workflow:** Tenants cannot instantly upgrade. They must **Request** an upgrade, which the Super Admin must **Approve**.

### 3. Role-Based Access Control (RBAC)
- **Super Admin:** Manages Tenants (Companies), approves billing/plans. Cannot see inside Tenant projects.
- **Tenant Admin:** Manages their company's projects, tasks, and team members.
- **Member:** Can view/edit assigned tasks but cannot manage billing or users.

### 4. User Interface
- **Modern Dashboard:** Clean, card-based layout for intuitive navigation.
- **Visual Feedback:** Clear indicators for subscription plans and usage limits.

---

## 🎥 Demo Video

[Link to YouTube Demo Video](https://youtu.be/80ixL2aDsWs)

---

## ️ Tech Stack

- **Frontend:** React.js, Tailwind CSS, Lucide Icons, Vite.
- **Backend:** Node.js, Express.js, Sequelize ORM.
- **Database:** PostgreSQL.
- **DevOps:** Docker & Docker Compose.

---

## ⚡ Quick Start

### Prerequisites
- Docker & Docker Compose installed.

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/nikhitadasari26/saas-project
cd saas-project
```

2. **Start the application:**
```bash
docker-compose up -d --build
```

3. **Access the App:**
   - **Frontend:** `http://localhost:3000`
   - **Backend:** `http://localhost:5000`

### 🔧 Troubleshooting
If you encounter errors like **"missing columns"** or **"relation does not exist"**, it likely means the database volume contains old data.

**Fix:**
```bash
docker-compose down -v
docker-compose up -d --build
```
This will delete the old database volume and recreate it with the correct schema and seed data.

---

## 🔐 Default Credentials

### 1. System Super Admin
*Use this account to approve upgrades and view platform stats.*
- **Workspace Subdomain:** *(Leave Empty)*
- **Email:** `superadmin@system.com`
- **Password:** `Admin@123`

### 2. Demo Tenant Admin
*Use this account to manage projects and request upgrades.*
- **Workspace Subdomain:** `demo`
- **Email:** `admin@demo.com`
- **Password:** `Demo@123`

---

## 📖 User Guide & Workflows

### 🧪 Workflow 1: The "Upgrade Approval" Cycle
This demonstrates the interaction between Tenant and Super Admin.

1. **Login as Tenant:**
   - Login with `admin@demo.com`.
   - Go to Dashboard. Note the current plan is "Free".
   - Click **"Request Upgrade"**. Select "Pro".
   - *Result:* You will see a yellow "Request Pending" badge. Limits remain unchanged.

2. **Approve as Super Admin:**
   - Logout and Login as `superadmin@system.com`.
   - You will see a yellow **"Action Required"** banner at the top of the dashboard.
   - Go to the **Workspaces** tab.
   - Find "Demo Company". You will see the request details.
   - Click **"Approve"**.

3. **Verify:**
   - Login back in as `admin@demo.com`.
   - The badge is gone, and the plan is now "Pro". You can now add more than 5 users.

### 🧪 Workflow 2: Enforcing Limits
1. Login as a Tenant on the **Free Plan**.
2. Go to **Projects** and create 3 projects.
3. Try to create a 4th project.
4. *Result:* The system blocks the request with a "Plan Limit Reached" error.

---

## 📂 Project Structure

```text
/
├── backend/
│   ├── config/         # DB Config
│   ├── controllers/    # Business Logic (Tenant, Project, Auth)
│   ├── middleware/     # Auth & RBAC Middleware
│   ├── models/         # Sequelize Models (User, Tenant, Project)
│   ├── routes/         # API Routes
│   └── server.js       # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/ # Reusable UI (Modal, Button, Layout)
│   │   ├── context/    # Auth Context
│   │   └── pages/      # Dashboard, Login, Admin, Teams
│   └── Dockerfile
│
└── docker-compose.yml  # Orchestration
```
