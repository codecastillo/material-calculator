const express = require('express');
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/jobs — list user's saved jobs
router.get('/', (req, res, next) => {
  try {
    const jobs = db.prepare(`
      SELECT j.*, s.name as supplier_name
      FROM jobs j
      LEFT JOIN suppliers s ON j.supplier_id = s.id
      WHERE j.user_id = ?
      ORDER BY j.created_at DESC
    `).all(req.user.id);

    // Parse selected_phases JSON string back to array
    const result = jobs.map(j => ({
      ...j,
      selected_phases: JSON.parse(j.selected_phases || '[]')
    }));

    res.json({ jobs: result });
  } catch (err) {
    next(err);
  }
});

// POST /api/jobs — save job
router.post('/', (req, res, next) => {
  try {
    const {
      name,
      project_name,
      project_address,
      supplier_id,
      sqft,
      linear_ft,
      waste_pct,
      profit_pct,
      tax_pct,
      labor_rate,
      selected_phases,
      material_total,
      selling_price
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Job name is required' });
    }

    const result = db.prepare(`
      INSERT INTO jobs (user_id, name, project_name, project_address, supplier_id, sqft, linear_ft, waste_pct, profit_pct, tax_pct, labor_rate, selected_phases, material_total, selling_price)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.user.id,
      name,
      project_name || '',
      project_address || '',
      supplier_id || null,
      sqft || 0,
      linear_ft || 0,
      waste_pct ?? 10,
      profit_pct ?? 20,
      tax_pct ?? 8.25,
      labor_rate || 0,
      JSON.stringify(selected_phases || []),
      material_total || 0,
      selling_price || 0
    );

    const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(result.lastInsertRowid);
    job.selected_phases = JSON.parse(job.selected_phases || '[]');

    res.status(201).json({ job });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/jobs/:id — delete job
router.delete('/:id', (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const existing = db.prepare(
      'SELECT * FROM jobs WHERE id = ? AND user_id = ?'
    ).get(id, req.user.id);

    if (!existing) {
      return res.status(404).json({ error: 'Job not found' });
    }

    db.prepare('DELETE FROM jobs WHERE id = ?').run(id);
    res.json({ message: 'Job deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
