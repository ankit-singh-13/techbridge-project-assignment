# Manual Test Cases

| ID | Scenario | Steps | Expected Result |
| --- | --- | --- | --- |
| TC-001 | Admin login | Open app, select `admin@example.com`, login with `Password123!` | Dashboard opens and admin role is shown |
| TC-002 | Read-only RBAC | Login as `readonly@example.com`, open Test Cases | Create/Edit/Bulk actions are hidden or disabled |
| TC-003 | Tester execution access | Login as `tester@example.com`, open Executions | Record Execution button is visible |
| TC-004 | Dashboard charts | Login as any role, open Dashboard | Pie, line, and bar charts render from analytics API |
| TC-005 | Project selection | Open Projects, click sample project | Project card is highlighted as selected |
| TC-006 | Search test cases | Open Test Cases, search `Login` | Matching test case remains visible |
| TC-007 | Priority filter | Open Test Cases, choose `High` priority | Only high priority results are listed |
| TC-008 | Suite list cache | Open Suites twice with Redis running | API response shows cache miss first, then hit within TTL |
| TC-009 | Analytics cache | Open Dashboard twice with Redis running | API response shows cache miss first, then hit within 15 minutes |
| TC-010 | JWT protection | Call `GET /api/testcases` without token | API returns `401 Authentication required` |
| TC-011 | Test case write restriction | Login as tester, call `POST /api/testcases` | API returns `403 Insufficient permissions` |
| TC-012 | Admin user endpoint | Login as admin, call `GET /api/users` | User list is returned |
