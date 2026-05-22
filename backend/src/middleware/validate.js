import { validationResult } from 'express-validator';
import xss from 'xss';

export function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  return next();
}

export function sanitizeBody(req, _res, next) {
  const sanitize = (value) => {
    if (typeof value === 'string') return xss(value.trim());
    if (Array.isArray(value)) return value.map(sanitize);
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, sanitize(v)]));
    return value;
  };
  req.body = sanitize(req.body || {});
  next();
}
