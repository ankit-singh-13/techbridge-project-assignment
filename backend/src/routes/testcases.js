import express from 'express';
import { body } from 'express-validator';
import { query } from '../config/db.js';
import { invalidate } from '../config/redis.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { testCaseLimiter } from '../middleware/rateLimits.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();
router.use(authenticate, testCaseLimiter);

router.get('/', async (req, res, next) => {
  try {
    const { projectId, search = '', priority, type, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const values = [projectId, `%${search}%`, priority || null, type || null, Number(limit), offset];
    const { rows } = await query(`SELECT tc.*, u.name AS assigned_to_name, COUNT(*) OVER() AS total
      FROM test_cases tc LEFT JOIN users u ON u.id=tc.assigned_to
      WHERE ($1::int IS NULL OR tc.project_id=$1) AND (tc.title ILIKE $2 OR $2='%%')
      AND ($3::text IS NULL OR tc.priority=$3) AND ($4::text IS NULL OR tc.type=$4)
      ORDER BY tc.created_at DESC LIMIT $5 OFFSET $6`, values);
    res.json({ data: rows, total: Number(rows[0]?.total || 0), page: Number(page), limit: Number(limit) });
  } catch (error) {
    next(error);
  }
});

router.post('/', authorize('admin', 'test-lead'), [body('title').notEmpty(), body('project_id').isInt()], validate, async (req, res, next) => {
  try {
    const { project_id, title, description, priority, type, preconditions, postconditions, tags = [], steps = [], assigned_to } = req.body;
    const { rows } = await query('INSERT INTO test_cases (project_id,title,description,priority,type,preconditions,postconditions,tags,assigned_to) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *', [project_id, title, description, priority, type, preconditions, postconditions, tags, assigned_to]);
    await Promise.all(steps.map((step, index) => query('INSERT INTO test_steps (test_case_id,step_order,action,expected_result) VALUES ($1,$2,$3,$4)', [rows[0].id, index + 1, step.action, step.expected_result])));
    await invalidate('analytics:*');
    res.status(201).json(rows[0]);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authorize('admin', 'test-lead'), async (req, res, next) => {
  try {
    const { title, description, priority, type, preconditions, postconditions, tags, assigned_to } = req.body;
    const { rows } = await query('UPDATE test_cases SET title=$1,description=$2,priority=$3,type=$4,preconditions=$5,postconditions=$6,tags=$7,assigned_to=$8,updated_at=now() WHERE id=$9 RETURNING *', [title, description, priority, type, preconditions, postconditions, tags, assigned_to, req.params.id]);
    await invalidate('analytics:*');
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authorize('admin', 'test-lead'), async (req, res, next) => {
  try {
    await query('DELETE FROM test_cases WHERE id=$1', [req.params.id]);
    await invalidate('analytics:*');
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

router.patch('/bulk', authorize('admin', 'test-lead'), async (req, res, next) => {
  try {
    const { ids, priority, suiteId, action } = req.body;
    if (action === 'delete') await query('DELETE FROM test_cases WHERE id=ANY($1::int[])', [ids]);
    if (action === 'priority') await query('UPDATE test_cases SET priority=$1 WHERE id=ANY($2::int[])', [priority, ids]);
    if (action === 'suite') await Promise.all(ids.map((id) => query('INSERT INTO test_suite_cases (suite_id,test_case_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [suiteId, id])));
    await invalidate('analytics:*');
    res.json({ message: 'Bulk operation completed' });
  } catch (error) {
    next(error);
  }
});

export default router;
