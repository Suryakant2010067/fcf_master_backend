const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// GET /api/carbon
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT cc.*, p.name as project_name, p.code as project_code
      FROM carbon_credits cc
      JOIN projects p ON cc.project_id = p.id
      ORDER BY p.id, cc.year
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/carbon/summary
router.get('/summary', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.name as project_name,
        p.code,
        SUM(cc.anticipated_er) as total_anticipated,
        SUM(cc.actual_issued) as total_issued,
        SUM(cc.retired) as total_retired,
        SUM(cc.wip) as total_wip
      FROM carbon_credits cc
      JOIN projects p ON cc.project_id = p.id
      GROUP BY p.id, p.name, p.code
      ORDER BY p.id
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/carbon/yearly
router.get('/yearly', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT year,
        SUM(anticipated_er) as total_anticipated,
        SUM(actual_issued) as total_issued,
        SUM(retired) as total_retired,
        SUM(wip) as total_wip
      FROM carbon_credits
      GROUP BY year
      ORDER BY year
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/carbon/:project_id
router.get('/:project_id', async (req, res) => {
  try {
    const { project_id } = req.params;
    const result = await pool.query(
      'SELECT * FROM carbon_credits WHERE project_id = $1 ORDER BY year',
      [project_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
