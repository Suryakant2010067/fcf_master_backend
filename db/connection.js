const { Pool } = require('pg');
const { Connector } = require('@google-cloud/cloud-sql-connector');
require('dotenv').config();

let poolInstance = null;

async function getPool() {
  if (poolInstance) return poolInstance;

  console.log(`🔗 DB Config: Using ONLY Google Cloud SQL Connector`);
  console.log(`📡 Instance: ${process.env.INSTANCE_CONNECTION_NAME}`);

  try {
    const connector = new Connector();
    const clientOpts = await connector.getOptions({
      instanceConnectionName: process.env.INSTANCE_CONNECTION_NAME,
      ipType: 'PUBLIC',
    });
    
    poolInstance = new Pool({
      ...clientOpts,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD || process.env.DB_PASS,
      database: process.env.DB_NAME,
      max: 10
    });

    poolInstance.on('connect', () => console.log('✅ Google Cloud SQL connected successfully'));
    poolInstance.on('error', (err) => console.error('❌ Google Cloud SQL error:', err));
    
  } catch (err) {
    console.error('❌ Failed to initialize Google Cloud SQL Connector:', err);
    throw err;
  }
  
  return poolInstance;
}

// Proxy object so existing code can use pool.query and pool.connect without breaking
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
