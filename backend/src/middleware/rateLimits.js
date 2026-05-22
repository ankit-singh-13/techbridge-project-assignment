import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, standardHeaders: true });
export const testCaseLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 100, standardHeaders: true });
export const executionLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 200, standardHeaders: true });
export const analyticsLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 50, standardHeaders: true });
