# CRM Frontend MVP Structure

## Project structure

```text
crm/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── students/
│   │   └── page.tsx
│   ├── teachers/
│   │   └── page.tsx
│   ├── courses/
│   │   └── page.tsx
│   ├── groups/
│   │   └── page.tsx
│   ├── assignments/
│   │   └── page.tsx
│   ├── payments/
│   │   └── page.tsx
│   ├── notifications/
│   │   └── page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
│
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── Topbar.tsx
│   ├── ui/
│   │   ├── StatCard.tsx
│   │   ├── DataTable.tsx
│   │   └── PageHeader.tsx
│   └── forms/
│       └── LoginForm.tsx
│
├── lib/
│   ├── api.ts
│   ├── auth.ts
│   └── utils.ts
│
├── types/
│   └── index.ts
│
├── middleware.ts
└── README.md
```

## Main modules and responsibilities

| Module | Purpose |
|---|---|
| app/login | Login page with JWT auth |
| app/dashboard | Admin overview with stats |
| app/students | Student list/create/edit |
| app/teachers | Teacher list/create/edit |
| app/courses | Course management |
| app/groups | Group management and student assignment |
| app/assignments | Assignment list and submission view |
| app/payments | Payment list and debt overview |
| app/notifications | User notification list |

## API endpoints for MVP

| Feature | Method | Endpoint | Notes |
|---|---|---|---|
| Login | POST | /api/auth/login/ | Get access/refresh tokens |
| Refresh token | POST | /api/auth/refresh/ | Refresh JWT |
| Current user | GET | /api/auth/me/ | Get logged-in user info |
| Dashboard | GET | /api/dashboard/ | Admin stats overview |
| Students | GET/POST | /api/students/ | List/create students |
| Teachers | GET/POST | /api/teachers/ | List/create teachers |
| Courses | GET/POST | /api/courses/ | List/create courses |
| Groups | GET/POST | /api/groups/ | List/create groups |
| Attendance | GET/POST | /api/attendance/ | Attendance records |
| Assignments | GET/POST | /api/assignments/ | Assignment management |
| Assignment submit | POST | /api/assignments/{id}/submit/ | Student submission |
| Submissions | GET | /api/submissions/ | View submissions |
| Payments | GET/POST | /api/payments/ | Payment records |
| Debtors | GET | /api/payments/debtors/ | Outstanding debtors |
| Notifications | GET | /api/notifications/ | User notifications |

## Suggested frontend data flow

```text
Login -> Store token -> Fetch /api/auth/me/ -> Redirect to dashboard
Dashboard -> GET /api/dashboard/
Students -> GET/POST /api/students/
Groups -> GET/POST /api/groups/
Assignments -> GET/POST /api/assignments/
Payments -> GET/POST /api/payments/
```

## MVP priority order

1. Auth + login
2. Dashboard
3. Students
4. Groups
5. Assignments
6. Payments
