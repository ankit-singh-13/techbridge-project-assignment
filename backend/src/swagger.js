export const swaggerSpec = {
  openapi: '3.0.0',
  info: { title: 'Test Case Management API', version: '1.0.0' },
  servers: [{ url: 'http://localhost:5001/api' }],
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } }
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/auth/login': { post: { summary: 'Login user' } },
    '/auth/register': { post: { summary: 'Register user' } },
    '/users': { get: { summary: 'Admin only user list' } },
    '/projects': { get: { summary: 'List projects' }, post: { summary: 'Create project: admin/test-lead' } },
    '/testcases': { get: { summary: 'List and filter test cases' }, post: { summary: 'Create test case: admin/test-lead' } },
    '/testcases/{id}': { put: { summary: 'Update test case: admin/test-lead' }, delete: { summary: 'Delete test case: admin/test-lead' } },
    '/testcases/bulk': { patch: { summary: 'Bulk delete/update/assign suite' } },
    '/suites': { get: { summary: 'List test suites' }, post: { summary: 'Create suite: admin/test-lead' } },
    '/executions': { get: { summary: 'Execution history' }, post: { summary: 'Execute test case: admin/test-lead/tester' } },
    '/analytics': { get: { summary: 'Dashboard analytics with Redis cache' } }
  }
};
