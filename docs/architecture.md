# System Architecture

## Overview
This is a 3-tier SaaS application. 
- **Frontend**: React (Port 3000).
- **Backend**: Node/Express (Port 5000).
- **Database**: PostgreSQL (Port 5432).



## Database ERD
Our schema uses a **Shared Database + Shared Schema** approach. Every record includes a `tenant_id` to ensure complete data isolation.