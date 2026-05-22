import express from 'express';
import { body } from 'express-validator';
import { query } from '../config/db.js';
import { getCache, setCache, invalidate } from '../config/redis.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();
router.use(authenticate);

router.get('/', async (_req, res, next) => {
  try {
    const cached = await getCache('projects:metadata');
    if (cached) return res.json({ data: cached, cache: 'hit' });
    const { rows } = await query('SELECT * FROM projects ORDER BY created_at DESC');
    await setCache('projects:metadata', rows, 3600);
    res.json({ data: rows, cache: 'miss' });
  } catch (error) {
    next(error);
  }
});

router.post('/', authorize('admin', 'test-lead'), [body('name').notEmpty(), body('version').optional().isString()], validate, async (req, res, next) => {
  try {
    const { name, description, version, status = 'active', memberIds = [] } = req.body;
    const { rows } = await query('INSERT INTO projects (name,description,version,status) VALUES ($1,$2,$3,$4) RETURNING *', [name, description, version, status]);
    await Promise.all(memberIds.map((userId) => query('INSERT INTO project_members (project_id,user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [rows[0].id, userId])));
    await invalidate('projects:*');
    res.status(201).json(rows[0]);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authorize('admin', 'test-lead'), async (req, res, next) => {
  try {
    const { name, description, version, status } = req.body;
    const { rows } = await query('UPDATE projects SET name=$1,description=$2,version=$3,status=$4,updated_at=now() WHERE id=$5 RETURNING *', [name, description, version, status, req.params.id]);
    await invalidate('projects:*');
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
});

export default router;
