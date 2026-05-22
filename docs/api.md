# API Documentation

Swagger UI is available at `http://localhost:5001/api-docs` after starting the backend.

## Main Endpoints

- `POST /api/auth/register`: create an account.
- `POST /api/auth/login`: login and receive JWT.
- `GET /api/users`: admin-only user list.
- `GET /api/projects`: all authenticated roles.
- `POST /api/projects`: admin and test-lead only.
- `GET /api/testcases`: all authenticated roles, supports `search`, `priority`, `type`, `page`, `limit`.
- `POST /api/testcases`: admin and test-lead only.
- `PUT /api/testcases/:id`: admin and test-lead only.
- `DELETE /api/testcases/:id`: admin and test-lead only.
- `PATCH /api/testcases/bulk`: admin and test-lead only.
- `GET /api/suites`: all authenticated roles.
- `POST /api/suites`: admin and test-lead only.
- `GET /api/executions`: all authenticated roles.
- `POST /api/executions`: admin, test-lead, and tester only.
- `GET /api/analytics`: all authenticated roles.

## Rate Limits

- Auth: 5 requests per 15 minutes.
- Test case CRUD: 100 requests per hour.
- Test execution: 200 requests per hour.
- Analytics: 50 requests per hour.
