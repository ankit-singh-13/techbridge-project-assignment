import dotenv from 'dotenv';
import { app } from './app.js';
import { connectRedis } from './config/redis.js';

dotenv.config();

const port = process.env.PORT || 5001;

connectRedis().catch(() => console.warn('Starting without Redis cache.'));
app.listen(port, () => console.log(`API running on http://localhost:${port}`));
