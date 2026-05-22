import express from 'express';
import { query } from '../config/db.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticate, authorize('admin'));

router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await query('SELECT id,name,email,role,created_at FROM users ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

export default router;
