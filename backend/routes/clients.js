const express = require('express');
const router = express.Router();
const supabase = require('../config/database');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const { data: clients, error } = await supabase.from('clients').select('*').eq('user_id', req.user.id).order('created_at');
    if (error) throw error;
    res.json({ clients: clients || [] });
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, email, phone, address, notes } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const { data: client, error } = await supabase.from('clients').insert({
      user_id: req.user.id, name, email: email || null, phone: phone || null,
      address: address || null, notes: notes || null
    }).select().single();
    if (error) throw error;
    res.status(201).json({ client });
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { name, email, phone, address, notes } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (phone !== undefined) updates.phone = phone;
    if (address !== undefined) updates.address = address;
    if (notes !== undefined) updates.notes = notes;
    const { data: client, error } = await supabase.from('clients').update(updates)
      .eq('id', req.params.id).eq('user_id', req.user.id).select().single();
    if (error) throw error;
    res.json({ client });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { error } = await supabase.from('clients').delete().eq('id', req.params.id).eq('user_id', req.user.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
