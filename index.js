require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db/connection');
const seedDatabase = require('./db/seed');

const app = express();
const PORT = process.env.PORT || 5001;

// Detailed CORS Setup to prevent Vercel blocking
app.use(cors({
  origin: ['https://fcf-master-app-1wgn.vercel.app', 'http://localhost:5173', 'http://localhost:3003'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/carbon', require('./routes/carbon'));
app.use('/api/finance', require('./routes/finance'));
app.use('/api/procurement', require('./routes/procurement'));
app.use('/api/team', require('./routes/team'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'FCF Master API running', port: PORT });
});

// Root path for debugging
app.get('/', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.send(`
      <div style="font-family: sans-serif; text-align: center; padding: 50px;">
        <h1 style="color: #22c55e;">✅ API is LIVE!</h1>
        <p>The backend is running perfectly on port ${PORT}.</p>
        <p style="color: #22c55e; font-weight: bold;">🟢 Database Connection: SUCCESSFUL</p>
        <p>Your frontend can now talk to this API.</p>
      </div>
    `);
  } catch (err) {
    res.send(`
      <div style="font-family: sans-serif; text-align: center; padding: 50px;">
        <h1 style="color: #22c55e;">✅ API is LIVE!</h1>
        <p>The backend is running perfectly on port ${PORT}.</p>
        <p style="color: red; font-weight: bold;">🔴 Database Connection: FAILED</p>
        <p style="background: #f1f1f1; padding: 10px; border-radius: 5px; color: red;">Error: ${err.message}</p>
        <p>Please check your DB_HOST, DB_USER, DB_PASS, and ensure Render's IP (0.0.0.0/0) is allowed in Google Cloud SQL.</p>
      </div>
    `);
  }
});

// Initialize DB and start server
async function startServer() {
  try {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 FCF Master API running on port ${PORT}`);
    });

    // Seed data
    await seedDatabase();
  } catch (err) {
    console.error('❌ Server startup error (Database Seed Failed):', err.message);
    // DO NOT exit process here, otherwise Render returns 502 Bad Gateway
    // We want the server to stay alive so it can show the error on the / route!
  }
}

startServer();
