const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// GET /api/team
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM team_members ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/team/by-department
router.get('/by-department', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT department, COUNT(*) as count, 
        json_agg(json_build_object('id', id, 'name', name, 'designation', designation, 'email', email, 'project_assignment', project_assignment, 'reporting_to', reporting_to)) as members
      FROM team_members
      GROUP BY department
      ORDER BY department
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
