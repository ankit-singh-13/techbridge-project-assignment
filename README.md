# Full Stack Test Case Management System

A React 18 + Express + PostgreSQL + Redis application for managing projects, test cases, suites, executions, analytics, and role-based access.

## Tech Stack

- Frontend: React 18, Vite, React Router, Recharts, react-window
- Backend: Node.js, Express.js, JWT, Swagger UI
- Database: PostgreSQL
- Cache: Redis
- Security: Helmet, CORS, express-validator, xss sanitization, parameterized SQL, JWT authorization, rate limiting

## Demo Credentials

All demo users use password: `Password123!`

| Role | Email |
| --- | --- |
| admin | `admin@example.com` |
| test-lead | `lead@example.com` |
| tester | `tester@example.com` |
| read-only | `readonly@example.com` |

## Setup

1. Install root, backend, and frontend dependencies:

```bash
npm install
npm run install:all
```

2. Create PostgreSQL database:

```bash
createdb testcase_manager
```

3. Configure backend environment:

```bash
cp backend/.env.example backend/.env
```

Update `DATABASE_URL`, `REDIS_URL`, and `JWT_SECRET` in `backend/.env` if needed.

4. Configure frontend environment:

```bash
cp frontend/.env.example frontend/.env
```

5. Run schema and seed data:

```bash
npm run db:schema --prefix backend
npm run db:seed --prefix backend
```

6. Start Redis locally if it is not running:

```bash
redis-server
```

7. Start both apps:

```bash
npm run dev
```

## URLs

- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:5001/health`
- Swagger API docs: `http://localhost:5001/api-docs`

## RBAC Summary

- `admin`: full access including users, projects, test data, execution, analytics
- `test-lead`: manage projects, test cases, suites, executions, reports
- `tester`: execute tests and update results
- `read-only`: view projects, test cases, executions, analytics only

## Cache TTLs

- Analytics: 15 minutes
- Test suites: 30 minutes
- Project metadata: 1 hour

Cache invalidation is triggered after project, suite, test case, and execution writes.

## Optional Bonus Features

Optional feature placeholders are intentionally commented in `frontend/src/styles.css` and documented in `docs/optional-features.md`. Uncomment and implement them only if you decide to include bonus scope.
