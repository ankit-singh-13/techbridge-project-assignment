DROP TABLE IF EXISTS defects, test_executions, test_suite_cases, test_steps, test_suites, test_cases, project_members, projects, users CASCADE;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(180) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'tester' CHECK (role IN ('admin','test-lead','tester','read-only')),
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  description TEXT,
  version VARCHAR(40),
  status VARCHAR(30) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE project_members (
  project_id INT REFERENCES projects(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, user_id)
);

CREATE TABLE test_cases (
  id SERIAL PRIMARY KEY,
  project_id INT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(220) NOT NULL,
  description TEXT,
  priority VARCHAR(20) NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low','Medium','High','Critical')),
  type VARCHAR(30) NOT NULL DEFAULT 'Functional' CHECK (type IN ('Functional','Integration','Regression','Smoke','UI','API')),
  preconditions TEXT,
  postconditions TEXT,
  tags TEXT[] DEFAULT '{}',
  assigned_to INT REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE test_steps (
  id SERIAL PRIMARY KEY,
  test_case_id INT NOT NULL REFERENCES test_cases(id) ON DELETE CASCADE,
  step_order INT NOT NULL,
  action TEXT NOT NULL,
  expected_result TEXT NOT NULL
);

CREATE TABLE test_suites (
  id SERIAL PRIMARY KEY,
  project_id INT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(180) NOT NULL,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE test_suite_cases (
  suite_id INT REFERENCES test_suites(id) ON DELETE CASCADE,
  test_case_id INT REFERENCES test_cases(id) ON DELETE CASCADE,
  PRIMARY KEY (suite_id, test_case_id)
);

CREATE TABLE test_executions (
  id SERIAL PRIMARY KEY,
  test_case_id INT NOT NULL REFERENCES test_cases(id) ON DELETE CASCADE,
  executed_by INT NOT NULL REFERENCES users(id),
  status VARCHAR(20) NOT NULL CHECK (status IN ('Pass','Fail','Blocked','Skipped')),
  comments TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  executed_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE defects (
  id SERIAL PRIMARY KEY,
  test_execution_id INT NOT NULL REFERENCES test_executions(id) ON DELETE CASCADE,
  title VARCHAR(220) NOT NULL,
  description TEXT,
  created_by INT NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_test_cases_project ON test_cases(project_id);
CREATE INDEX idx_test_cases_priority ON test_cases(priority);
CREATE INDEX idx_test_cases_type ON test_cases(type);
CREATE INDEX idx_test_cases_assigned_to ON test_cases(assigned_to);
CREATE INDEX idx_test_executions_case_time ON test_executions(test_case_id, executed_at DESC);
CREATE INDEX idx_test_executions_status ON test_executions(status);
