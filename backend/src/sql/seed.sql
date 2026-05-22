INSERT INTO users (name,email,password_hash,role) VALUES
('Admin User','admin@example.com','$2a$10$DdMFwx90v7Mli9lsLWLs3uEPDyGOEj484t3VUmb1aVTHA7t2tn6yi','admin'),
('Test Lead','lead@example.com','$2a$10$DdMFwx90v7Mli9lsLWLs3uEPDyGOEj484t3VUmb1aVTHA7t2tn6yi','test-lead'),
('Tester User','tester@example.com','$2a$10$DdMFwx90v7Mli9lsLWLs3uEPDyGOEj484t3VUmb1aVTHA7t2tn6yi','tester'),
('Read Only','readonly@example.com','$2a$10$DdMFwx90v7Mli9lsLWLs3uEPDyGOEj484t3VUmb1aVTHA7t2tn6yi','read-only');

INSERT INTO projects (name,description,version,status) VALUES
('TechBridge QA Portal','Sample web application testing project','1.0.0','active');

INSERT INTO project_members (project_id,user_id) SELECT 1, id FROM users;

INSERT INTO test_cases (project_id,title,description,priority,type,preconditions,postconditions,tags,assigned_to) VALUES
(1,'Login with valid credentials','Verify successful authentication','High','Functional','Registered user exists','User lands on dashboard',ARRAY['auth','smoke'],3),
(1,'Prevent read-only execution','Read-only users must not execute tests','Critical','Regression','Read-only user exists','Execution button disabled',ARRAY['rbac','security'],2),
(1,'Create API test case','Lead can create a new API test case','Medium','API','Lead is logged in','Test case is visible in list',ARRAY['api','crud'],2),
(1,'Dashboard analytics render','Charts show execution summary','High','UI','Executions exist','Charts render without errors',ARRAY['dashboard','charts'],3),
(1,'Bulk priority update','Multiple test cases can be updated together','Medium','Functional','Test cases selected','Priority changes saved',ARRAY['bulk'],2);

INSERT INTO test_steps (test_case_id,step_order,action,expected_result) VALUES
(1,1,'Open login page','Login form is visible'),(1,2,'Enter valid credentials','Credentials are accepted'),(1,3,'Submit form','Dashboard opens'),
(2,1,'Login as read-only','User reaches dashboard'),(2,2,'Open execution page','Execute controls are disabled'),
(3,1,'Open test cases','Create button is visible'),(3,2,'Submit required fields','New test case appears'),
(4,1,'Open dashboard','Pie, line, and bar charts are visible'),
(5,1,'Select multiple cases','Bulk toolbar appears'),(5,2,'Choose High priority','Selected cases update');

INSERT INTO test_suites (project_id,name,description) VALUES
(1,'Smoke Suite','Critical smoke tests'),(1,'Regression Suite','Main regression coverage');

INSERT INTO test_suite_cases (suite_id,test_case_id) VALUES (1,1),(1,4),(2,2),(2,3),(2,5);

INSERT INTO test_executions (test_case_id,executed_by,status,comments,executed_at) VALUES
(1,3,'Pass','Login works',now() - interval '5 days'),
(2,2,'Pass','RBAC verified',now() - interval '4 days'),
(3,2,'Fail','Validation issue found',now() - interval '3 days'),
(4,3,'Blocked','Waiting for analytics API',now() - interval '2 days'),
(5,3,'Skipped','Deferred to next cycle',now() - interval '1 day');

INSERT INTO defects (test_execution_id,title,description,created_by) VALUES
(3,'API test case validation fails','The API accepts empty expected result in one step.',2);

-- Demo password for all users: Password123!
