# 🎓 EduCRM Client Portal

This is the Next.js frontend client for the **EduCRM** platform. It connects to the Django REST Framework API, providesJWT-based authentication, implements strict role-based dashboard filtering, and renders a fully responsive dark/light mode interface.

---

## 🛠 Features

- **Tailwind CSS v4 System**: Completely mapped to native CSS variables inside `globals.css` for instant theme synchronization.
- **Glassmorphism Design**: High-end layouts featuring smooth gradients, subtle backdrops, and interactive micro-animations.
- **Secure Role Gating**: Protects restricted routes (e.g. Students/Teachers/Payments rosters) by evaluating account credentials from `/api/auth/me/` before child pages are rendered.
- **Role-Aware Dashboards**:
  - **Admins**: Centralized financials and collection gauges.
  - **Teachers**: Teaching course listings and assignments trackers.
  - **Students**: Enrolled classes and pending task rosters.

---

## 📂 Directories

- `app/`: Routing pages (Auth login, Dashboard, Students, Teachers, Courses, Groups, Assignments, Payments, Notifications).
- `components/layout/`: Global shell blocks including `Sidebar`, `Topbar`, `ThemeToggle`, and the gating `DashboardLayout`.
- `components/ui/`: Shared design primitives: `StatCard`, `DataTable`, `PageHeader`, and `AccessDenied`.
- `components/forms/`: Styled authentication forms (`LoginForm`).
- `lib/`: Configuration scripts including api request handlers (`api.ts`), auth local token storage (`auth.ts`), and route configurations (`endpoints.ts`).

---

## 🚀 Running the App

### 1. Configure the API Environment
Ensure you have a `.env.local` file inside this folder indicating the API base path:
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

### 2. Execute Development Server
```bash
# Install dependencies
npm install

# Run hot-reloading dev server
npm run dev
```

### 3. Build & Verify Production
```bash
# Compile and type-check build output
npm run build
```
