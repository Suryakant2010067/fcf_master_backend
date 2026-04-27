const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// GET /api/projects
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM projects ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/projects/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const project = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
    if (project.rows.length === 0) return res.status(404).json({ error: 'Project not found' });
    
    const monitoring = await pool.query(
      'SELECT * FROM monitoring_data WHERE project_id = $1 ORDER BY monitoring_date DESC',
      [id]
    );
    const finance = await pool.query(
      'SELECT * FROM finance WHERE project_id = $1 ORDER BY financial_year DESC',
      [id]
    );
    const credits = await pool.query(
      'SELECT * FROM carbon_credits WHERE project_id = $1 ORDER BY year',
      [id]
    );
    const procurement = await pool.query(
      'SELECT * FROM procurement WHERE project_id = $1 ORDER BY created_at DESC',
      [id]
    );

    res.json({
      project: project.rows[0],
      monitoring: monitoring.rows,
      finance: finance.rows,
      carbonCredits: credits.rows,
      procurement: procurement.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects
router.post('/', async (req, res) => {
  try {
    const { name, code, location, state, area_hectares, start_date, project_type, total_budget, description } = req.body;
    const result = await pool.query(
      `INSERT INTO projects (name, code, location, state, area_hectares, start_date, project_type, total_budget, description)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [name, code, location, state, area_hectares, start_date, project_type, total_budget, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
