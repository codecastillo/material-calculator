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
    const { name, project_name, project_address, supplier_id, client_id, status, sqft, linear_ft, waste_pct, profit_pct, tax_pct, labor_rate, selected_phases, material_total, selling_price } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const { data: job, error } = await supabase.from('jobs').insert({
      user_id: req.user.id, name, project_name: project_name || '', project_address: project_address || '',
      supplier_id, client_id: client_id || null, status: status || 'bidding',
      sqft: sqft || 0, linear_ft: linear_ft || 0, waste_pct: waste_pct || 10,
      profit_pct: profit_pct || 20, tax_pct: tax_pct || 0, labor_rate: labor_rate || 0,
      selected_phases: selected_phases || '[]', material_total: material_total || 0, selling_price: selling_price || 0
    }).select().single();
    if (error) throw error;
    res.status(201).json({ job });
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { name, project_name, project_address, supplier_id, client_id, status, sqft, linear_ft, waste_pct, profit_pct, tax_pct, labor_rate, selected_phases, material_total, selling_price } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (project_name !== undefined) updates.project_name = project_name;
    if (project_address !== undefined) updates.project_address = project_address;
    if (supplier_id !== undefined) updates.supplier_id = supplier_id;
    if (client_id !== undefined) updates.client_id = client_id;
    if (status !== undefined) updates.status = status;
    if (sqft !== undefined) updates.sqft = sqft;
    if (linear_ft !== undefined) updates.linear_ft = linear_ft;
    if (waste_pct !== undefined) updates.waste_pct = waste_pct;
    if (profit_pct !== undefined) updates.profit_pct = profit_pct;
    if (tax_pct !== undefined) updates.tax_pct = tax_pct;
    if (labor_rate !== undefined) updates.labor_rate = labor_rate;
    if (selected_phases !== undefined) updates.selected_phases = selected_phases;
    if (material_total !== undefined) updates.material_total = material_total;
    if (selling_price !== undefined) updates.selling_price = selling_price;
    const { data: job, error } = await supabase.from('jobs').update(updates)
      .eq('id', req.params.id).eq('user_id', req.user.id).select().single();
    if (error) throw error;
    res.json({ job });
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
