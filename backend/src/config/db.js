import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

export async function query(text, params = []) {
  const started = Date.now();
  const result = await pool.query(text, params);
  if (process.env.NODE_ENV !== 'test') {
    console.log(`${text.split('\n')[0]} - ${Date.now() - started}ms`);
  }
  return result;
}
