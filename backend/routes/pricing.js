const express = require('express');
const supabase = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { adapters } = require('../services/supplierApi');

const router = express.Router();

// Reject CSV payloads that would make per-row processing unreasonable.
// 512 KB covers thousands of realistic pricing rows; 5 000 rows is a practical
// ceiling for a single import batch (larger sets should use a background job).
const CSV_MAX_BYTES = 512 * 1024;
const CSV_MAX_ROWS = 5000;

// All routes require authentication
router.use(authenticate);

// GET /api/pricing/fetch/:supplierName: stub for supplier API integration
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
        hint: 'Add a new adapter in services/supplierApi.js to support this supplier',
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
        note: 'Replace stub adapters in services/supplierApi.js with real API integrations',
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/pricing/import: import CSV pricing data for a supplier
router.post('/import', async (req, res, next) => {
  try {
    const { supplier_id, csv_data } = req.body;

    if (!supplier_id || !csv_data) {
      return res.status(400).json({ error: 'supplier_id and csv_data are required' });
    }

    // Enforce size bounds before any parsing work
    if (Buffer.byteLength(csv_data, 'utf8') > CSV_MAX_BYTES) {
      return res.status(400).json({
        error: `CSV exceeds maximum allowed size of ${CSV_MAX_BYTES / 1024} KB`,
      });
    }

    const lines = csv_data.trim().split('\n');
    const dataLines = lines.slice(1); // everything after the header

    if (dataLines.length > CSV_MAX_ROWS) {
      return res.status(400).json({
        error: `CSV exceeds maximum of ${CSV_MAX_ROWS} data rows per import`,
      });
    }

    // Verify supplier belongs to the authenticated user
    const { data: supplier } = await supabase
      .from('suppliers')
      .select('id')
      .eq('id', supplier_id)
      .eq('user_id', req.user.id)
      .single();

    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    // Parse CSV header
    // Expected columns: name,sku,unit,price_per_unit,category_name,coverage_per_unit,calc_type
    const header = lines[0]
      .toLowerCase()
      .split(',')
      .map((h) => h.trim());

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

    // Pre-fetch all categories for this user once so each row doesn't hit the DB
    const categoryCache = new Map();
    if (categoryIdx !== -1) {
      const { data: categories } = await supabase
        .from('categories')
        .select('id, name')
        .eq('user_id', req.user.id);
      for (const cat of categories || []) {
        categoryCache.set(cat.name.toLowerCase(), cat.id);
      }
    }

    const imported = [];
    const errors = [];

    for (let i = 0; i < dataLines.length; i++) {
      const lineNum = i + 2; // 1-indexed, +1 for header row
      const cols = dataLines[i].split(',').map((c) => c.trim());

      const name = cols[nameIdx];
      if (!name) {
        errors.push({ line: lineNum, error: 'Missing name' });
        continue;
      }

      let category_id = null;
      if (categoryIdx !== -1 && cols[categoryIdx]) {
        category_id = categoryCache.get(cols[categoryIdx].toLowerCase()) || null;
      }

      const price_per_unit = Math.max(0, priceIdx !== -1 ? parseFloat(cols[priceIdx]) || 0 : 0);
      const coverage_per_unit = Math.max(
        0,
        coverageIdx !== -1 ? parseFloat(cols[coverageIdx]) || 0 : 0
      );

      const { data: material, error: insertErr } = await supabase
        .from('materials')
        .insert({
          supplier_id,
          name,
          sku: skuIdx !== -1 ? cols[skuIdx] || '' : '',
          unit: unitIdx !== -1 ? cols[unitIdx] || 'each' : 'each',
          price_per_unit,
          category_id,
          coverage_per_unit,
          calc_type: calcTypeIdx !== -1 ? cols[calcTypeIdx] || 'sqft' : 'sqft',
        })
        .select('id')
        .single();

      if (insertErr) {
        errors.push({ line: lineNum, name, error: insertErr.message });
      } else {
        imported.push({ id: material.id, name, line: lineNum });
      }
    }

    res.json({
      message: `Imported ${imported.length} materials`,
      imported_count: imported.length,
      error_count: errors.length,
      imported,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
