const express = require('express');
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/materials/supplier/:supplierId — list materials for a supplier
router.get('/supplier/:supplierId', (req, res, next) => {
  try {
    const { supplierId } = req.params;

    // Verify supplier belongs to user
    const supplier = db.prepare(
      'SELECT * FROM suppliers WHERE id = ? AND user_id = ?'
    ).get(supplierId, req.user.id);

    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    const materials = db.prepare(`
      SELECT m.*, c.name as category_name
      FROM materials m
      LEFT JOIN categories c ON m.category_id = c.id
      WHERE m.supplier_id = ?
      ORDER BY c.sort_order ASC, m.sort_order ASC, m.name ASC
    `).all(supplierId);

    res.json({ materials });
  } catch (err) {
    next(err);
  }
});

// POST /api/materials — create material
router.post('/', (req, res, next) => {
  try {
    const { supplier_id, name, sku, unit, price_per_unit, category_id, coverage_per_unit, calc_type, sort_order } = req.body;

    if (!supplier_id || !name) {
      return res.status(400).json({ error: 'supplier_id and name are required' });
    }

    // Verify supplier belongs to user
    const supplier = db.prepare(
      'SELECT * FROM suppliers WHERE id = ? AND user_id = ?'
    ).get(supplier_id, req.user.id);

    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    const result = db.prepare(`
      INSERT INTO materials (supplier_id, name, sku, unit, price_per_unit, category_id, coverage_per_unit, calc_type, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      supplier_id,
      name,
      sku || '',
      unit || 'each',
      price_per_unit || 0,
      category_id || null,
      coverage_per_unit || 0,
      calc_type || 'sqft',
      sort_order || 0
    );

    const material = db.prepare('SELECT * FROM materials WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ material });
  } catch (err) {
    next(err);
  }
});

// PUT /api/materials/:id — update material
router.put('/:id', (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify material belongs to user via supplier
    const existing = db.prepare(`
      SELECT m.* FROM materials m
      JOIN suppliers s ON m.supplier_id = s.id
      WHERE m.id = ? AND s.user_id = ?
    `).get(id, req.user.id);

    if (!existing) {
      return res.status(404).json({ error: 'Material not found' });
    }

    const fields = ['name', 'sku', 'unit', 'price_per_unit', 'category_id', 'coverage_per_unit', 'calc_type', 'sort_order', 'supplier_id'];
    const updates = [];
    const values = [];

    for (const field of fields) {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(req.body[field]);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    db.prepare(`UPDATE materials SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    const material = db.prepare('SELECT * FROM materials WHERE id = ?').get(id);
    res.json({ material });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/materials/:id — delete material
router.delete('/:id', (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify material belongs to user via supplier
    const existing = db.prepare(`
      SELECT m.* FROM materials m
      JOIN suppliers s ON m.supplier_id = s.id
      WHERE m.id = ? AND s.user_id = ?
    `).get(id, req.user.id);

    if (!existing) {
      return res.status(404).json({ error: 'Material not found' });
    }

    db.prepare('DELETE FROM materials WHERE id = ?').run(id);
    res.json({ message: 'Material deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// POST /api/materials/reorder — bulk update sort_order
router.post('/reorder', (req, res, next) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'items array is required with { id, sort_order } objects' });
    }

    const update = db.prepare('UPDATE materials SET sort_order = ? WHERE id = ?');

    const reorderTransaction = db.transaction((items) => {
      for (const item of items) {
        // Verify ownership for each item
        const existing = db.prepare(`
          SELECT m.id FROM materials m
          JOIN suppliers s ON m.supplier_id = s.id
          WHERE m.id = ? AND s.user_id = ?
        `).get(item.id, req.user.id);

        if (!existing) {
          throw Object.assign(new Error(`Material ${item.id} not found`), { statusCode: 404 });
        }

        update.run(item.sort_order, item.id);
      }
    });

    reorderTransaction(items);
    res.json({ message: 'Materials reordered successfully' });
  } catch (err) {
    next(err);
  }
});

// POST /api/materials/duplicate — copy material to another supplier
router.post('/duplicate', (req, res, next) => {
  try {
    const { material_id, target_supplier_id } = req.body;

    if (!material_id || !target_supplier_id) {
      return res.status(400).json({ error: 'material_id and target_supplier_id are required' });
    }

    // Verify source material belongs to user
    const source = db.prepare(`
      SELECT m.* FROM materials m
      JOIN suppliers s ON m.supplier_id = s.id
      WHERE m.id = ? AND s.user_id = ?
    `).get(material_id, req.user.id);

    if (!source) {
      return res.status(404).json({ error: 'Source material not found' });
    }

    // Verify target supplier belongs to user
    const targetSupplier = db.prepare(
      'SELECT * FROM suppliers WHERE id = ? AND user_id = ?'
    ).get(target_supplier_id, req.user.id);

    if (!targetSupplier) {
      return res.status(404).json({ error: 'Target supplier not found' });
    }

    const result = db.prepare(`
      INSERT INTO materials (supplier_id, name, sku, unit, price_per_unit, category_id, coverage_per_unit, calc_type, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      target_supplier_id,
      source.name,
      source.sku,
      source.unit,
      source.price_per_unit,
      source.category_id,
      source.coverage_per_unit,
      source.calc_type,
      source.sort_order
    );

    const material = db.prepare('SELECT * FROM materials WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ material });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
