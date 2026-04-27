const { Pool } = require('pg');
require('dotenv').config();

const isRender = process.env.RENDER === 'true';

// Try to use DATABASE_URL if provided (Standard Render setup)
let poolConfig = {};

if (process.env.DATABASE_URL) {
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000 // 5 seconds timeout
  };
  console.log('🔗 DB Config: Using DATABASE_URL');
} else {
  // Fallback to manual host/user/pass (Google Cloud SQL Public IP method)
  poolConfig = {
    host: process.env.DB_HOST, 
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl: isRender ? { rejectUnauthorized: false } : false, // Use SSL if on Render
    connectionTimeoutMillis: 5000 // 5 seconds timeout
  };
  console.log(`🔗 DB Config: Using DB_HOST (${process.env.DB_HOST})`);
}

const pool = new Pool(poolConfig);

pool.on('connect', () => console.log('✅ PostgreSQL connected successfully'));
pool.on('error', (err) => console.error('❌ DB error:', err));

module.exports = pool;
