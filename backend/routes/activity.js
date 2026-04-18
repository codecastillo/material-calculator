const express = require('express');
const router = express.Router();
const supabase = require('../config/database');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const { data: activities, error } = await supabase.from('activity_log').select('*')
      .eq('user_id', req.user.id).order('created_at', { ascending: false }).limit(100);
    if (error) throw error;
    res.json({ activities: activities || [] });
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { action, details, entity_type, entity_id } = req.body;
    if (!action) return res.status(400).json({ error: 'Action is required' });
    const { data: activity, error } = await supabase.from('activity_log').insert({
      user_id: req.user.id, action, details: details || null,
      entity_type: entity_type || null, entity_id: entity_id || null
    }).select().single();
    if (error) throw error;
    res.status(201).json({ activity });
  } catch (err) { next(err); }
});

module.exports = router;
