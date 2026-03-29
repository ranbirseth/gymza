# Gymza - SaaS Gym Management System (MERN)

Production-oriented gym management platform for real-world usage (admin/trainer/member), with modular backend and typed frontend.

## Stack

- Backend: Node.js, Express, MongoDB (Mongoose), JWT, Redis, Socket.IO
- Frontend: React (Vite), TypeScript, Zustand, Axios
- Optional file storage: local or Cloudinary (config-driven)

## Run Locally

### 1) Backend

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

### 2) Seed data (optional)

```bash
cd server
npm run seed
```

Default users after seed:
- `admin@gymza.com` / `Password123`
- `trainer@gymza.com` / `Password123`
- `member@gymza.com` / `Password123`

### 3) Frontend

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

## API Response Format

All APIs return:

```json
{
  "success": true,
  "message": "Human readable status",
  "data": {}
}
```

Error responses include a machine-readable `code` field.

## Security Hardening Included

- Refresh token stored in `HttpOnly` cookie (server-managed).
- Refresh and logout support cookie-first flow (body fallback for compatibility).
- Centralized error codes via global error middleware.
- Zod validation middleware added on auth endpoints.
- Multi-tenant login support with `gymId` (default seed gym id: `MAIN`).

## Key Capabilities

- JWT auth with access + refresh tokens
- Role-based API protection (admin/trainer/member)
- Members CRUD with plan/trainer assignment
- Monthly/yearly plans
- Payments + invoice JSON + pending dues
- Mock online payment intent/confirm endpoints
- Attendance check-in/check-out + realtime Socket.IO updates
- Member profile APIs + assign-plan endpoint
- Class-slot booking APIs + referral apply endpoint
- Dashboard stats + Redis cache
- Workout/diet/class-slot/inventory/branch/referral CRUD
- Progress tracking with BMI
- Notification model + cron-based expiry reminders
- Pagination + search-ready list endpoints

## Production Notes

- Add request validation (zod middleware) before public release.
- Refresh token revoke/logout endpoint is included; move refresh token to HttpOnly cookies for higher security.
- Add upload middleware (`multer`) before enabling photo uploads.
- Configure HTTPS, reverse proxy, and observability (APM/log aggregation).

## Debugging

Detailed debugging and full architecture documentation:

- `PROJECT_STRUCTURE.md`
