import express from 'express';
import multer from 'multer';
import { query } from '../config/db.js';
import { invalidate } from '../config/redis.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { executionLimiter } from '../middleware/rateLimits.js';

const upload = multer({ dest: 'uploads/', limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (_req, file, cb) => cb(null, ['image/png', 'image/jpeg', 'application/pdf', 'text/plain'].includes(file.mimetype)) });
const router = express.Router();
router.use(authenticate, executionLimiter);

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT te.*, tc.title, u.name AS tester_name FROM test_executions te JOIN test_cases tc ON tc.id=te.test_case_id JOIN users u ON u.id=te.executed_by WHERE ($1::int IS NULL OR tc.project_id=$1) ORDER BY te.executed_at DESC LIMIT 100', [req.query.projectId || null]);
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

router.post('/', authorize('admin', 'test-lead', 'tester'), upload.array('attachments', 3), async (req, res, next) => {
  try {
    const { test_case_id, status, comments, defect_title, defect_description } = req.body;
    const attachments = (req.files || []).map((file) => ({ filename: file.filename, originalname: file.originalname, path: file.path }));
    const { rows } = await query('INSERT INTO test_executions (test_case_id,executed_by,status,comments,attachments) VALUES ($1,$2,$3,$4,$5) RETURNING *', [test_case_id, req.user.id, status, comments, JSON.stringify(attachments)]);
    if (status === 'Fail' && defect_title) await query('INSERT INTO defects (test_execution_id,title,description,created_by) VALUES ($1,$2,$3,$4)', [rows[0].id, defect_title, defect_description, req.user.id]);
    await invalidate('analytics:*');
    res.status(201).json(rows[0]);
  } catch (error) {
    next(error);
  }
});

export default router;
