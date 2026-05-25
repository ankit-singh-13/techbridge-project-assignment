import express from 'express';
import { query } from '../config/db.js';
import { getCache, setCache, invalidate } from '../config/redis.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const key = `suites:${req.query.projectId || 'all'}`;
    const cached = await getCache(key);
    if (cached) return res.json({ data: cached, cache: 'hit' });
    const { rows } = await query(`SELECT ts.id, ts.project_id, ts.name, ts.description, ts.created_at,
      COUNT(tsc.test_case_id)::int AS case_count,
      COALESCE(json_agg(json_build_object('id', tc.id, 'title', tc.title) ORDER BY tc.title) FILTER (WHERE tc.id IS NOT NULL), '[]') AS cases
      FROM test_suites ts
      LEFT JOIN test_suite_cases tsc ON tsc.suite_id=ts.id
      LEFT JOIN test_cases tc ON tc.id=tsc.test_case_id
      WHERE ($1::int IS NULL OR ts.project_id=$1)
      GROUP BY ts.id
      ORDER BY ts.created_at DESC`, [req.query.projectId || null]);
    await setCache(key, rows, 1800);
    res.json({ data: rows, cache: 'miss' });
  } catch (error) {
    next(error);
  }
});

router.post('/', authorize('admin', 'test-lead'), async (req, res, next) => {
  try {
    const { rows } = await query('INSERT INTO test_suites (project_id,name,description) VALUES ($1,$2,$3) RETURNING *', [req.body.project_id, req.body.name, req.body.description]);
    await invalidate('suites:*');
    res.status(201).json(rows[0]);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/cases', authorize('admin', 'test-lead'), async (req, res, next) => {
  try {
    await query('INSERT INTO test_suite_cases (suite_id,test_case_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [req.params.id, req.body.test_case_id]);
    await invalidate('suites:*');
    res.status(201).json({ message: 'Test case added to suite' });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id/cases/:testCaseId', authorize('admin', 'test-lead'), async (req, res, next) => {
  try {
    await query('DELETE FROM test_suite_cases WHERE suite_id=$1 AND test_case_id=$2', [req.params.id, req.params.testCaseId]);
    await invalidate('suites:*');
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;
