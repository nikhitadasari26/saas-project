# Product Requirements Document (PRD)

## User Personas
### 1. Super Admin
- **Role:** System Owner.
- **Responsibilities:** Managing tenant status, updating subscription plans.
- **Goals:** Ensure 100% system uptime and monitor tenant growth.
- **Pain Points:** Hard to track thousands of tenants manually.

### 2. Tenant Admin
- **Role:** Business Owner.
- **Responsibilities:** Managing team members and tracking project progress.
- **Goals:** High team productivity and data security.
- **Pain Points:** Risk of data leaking to other companies.

### 3. End User
- **Role:** Individual Contributor.
- **Responsibilities:** Completing tasks and updating project status.
- **Goals:** Clear view of daily tasks and deadlines.
- **Pain Points:** System lag or confusing task assignments.

## Functional Requirements
- **FR-001**: System shall allow tenant registration with a unique subdomain.
- **FR-002**: System shall enforce complete data isolation using `tenant_id`.
- **FR-003**: System shall use JWT for 24-hour stateless authentication.
- **FR-004**: System shall enforce 'Free' plan limits: max 5 users and 3 projects.
- **FR-005**: All API responses must follow `{success, message, data}` format.
- **FR-006**: Users shall be able to create, list, and update projects.
- **FR-007**: Users shall be able to manage tasks (create, update status, delete).
- **FR-008**: Tenant Admins shall be able to add/remove users from their organization.
- **FR-009**: System shall log all major actions in an audit_logs table.
- **FR-010**: New tenants shall start on the 'Free' plan by default.

## Non-Functional Requirements
- **NFR-001**: API response time < 200ms for 90% of requests.
- **NFR-002**: Passwords must be hashed using bcrypt.
- **NFR-003**: System must be fully dockerized with one-command deployment.
- **NFR-004**: Frontend must be responsive for mobile and desktop.
- **NFR-005**: Database data must persist using Docker volumes.