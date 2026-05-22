# Optional Bonus Features

These are intentionally not enabled by default so the required assignment scope remains clear.

## CSV/Excel Export and Import

Add routes such as `GET /api/testcases/export` and `POST /api/testcases/import`. Use packages like `fast-csv`, `csv-parser`, or `exceljs`.

## Email Notifications

Add notification service using `nodemailer` for test assignment emails.

## Test Case Versioning

Add a `test_case_versions` table and create a version row before every update.

## CI/CD Integration

Add a webhook endpoint such as `POST /api/integrations/ci/test-results` to ingest pipeline results.

## Test Run Scheduling

Add a scheduler table and background worker using `node-cron`.

## Collaborative Comments

Add `test_case_comments` table with mentions and timestamps.

## Dark Mode

Dark mode is already implemented through `ThemeContext` and the Toggle theme button.
