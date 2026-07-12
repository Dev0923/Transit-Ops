# TransitOps — Fleet Management System

A full-stack fleet management dashboard for managing vehicles, drivers, trips, maintenance, and fuel expenses with role-based access control.

## Tech Stack

| Layer      | Technology                                      |
|------------|--------------------------------------------------|
| Frontend   | React 19, Vite, Tailwind CSS, Recharts, Axios   |
| Backend    | Node.js, Express, Prisma ORM, JWT, bcrypt        |
| Database   | PostgreSQL (Supabase / Neon)                     |
| Auth       | JWT with RBAC (Admin, Manager, Driver)           |

## Getting Started

### Prerequisites

- Node.js ≥ 18
- PostgreSQL database (or free tier on [Supabase](https://supabase.com) / [Neon](https://neon.tech))

### 1. Backend Setup

```bash
cd backend
npm install
```

Update `backend/.env` with your PostgreSQL connection string:

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/transitops?schema=public"
JWT_SECRET="your-random-secret"
```

Push the schema & seed the database:

```bash
npx prisma db push
npx prisma generate
npm run seed
```

Start the dev server:

```bash
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173` and proxies API calls to `http://localhost:5000`.

## Demo Credentials

| Role    | Email                    | Password    |
|---------|--------------------------|-------------|
| Admin   | admin@transitops.com     | Admin@123   |
| Manager | manager@transitops.com   | Manager@123 |
| Driver  | driver@transitops.com    | Driver@123  |

## Features

- **Dashboard** — Fleet overview with KPI cards and utilization chart
- **Vehicle Registry** — Full CRUD for fleet vehicles with status tracking
- **Driver Management** — Add/edit/remove drivers (Admin & Manager only)
- **Trip Management** — Schedule, dispatch, complete, and cancel trips
- **Maintenance Log** — Track preventive & corrective maintenance
- **Fuel & Expenses** — Record fuel consumption with cost tracking
- **Reports** — Fleet utilization, fuel efficiency charts + CSV export
- **User Management** — Admin-only user CRUD with role assignment
- **RBAC** — Backend-enforced role-based access control (Admin > Manager > Driver)
