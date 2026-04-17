const express = require('express');
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { adapters } = require('../services/supplierApi');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/pricing/fetch/:supplierName — stub for supplier API integration
router.get('/fetch/:supplierName', (req, res, next) => {
  try {
    const { supplierName } = req.params;
    const normalizedName = supplierName.toLowerCase().replace(/\s+/g, '-');

    const adapter = adapters[normalizedName];

    if (!adapter) {
      return res.status(404).json({
        error: `No pricing adapter found for "${supplierName}"`,
        available_adapters: Object.keys(adapters),
        // Adapter pattern: register new supplier adapters in services/supplierApi.js
        // Each adapter implements: fetchPricing(), searchProducts(), getProductDetail()
        hint: 'Add a new adapter in services/supplierApi.js to support this supplier'
      });
    }

    // Call the adapter's fetchPricing method
    const pricingData = adapter.fetchPricing();

    res.json({
      supplier: supplierName,
      // In production, this would return real pricing from the supplier's API
      // For now, returns stub data showing the expected response format
      data: pricingData,
      _meta: {
        adapter: normalizedName,
        fetched_at: new Date().toISOString(),
        is_stub: true,
        note: 'Replace stub adapters in services/supplierApi.js with real API integrations'
      }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/pricing/import — import CSV pricing data
router.post('/import', (req, res, next) => {
  try {
    const { supplier_id, csv_data } = req.body;

    if (!supplier_id || !csv_data) {
      return res.status(400).json({ error: 'supplier_id and csv_data are required' });
    }

    // Verify supplier belongs to user
    const supplier = db.prepare(
      'SELECT * FROM suppliers WHERE id = ? AND user_id = ?'
    ).get(supplier_id, req.user.id);

    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    // Parse CSV data
    // Expected format: name,sku,unit,price_per_unit,category_name,coverage_per_unit,calc_type
    const lines = csv_data.trim().split('\n');
    const header = lines[0].toLowerCase().split(',').map(h => h.trim());

    // Validate required columns
    const nameIdx = header.indexOf('name');
    if (nameIdx === -1) {
      return res.status(400).json({ error: 'CSV must have a "name" column' });
    }

    const skuIdx = header.indexOf('sku');
    const unitIdx = header.indexOf('unit');
    const priceIdx = header.indexOf('price_per_unit');
    const categoryIdx = header.indexOf('category_name');
    const coverageIdx = header.indexOf('coverage_per_unit');
    const calcTypeIdx = header.indexOf('calc_type');

    const imported = [];
    const errors = [];

    const insertMaterial = db.prepare(`
      INSERT INTO materials (supplier_id, name, sku, unit, price_per_unit, category_id, coverage_per_unit, calc_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const importTransaction = db.transaction((dataLines) => {
      for (let i = 0; i < dataLines.length; i++) {
        const lineNum = i + 2; // +2 for 1-indexed and header row
        const cols = dataLines[i].split(',').map(c => c.trim());

        const name = cols[nameIdx];
        if (!name) {
          errors.push({ line: lineNum, error: 'Missing name' });
          continue;
        }

        // Look up category if provided
        let category_id = null;
        if (categoryIdx !== -1 && cols[categoryIdx]) {
          const cat = db.prepare(
            'SELECT id FROM categories WHERE name = ? AND user_id = ?'
          ).get(cols[categoryIdx], req.user.id);
          if (cat) {
            category_id = cat.id;
          }
        }

        try {
          const result = insertMaterial.run(
            supplier_id,
            name,
            skuIdx !== -1 ? (cols[skuIdx] || '') : '',
            unitIdx !== -1 ? (cols[unitIdx] || 'each') : 'each',
            priceIdx !== -1 ? (parseFloat(cols[priceIdx]) || 0) : 0,
            category_id,
            coverageIdx !== -1 ? (parseFloat(cols[coverageIdx]) || 0) : 0,
            calcTypeIdx !== -1 ? (cols[calcTypeIdx] || 'sqft') : 'sqft'
          );
          imported.push({ id: result.lastInsertRowid, name, line: lineNum });
        } catch (insertErr) {
          errors.push({ line: lineNum, name, error: insertErr.message });
        }
      }
    });

    importTransaction(lines.slice(1)); // Skip header

    res.json({
      message: `Imported ${imported.length} materials`,
      imported_count: imported.length,
      error_count: errors.length,
      imported,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
