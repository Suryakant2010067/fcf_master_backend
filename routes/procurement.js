const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// GET /api/procurement
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT pr.*, p.name as project_name
      FROM procurement pr
      JOIN projects p ON pr.project_id = p.id
      ORDER BY pr.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/procurement/stats
router.get('/stats', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'RFQ Sent' THEN 1 ELSE 0 END) as rfq_stage,
        SUM(CASE WHEN status = 'CS Approved' THEN 1 ELSE 0 END) as cs_stage,
        SUM(CASE WHEN status = 'PO Issued' THEN 1 ELSE 0 END) as po_stage,
        SUM(CASE WHEN status = 'Vendor Evaluation' THEN 1 ELSE 0 END) as eval_stage,
        SUM(COALESCE(po_amount, rfq_amount)) as total_value
      FROM procurement
    `);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/procurement
router.post('/', async (req, res) => {
  try {
    const { project_id, rfq_number, vendor_name, item_description, rfq_amount } = req.body;
    const result = await pool.query(
      `INSERT INTO procurement (project_id, rfq_number, vendor_name, item_description, rfq_amount, status, payment_status)
       VALUES ($1,$2,$3,$4,$5,'RFQ Sent','Not Applicable') RETURNING *`,
      [project_id, rfq_number, vendor_name, item_description, rfq_amount]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
