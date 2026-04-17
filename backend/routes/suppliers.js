const express = require('express');
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/suppliers — list user's suppliers
router.get('/', (req, res, next) => {
  try {
    const suppliers = db.prepare(
      'SELECT * FROM suppliers WHERE user_id = ? ORDER BY created_at ASC'
    ).all(req.user.id);

    // Attach categories for each supplier
    const getCats = db.prepare(`
      SELECT c.id, c.name, c.sort_order
      FROM categories c
      JOIN supplier_categories sc ON sc.category_id = c.id
      WHERE sc.supplier_id = ?
      ORDER BY c.sort_order ASC
    `);

    const result = suppliers.map(s => ({
      ...s,
      categories: getCats.all(s.id)
    }));

    res.json({ suppliers: result });
  } catch (err) {
    next(err);
  }
});

// POST /api/suppliers — create supplier
router.post('/', (req, res, next) => {
  try {
    const { name, category_ids } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Supplier name is required' });
    }

    const result = db.prepare(
      'INSERT INTO suppliers (name, user_id) VALUES (?, ?)'
    ).run(name, req.user.id);

    const supplierId = result.lastInsertRowid;

    // Link categories if provided
    if (category_ids && Array.isArray(category_ids)) {
      const insertCat = db.prepare(
        'INSERT OR IGNORE INTO supplier_categories (supplier_id, category_id) VALUES (?, ?)'
      );
      for (const catId of category_ids) {
        insertCat.run(supplierId, catId);
      }
    }

    const supplier = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(supplierId);
    res.status(201).json({ supplier });
  } catch (err) {
    next(err);
  }
});

// PUT /api/suppliers/:id — update supplier
router.put('/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, category_ids } = req.body;

    // Verify ownership
    const existing = db.prepare(
      'SELECT * FROM suppliers WHERE id = ? AND user_id = ?'
    ).get(id, req.user.id);

    if (!existing) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    if (name) {
      db.prepare('UPDATE suppliers SET name = ? WHERE id = ?').run(name, id);
    }

    // Update category links if provided
    if (category_ids && Array.isArray(category_ids)) {
      db.prepare('DELETE FROM supplier_categories WHERE supplier_id = ?').run(id);
      const insertCat = db.prepare(
        'INSERT OR IGNORE INTO supplier_categories (supplier_id, category_id) VALUES (?, ?)'
      );
      for (const catId of category_ids) {
        insertCat.run(id, catId);
      }
    }

    const supplier = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(id);
    res.json({ supplier });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/suppliers/:id — delete supplier + cascade materials
router.delete('/:id', (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const existing = db.prepare(
      'SELECT * FROM suppliers WHERE id = ? AND user_id = ?'
    ).get(id, req.user.id);

    if (!existing) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    // Cascade: delete materials, supplier_categories, then supplier
    // Foreign key cascades handle materials and supplier_categories
    db.prepare('DELETE FROM suppliers WHERE id = ?').run(id);

    res.json({ message: 'Supplier deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
