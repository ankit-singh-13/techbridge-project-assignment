import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body } from 'express-validator';
import { query } from '../config/db.js';
import { authLimiter } from '../middleware/rateLimits.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

const signToken = (user) => jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' });

router.post('/register', authLimiter, [body('name').notEmpty(), body('email').isEmail(), body('password').isLength({ min: 6 })], validate, async (req, res, next) => {
  try {
    const { name, email, password, role = 'tester' } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const { rows } = await query('INSERT INTO users (name,email,password_hash,role) VALUES ($1,$2,$3,$4) RETURNING id,name,email,role', [name, email, passwordHash, role]);
    res.status(201).json({ user: rows[0], token: signToken(rows[0]) });
  } catch (error) {
    next(error);
  }
});

router.post('/login', authLimiter, [body('email').isEmail(), body('password').notEmpty()], validate, async (req, res, next) => {
  try {
    const { rows } = await query('SELECT id,name,email,password_hash,role FROM users WHERE email=$1', [req.body.email]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(req.body.password, user.password_hash))) return res.status(401).json({ message: 'Invalid credentials' });
    delete user.password_hash;
    res.json({ user, token: signToken(user) });
  } catch (error) {
    next(error);
  }
});

export default router;
