const express = require('express');
const router = express.Router();
const supabase = require('../config/database');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// Percentage fields are capped well above any realistic jobsite value so that
// a fat-finger (e.g. "200" for waste) is caught without rejecting legitimate
// edge cases like a high tax jurisdiction or an aggressive markup.
const MAX_WASTE_PCT = 100;
const MAX_PROFIT_PCT = 500;
const MAX_TAX_PCT = 30;

// Mirrors the frontend defaults so omitted fields land in the same state the
// UI would show on a fresh job.
const DEFAULT_WASTE_PCT = 10;
const DEFAULT_PROFIT_PCT = 20;
const DEFAULT_TAX_PCT = 0;

// Coerce and validate all numeric job fields from a raw request body.
// Returns { ok: true, fields } on success or { ok: false, message } on failure.
// Only validates fields that are present (PUT partial-update safe).
function validateNumericFields(body) {
  const fields = {};

  const numerics = [
    'sqft',
    'linear_ft',
    'waste_pct',
    'profit_pct',
    'tax_pct',
    'labor_rate',
    'material_total',
    'selling_price',
  ];

  for (const key of numerics) {
    if (body[key] === undefined) continue;

    const value = Number(body[key]);

    if (!isFinite(value) || isNaN(value)) {
      return { ok: false, message: `Invalid value for ${key}` };
    }
    if (value < 0) {
      return { ok: false, message: `${key} must be non-negative` };
    }

    if (key === 'waste_pct' && value > MAX_WASTE_PCT) {
      return { ok: false, message: `waste_pct cannot exceed ${MAX_WASTE_PCT}` };
    }
    if (key === 'profit_pct' && value > MAX_PROFIT_PCT) {
      return { ok: false, message: `profit_pct cannot exceed ${MAX_PROFIT_PCT}` };
    }
    if (key === 'tax_pct' && value > MAX_TAX_PCT) {
      return { ok: false, message: `tax_pct cannot exceed ${MAX_TAX_PCT}` };
    }

    // selling_price: the frontend formula includes delivery fee, CC fee, and
    // business expenses (from localStorage), none of which are sent to or
    // stored by the server. A server recompute would silently drop those terms
    // and produce an incorrect price. Instead, sanity-check that it is not
    // implausibly low relative to the raw material cost.
    if (key === 'selling_price') {
      const materialTotal = body.material_total !== undefined ? Number(body.material_total) : null;
      if (
        materialTotal !== null &&
        isFinite(materialTotal) &&
        value > 0 &&
        value < materialTotal * 0.5
      ) {
        return {
          ok: false,
          message: 'selling_price is implausibly low relative to material_total',
        };
      }
    }

    fields[key] = value;
  }

  return { ok: true, fields };
}

router.get('/', async (req, res, next) => {
  try {
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ jobs: jobs || [] });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, project_name, project_address, supplier_id, client_id, status, selected_phases } =
      req.body;

    if (!name) return res.status(400).json({ error: 'Name is required' });

    const validation = validateNumericFields(req.body);
    if (!validation.ok) return res.status(400).json({ error: validation.message });

    const f = validation.fields;

    const { data: job, error } = await supabase
      .from('jobs')
      .insert({
        user_id: req.user.id,
        name,
        project_name: project_name || '',
        project_address: project_address || '',
        supplier_id,
        client_id: client_id || null,
        status: status || 'bidding',
        sqft: f.sqft !== undefined ? f.sqft : 0,
        linear_ft: f.linear_ft !== undefined ? f.linear_ft : 0,
        waste_pct: f.waste_pct !== undefined ? f.waste_pct : DEFAULT_WASTE_PCT,
        profit_pct: f.profit_pct !== undefined ? f.profit_pct : DEFAULT_PROFIT_PCT,
        tax_pct: f.tax_pct !== undefined ? f.tax_pct : DEFAULT_TAX_PCT,
        labor_rate: f.labor_rate !== undefined ? f.labor_rate : 0,
        selected_phases: selected_phases || '[]',
        material_total: f.material_total !== undefined ? f.material_total : 0,
        selling_price: f.selling_price !== undefined ? f.selling_price : 0,
      })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ job });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { name, project_name, project_address, supplier_id, client_id, status, selected_phases } =
      req.body;

    const validation = validateNumericFields(req.body);
    if (!validation.ok) return res.status(400).json({ error: validation.message });

    const f = validation.fields;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (project_name !== undefined) updates.project_name = project_name;
    if (project_address !== undefined) updates.project_address = project_address;
    if (supplier_id !== undefined) updates.supplier_id = supplier_id;
    if (client_id !== undefined) updates.client_id = client_id;
    if (status !== undefined) updates.status = status;
    if (selected_phases !== undefined) updates.selected_phases = selected_phases;
    if (f.sqft !== undefined) updates.sqft = f.sqft;
    if (f.linear_ft !== undefined) updates.linear_ft = f.linear_ft;
    if (f.waste_pct !== undefined) updates.waste_pct = f.waste_pct;
    if (f.profit_pct !== undefined) updates.profit_pct = f.profit_pct;
    if (f.tax_pct !== undefined) updates.tax_pct = f.tax_pct;
    if (f.labor_rate !== undefined) updates.labor_rate = f.labor_rate;
    if (f.material_total !== undefined) updates.material_total = f.material_total;
    if (f.selling_price !== undefined) updates.selling_price = f.selling_price;

    const { data: job, error } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ job });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
