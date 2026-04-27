const { Pool } = require('pg');
require('dotenv').config();

const isRender = process.env.RENDER === 'true';
const hasDbUrl = !!process.env.DATABASE_URL;

console.log('🔗 DB Connection Config:', hasDbUrl ? 'Using DATABASE_URL' : 'Using Local Config (Host: ' + (process.env.DB_HOST || 'localhost') + ')');

if (isRender && !hasDbUrl) {
  console.error('❌ FATAL: Running on Render but DATABASE_URL is not set in Environment Variables!');
}

const pool = new Pool(
  hasDbUrl
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || process.env.DB_PASS,
        database: process.env.DB_NAME,
      }
);

pool.on('connect', () => console.log('✅ PostgreSQL connected'));
pool.on('error', (err) => console.error('❌ DB error:', err));

module.exports = pool;
