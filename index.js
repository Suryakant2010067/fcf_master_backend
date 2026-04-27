require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db/connection');
const seedDatabase = require('./db/seed');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
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

// Initialize DB and start server
async function startServer() {
  try {


    // Seed data
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`🚀 FCF Master API running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Server startup error:', err.message);
    process.exit(1);
  }
}

startServer();
