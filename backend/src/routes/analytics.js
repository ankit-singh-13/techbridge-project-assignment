import express from 'express';
import { query } from '../config/db.js';
import { getCache, setCache } from '../config/redis.js';
import { authenticate } from '../middleware/auth.js';
import { analyticsLimiter } from '../middleware/rateLimits.js';

const router = express.Router();
router.use(authenticate, analyticsLimiter);

router.get('/', async (req, res, next) => {
  try {
    const key = `analytics:${req.query.projectId || 'all'}`;
    const cached = await getCache(key);
    if (cached) return res.json({ data: cached, cache: 'hit' });
    const projectId = req.query.projectId || null;
    const [summary, priority, trends, testers, defects] = await Promise.all([
      query(`SELECT COALESCE(te.status,'Pending') AS status, COUNT(*)::int AS count FROM test_cases tc LEFT JOIN LATERAL (SELECT status FROM test_executions WHERE test_case_id=tc.id ORDER BY executed_at DESC LIMIT 1) te ON true WHERE ($1::int IS NULL OR tc.project_id=$1) GROUP BY COALESCE(te.status,'Pending')`, [projectId]),
      query('SELECT priority, COUNT(*)::int AS count FROM test_cases WHERE ($1::int IS NULL OR project_id=$1) GROUP BY priority', [projectId]),
      query(`SELECT date_trunc('day', te.executed_at)::date AS day, te.status, COUNT(*)::int AS count FROM test_executions te JOIN test_cases tc ON tc.id=te.test_case_id WHERE ($1::int IS NULL OR tc.project_id=$1) GROUP BY day, te.status ORDER BY day`, [projectId]),
      query(`SELECT u.name, COUNT(te.id)::int AS executed FROM users u JOIN test_executions te ON te.executed_by=u.id JOIN test_cases tc ON tc.id=te.test_case_id WHERE ($1::int IS NULL OR tc.project_id=$1) GROUP BY u.name`, [projectId]),
      query(`SELECT COUNT(d.id)::int AS defects, COUNT(DISTINCT tc.id)::int AS test_cases FROM defects d JOIN test_executions te ON te.id=d.test_execution_id JOIN test_cases tc ON tc.id=te.test_case_id WHERE ($1::int IS NULL OR tc.project_id=$1)`, [projectId])
    ]);
    const data = { summary: summary.rows, priority: priority.rows, trends: trends.rows, testers: testers.rows, defects: defects.rows[0] };
    await setCache(key, data, 900);
    res.json({ data, cache: 'miss' });
  } catch (error) {
    next(error);
  }
});

export default router;
