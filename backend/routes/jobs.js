const express = require('express');
const router = express.Router();
const supabase = require('../config/database');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const { data: jobs, error } = await supabase.from('jobs').select('*').eq('user_id', req.user.id).order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ jobs: jobs || [] });
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, project_name, project_address, supplier_id, sqft, linear_ft, waste_pct, profit_pct, tax_pct, labor_rate, selected_phases, material_total, selling_price } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const { data: job, error } = await supabase.from('jobs').insert({
      user_id: req.user.id, name, project_name: project_name || '', project_address: project_address || '',
      supplier_id, sqft: sqft || 0, linear_ft: linear_ft || 0, waste_pct: waste_pct || 10,
      profit_pct: profit_pct || 20, tax_pct: tax_pct || 0, labor_rate: labor_rate || 0,
      selected_phases: selected_phases || '[]', material_total: material_total || 0, selling_price: selling_price || 0
    }).select().single();
    if (error) throw error;
    res.status(201).json({ job });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { error } = await supabase.from('jobs').delete().eq('id', req.params.id).eq('user_id', req.user.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
