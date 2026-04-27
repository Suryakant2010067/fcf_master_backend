const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// GET /api/dashboard/stats
router.get('/stats', async (req, res) => {
  try {
    const projectsRes = await pool.query('SELECT COUNT(*) as count FROM projects');
    const budgetRes = await pool.query('SELECT SUM(total_budget) as total, SUM(budget_utilized) as utilized FROM projects');
    const farmersRes = await pool.query('SELECT SUM(total_farmers) as total FROM projects');
    const treesRes = await pool.query('SELECT SUM(trees_planted) as total FROM projects');
    const ccRes = await pool.query(`
      SELECT 
        SUM(anticipated_er) as anticipated,
        SUM(actual_issued) as issued,
        SUM(retired) as retired,
        SUM(wip) as wip
      FROM carbon_credits
    `);
    const projectsData = await pool.query(`
      SELECT id, name, code, status, total_budget, budget_utilized, trees_planted, total_farmers
      FROM projects ORDER BY id
    `);

    res.json({
      totalProjects: parseInt(projectsRes.rows[0].count),
      totalBudget: parseFloat(budgetRes.rows[0].total) || 0,
      budgetUtilized: parseFloat(budgetRes.rows[0].utilized) || 0,
      totalFarmers: parseInt(farmersRes.rows[0].total) || 0,
      totalTrees: parseInt(treesRes.rows[0].total) || 0,
      carbonCredits: {
        anticipated: parseFloat(ccRes.rows[0].anticipated) || 0,
        issued: parseFloat(ccRes.rows[0].issued) || 0,
        retired: parseFloat(ccRes.rows[0].retired) || 0,
        wip: parseFloat(ccRes.rows[0].wip) || 0,
      },
      projects: projectsData.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
