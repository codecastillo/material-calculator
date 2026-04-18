const express = require('express');
const router = express.Router();
const supabase = require('../config/database');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/supplier/:supplierId', async (req, res, next) => {
  try {
    const { data: materials, error } = await supabase.from('materials')
      .select('*').eq('supplier_id', req.params.supplierId).order('sort_order');
    if (error) throw error;
    res.json({ materials: materials || [] });
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { supplier_id, name, sku, unit, price_per_unit, category_id, coverage_per_unit, calc_type, sort_order } = req.body;
    if (!supplier_id || !name) return res.status(400).json({ error: 'supplier_id and name required' });
    const { data: material, error } = await supabase.from('materials').insert({
      supplier_id, name, sku: sku || '', unit: unit || 'each',
      price_per_unit: price_per_unit || 0, category_id, coverage_per_unit: coverage_per_unit || 100,
      calc_type: calc_type || 'sqft', sort_order: sort_order || 0
    }).select().single();
    if (error) throw error;
    res.status(201).json({ material });
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const updates = {};
    ['name', 'sku', 'unit', 'price_per_unit', 'category_id', 'coverage_per_unit', 'calc_type', 'sort_order'].forEach(f => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });
    updates.updated_at = new Date().toISOString();
    const { data: material, error } = await supabase.from('materials').update(updates).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json({ material });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { error } = await supabase.from('materials').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) { next(err); }
});

router.post('/duplicate', async (req, res, next) => {
  try {
    const { material_id, target_supplier_id } = req.body;
    const { data: src } = await supabase.from('materials').select('*').eq('id', material_id).single();
    if (!src) return res.status(404).json({ error: 'Material not found' });
    const { id, created_at, updated_at, ...copy } = src;
    copy.supplier_id = target_supplier_id;
    const { data: material, error } = await supabase.from('materials').insert(copy).select().single();
    if (error) throw error;
    res.status(201).json({ material });
  } catch (err) { next(err); }
});

module.exports = router;
