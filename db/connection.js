const { Pool } = require('pg');
const { Connector } = require('@google-cloud/cloud-sql-connector');
require('dotenv').config();

let poolInstance = null;

async function getPool() {
  if (poolInstance) return poolInstance;

  const isRender = process.env.RENDER === 'true';
  const hasDbUrl = !!process.env.DATABASE_URL;
  const hasGcpInstance = !!process.env.INSTANCE_CONNECTION_NAME;
  const dbUser = process.env.DB_USER || 'postgres';
  const dbPass = process.env.DB_PASSWORD || process.env.DB_PASS;
  const dbName = process.env.DB_NAME;

  if (hasGcpInstance) {
    console.log(`🔗 DB Config: Using Google Cloud SQL (${process.env.INSTANCE_CONNECTION_NAME})`);
    
    // Set Google App Credentials if provided
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.log(`🔑 Using GCP Credentials from: ${process.env.GOOGLE_APPLICATION_CREDENTIALS}`);
    }

    try {
      const connector = new Connector();
      const clientOpts = await connector.getOptions({
        instanceConnectionName: process.env.INSTANCE_CONNECTION_NAME,
        ipType: 'PUBLIC',
      });
      
      poolInstance = new Pool({
        ...clientOpts,
        user: dbUser,
        password: dbPass,
        database: dbName,
      });
    } catch (err) {
      console.error('❌ Failed to initialize Google Cloud SQL Connector:', err);
      throw err;
    }
  } else if (hasDbUrl) {
    console.log('🔗 DB Config: Using DATABASE_URL');
    poolInstance = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
  } else {
    console.log('🔗 DB Config: Using Local DB Host');
    if (isRender) {
      console.error('❌ FATAL: Running on Render but neither DATABASE_URL nor INSTANCE_CONNECTION_NAME is set!');
    }
    poolInstance = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: dbUser,
      password: dbPass,
      database: dbName,
    });
  }

  poolInstance.on('connect', () => console.log('✅ PostgreSQL connected successfully'));
  poolInstance.on('error', (err) => console.error('❌ DB error:', err));
  
  return poolInstance;
}

// Proxy object so existing code can use pool.query and pool.connect without changes
const poolProxy = {
  query: async (...args) => {
    const pool = await getPool();
    return pool.query(...args);
  },
  connect: async () => {
    const pool = await getPool();
    return pool.connect();
  }
};

module.exports = poolProxy;
