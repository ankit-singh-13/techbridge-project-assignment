# Database Schema Documentation

## Tables

- `users`: user accounts with `role` field for RBAC.
- `projects`: software testing projects with name, description, version, and status.
- `project_members`: mapping between users and projects.
- `test_cases`: test case metadata, priority, type, labels, assignment, and project relation.
- `test_steps`: ordered actions and expected results for each test case.
- `test_suites`: suite containers for project-level grouping.
- `test_suite_cases`: many-to-many mapping between suites and test cases.
- `test_executions`: execution result, comments, attachments, executor, and timestamp.
- `defects`: bugs created from failed test executions.

## Important Indexes

- `idx_test_cases_project`: faster project-specific test case lists.
- `idx_test_cases_priority`: faster priority filters.
- `idx_test_cases_type`: faster type filters.
- `idx_test_cases_assigned_to`: faster tester assignment views.
- `idx_test_executions_case_time`: faster latest execution and audit history queries.
- `idx_test_executions_status`: faster dashboard status counts.

Full schema is in `backend/src/sql/schema.sql`.
