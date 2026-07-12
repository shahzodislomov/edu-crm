# 🎓 EduCRM Hub

Welcome to **EduCRM**, a modern and comprehensive Education Management Platform designed for managing course catalogs, students, teachers, study groups, assignments, notifications, and invoicing.

This repository is split into two primary modules:
1. **Frontend (`/crm`)**: A modern, responsive Next.js application built with Tailwind CSS v4 and TypeScript.
2. **Backend (`/crm-platform-mvp`)**: A robust Django REST Framework (DRF) backend API with PostgreSQL/SQLite database support, seed seeding, and JWT authentication.

---

## 📂 Project Structure

```text
crm-platform/
├── crm/                         # Frontend Application (Next.js)
│   ├── app/                     # Next.js App Router Pages
│   ├── components/
│   │   ├── layout/              # ThemeToggle, Sidebar, Topbar, DashboardLayout
│   │   ├── ui/                  # StatCard, DataTable, PageHeader, AccessDenied
│   │   └── forms/               # LoginForm with mesh gradient
│   ├── lib/                     # API interceptors, Auth tokens, endpoints config
│   └── globals.css              # Tailwind CSS v4 Theme variables
│
└── crm-platform-mvp/            # Backend API Server (Django REST Framework)
    ├── apps/                    # Backend modular applications (Users, Courses, Groups, etc.)
    ├── config/                  # Settings and url routing definitions
    └── db.sqlite3               # Active development database
```

---

## 🔑 Demo Access Credentials

Seed commands populate the database with three roles:

| Role | Username | Password | Access Details |
|---|---|---|---|
| **Administrator** | `admin` | `admin12345` | Full workspace permissions, financial audits, analytics. |
| **Teacher** | `teacher_sardor` | `test12345` | Course curriculums, student rosters, assigned homework. |
| **Student** | `student_ali` | `test12345` | Assigned coursework, notifications feed, personal tuition invoices. |

---

## 🚀 Setup & Execution Guide

### 1. Run the Backend API Server
Navigate to the backend directory and configure the environment:
```bash
cd crm-platform-mvp

# 1. Start the python virtual environment
source .venv/bin/activate  # on Windows use: .venv\Scripts\activate

# 2. Run migrations
python manage.py migrate

# 3. Seed test users and details (if database is empty)
python manage.py seed

# 4. Start backend server
python manage.py runserver
```
The API is available at `http://127.0.0.1:8000/api`. You can view the Interactive Swagger documentation at `http://127.0.0.1:8000/api/docs/`.

### 2. Run the Next.js Frontend
Open a new terminal window, navigate to the frontend directory:
```bash
cd crm

# 1. Install packages
npm install

# 2. Start the development server
npm run dev
```
The client app is available at `http://localhost:3000`.

---

## 🎨 Theme & Gating System

### Theme Tokens
The frontend features custom visual styles mapping design variables (e.g. `--background`, `--foreground`, `--primary`, `--card`) inside `globals.css` to Tailwind v4 theme utility overrides. Theme switches apply smooth CSS transitions.

### Client-Side Role Gating
All page-level routing authorizations are verified dynamically on layout mount against the `/api/auth/me/` endpoint to protect restricted views:
* **Admins** have absolute view permissions.
* **Teachers** see filtered menus and customized teaching boards, with restricted dashboard stats and payments blocked.
* **Students** see homework, class groups, and personal invoicing histories.
