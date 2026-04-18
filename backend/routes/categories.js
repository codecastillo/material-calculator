const express = require('express');
const router = express.Router();
const supabase = require('../config/database');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const { data: categories, error } = await supabase.from('categories').select('*').eq('user_id', req.user.id).order('sort_order');
    if (error) throw error;
    res.json({ categories: categories || [] });
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const { data: cat, error } = await supabase.from('categories').insert({ name, user_id: req.user.id }).select().single();
    if (error) throw error;
    res.status(201).json({ category: cat });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { error } = await supabase.from('categories').delete().eq('id', req.params.id).eq('user_id', req.user.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
