import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import projectRoutes from './routes/projects.js';
import testCaseRoutes from './routes/testcases.js';
import suiteRoutes from './routes/suites.js';
import executionRoutes from './routes/executions.js';
import analyticsRoutes from './routes/analytics.js';
import { sanitizeBody } from './middleware/validate.js';
import { swaggerSpec } from './swagger.js';

export const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));
app.use(sanitizeBody);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/testcases', testCaseRoutes);
app.use('/api/suites', suiteRoutes);
app.use('/api/executions', executionRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(error.status || 500).json({ message: error.message || 'Internal server error' });
});
