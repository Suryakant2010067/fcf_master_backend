const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// GET /api/finance
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT f.*, p.name as project_name
      FROM finance f
      JOIN projects p ON f.project_id = p.id
      ORDER BY p.id, f.financial_year
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/finance/summary
router.get('/summary', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.name as project_name,
        SUM(f.budget_amount) as total_budget,
        SUM(f.actual_amount) as total_actual,
        SUM(f.variance) as total_variance
      FROM finance f
      JOIN projects p ON f.project_id = p.id
      GROUP BY p.id, p.name
      ORDER BY p.id
    `);
    const overall = await pool.query(`
      SELECT SUM(total_budget) as total_budget, SUM(budget_utilized) as utilized
      FROM projects
    `);
    res.json({
      projectSummary: result.rows,
      overall: overall.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/finance
router.post('/', async (req, res) => {
  try {
    const { project_id, financial_year, category, budget_amount, actual_amount } = req.body;
    const variance = budget_amount - actual_amount;
    const status = variance >= 0 ? 'Under Budget' : 'Over Budget';
    const result = await pool.query(
      `INSERT INTO finance (project_id, financial_year, category, budget_amount, actual_amount, variance, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [project_id, financial_year, category, budget_amount, actual_amount, variance, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
