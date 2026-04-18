const express = require('express');
const router = express.Router();
const supabase = require('../config/database');
const { authenticate } = require('../middleware/auth');
const crypto = require('crypto');

// Admin-only middleware
function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  next();
}

router.use(authenticate);
router.use(adminOnly);

// GET /admin/users - list all users
router.get('/users', async (req, res, next) => {
  try {
    const { data: users, error } = await supabase.from('users')
      .select('id, email, name, role, license_key, license_type, license_expires, is_active, created_at')
      .order('created_at');
    if (error) throw error;
    res.json({ users: users || [] });
  } catch (err) { next(err); }
});

// PUT /admin/users/:id - update user (activate/deactivate, change role)
router.put('/users/:id', async (req, res, next) => {
  try {
    const updates = {};
    ['role', 'is_active', 'license_type', 'license_expires'].forEach(f => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });
    const { data: user, error } = await supabase.from('users').update(updates).eq('id', req.params.id).select('id, email, name, role, license_type, is_active').single();
    if (error) throw error;
    res.json({ user });
  } catch (err) { next(err); }
});

// DELETE /admin/users/:id
router.delete('/users/:id', async (req, res, next) => {
  try {
    if (parseInt(req.params.id) === req.user.id) return res.status(400).json({ error: 'Cannot delete yourself' });
    const { error } = await supabase.from('users').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) { next(err); }
});

// GET /admin/keys - list all license keys
router.get('/keys', async (req, res, next) => {
  try {
    const { data: keys, error } = await supabase.from('license_keys').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ keys: keys || [] });
  } catch (err) { next(err); }
});

// POST /admin/keys - generate license key(s)
router.post('/keys', async (req, res, next) => {
  try {
    const { type = 'monthly', duration_days = 30, count = 1, max_uses = 1 } = req.body;
    const keys = [];
    for (let i = 0; i < Math.min(count, 50); i++) {
      const key = 'EC-' + type.toUpperCase().slice(0, 3) + '-' + crypto.randomBytes(8).toString('hex').toUpperCase();
      const { data, error } = await supabase.from('license_keys').insert({
        key, type, duration_days, max_uses, created_by: req.user.id
      }).select().single();
      if (error) throw error;
      keys.push(data);
    }
    res.status(201).json({ keys });
  } catch (err) { next(err); }
});

// DELETE /admin/keys/:id
router.delete('/keys/:id', async (req, res, next) => {
  try {
    const { error } = await supabase.from('license_keys').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) { next(err); }
});

// GET /admin/stats - dashboard stats
router.get('/stats', async (req, res, next) => {
  try {
    const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const { count: activeCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_active', true);
    const { count: keyCount } = await supabase.from('license_keys').select('*', { count: 'exact', head: true });
    const { count: jobCount } = await supabase.from('jobs').select('*', { count: 'exact', head: true });
    res.json({ stats: { users: userCount || 0, active: activeCount || 0, keys: keyCount || 0, jobs: jobCount || 0 } });
  } catch (err) { next(err); }
});

module.exports = router;
