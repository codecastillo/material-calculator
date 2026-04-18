const express = require('express');
const router = express.Router();
const supabase = require('../config/database');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const { data: suppliers, error } = await supabase.from('suppliers').select('*').eq('user_id', req.user.id).order('created_at');
    if (error) throw error;

    // Get categories for each supplier
    for (const sup of suppliers) {
      const { data: links } = await supabase.from('supplier_categories')
        .select('category_id, categories(id, name, sort_order)')
        .eq('supplier_id', sup.id);
      sup.categories = (links || []).map(l => l.categories).filter(Boolean).sort((a, b) => a.sort_order - b.sort_order);
    }

    res.json({ suppliers });
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const { data: supplier, error } = await supabase.from('suppliers').insert({ name, user_id: req.user.id }).select().single();
    if (error) throw error;
    res.status(201).json({ supplier });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { error } = await supabase.from('suppliers').delete().eq('id', req.params.id).eq('user_id', req.user.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
