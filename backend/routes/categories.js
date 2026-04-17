const express = require('express');
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/categories — list categories
router.get('/', (req, res, next) => {
  try {
    const categories = db.prepare(
      'SELECT * FROM categories WHERE user_id = ? ORDER BY sort_order ASC, name ASC'
    ).all(req.user.id);

    res.json({ categories });
  } catch (err) {
    next(err);
  }
});

// POST /api/categories — create category
router.post('/', (req, res, next) => {
  try {
    const { name, sort_order } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    // Get next sort_order if not provided
    let order = sort_order;
    if (order === undefined) {
      const max = db.prepare(
        'SELECT MAX(sort_order) as max_order FROM categories WHERE user_id = ?'
      ).get(req.user.id);
      order = (max.max_order || 0) + 1;
    }

    const result = db.prepare(
      'INSERT INTO categories (name, user_id, sort_order) VALUES (?, ?, ?)'
    ).run(name, req.user.id, order);

    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ category });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/categories/:id — delete category + cascade materials
router.delete('/:id', (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const existing = db.prepare(
      'SELECT * FROM categories WHERE id = ? AND user_id = ?'
    ).get(id, req.user.id);

    if (!existing) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Materials with this category_id will have category_id set to NULL (ON DELETE SET NULL)
    // supplier_categories entries will cascade delete
    db.prepare('DELETE FROM categories WHERE id = ?').run(id);

    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
