const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/database');
const { authenticate } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'change-this';
function generateToken(user) { return jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role || 'user' }, JWT_SECRET, { expiresIn: '7d' }); }

router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: 'Email, password, and name are required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    const { data: existing } = await supabase.from('users').select('id').eq('email', email).single();
    if (existing) return res.status(409).json({ error: 'Email already registered' });
    const hash = bcrypt.hashSync(password, 10);
    const { data: user, error } = await supabase.from('users').insert({ email, password_hash: hash, name }).select('id, email, name, role, license_type, is_active').single();
    if (error) throw error;
    res.status(201).json({ token: generateToken(user), user: { id: user.id, email: user.email, name: user.name, role: user.role, license_type: user.license_type, is_active: user.is_active } });
  } catch (err) { next(err); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    const { data: user } = await supabase.from('users').select('*').eq('email', email).single();
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });
    if (!bcrypt.compareSync(password, user.password_hash)) return res.status(401).json({ error: 'Invalid email or password' });
    if (!user.is_active) return res.status(403).json({ error: 'Account is deactivated. Contact support.' });
    res.json({ token: generateToken(user), user: { id: user.id, email: user.email, name: user.name, role: user.role, license_type: user.license_type, license_expires: user.license_expires, is_active: user.is_active } });
  } catch (err) { next(err); }
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const { data: user } = await supabase.from('users').select('id, email, name, role, license_type, license_expires, is_active').eq('id', req.user.id).single();
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) { next(err); }
});

// PUT /profile - update name, email, password
router.put('/profile', authenticate, async (req, res, next) => {
  try {
    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.email) {
      const { data: existing } = await supabase.from('users').select('id').eq('email', req.body.email).neq('id', req.user.id).single();
      if (existing) return res.status(409).json({ error: 'Email already in use' });
      updates.email = req.body.email;
    }
    if (req.body.password) {
      if (req.body.password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
      updates.password_hash = require('bcryptjs').hashSync(req.body.password, 10);
    }
    if (!Object.keys(updates).length) return res.status(400).json({ error: 'Nothing to update' });
    const { data: user, error } = await supabase.from('users').update(updates).eq('id', req.user.id).select('id, email, name, role, license_type, license_expires, is_active').single();
    if (error) throw error;
    res.json({ user, token: generateToken(user) });
  } catch (err) { next(err); }
});

// POST /activate - user enters a license key
router.post('/activate', authenticate, async (req, res, next) => {
  try {
    const { key } = req.body;
    if (!key) return res.status(400).json({ error: 'License key is required' });

    const { data: licenseKey } = await supabase.from('license_keys').select('*').eq('key', key.trim().toUpperCase()).single();
    if (!licenseKey) return res.status(404).json({ error: 'Invalid license key' });
    if (licenseKey.times_used >= licenseKey.max_uses) return res.status(400).json({ error: 'License key has been used the maximum number of times' });

    // Calculate expiration
    const expires = new Date();
    expires.setDate(expires.getDate() + licenseKey.duration_days);

    // Update user
    const { data: user, error } = await supabase.from('users').update({
      license_key: key.trim().toUpperCase(),
      license_type: licenseKey.type,
      license_expires: licenseKey.type === 'lifetime' ? null : expires.toISOString(),
    }).eq('id', req.user.id).select('id, email, name, role, license_type, license_expires, is_active').single();
    if (error) throw error;

    // Increment usage count
    await supabase.from('license_keys').update({ times_used: licenseKey.times_used + 1 }).eq('id', licenseKey.id);

    res.json({ user, message: `License activated: ${licenseKey.type} (${licenseKey.type === 'lifetime' ? 'never expires' : `expires ${expires.toLocaleDateString()}`})` });
  } catch (err) { next(err); }
});

module.exports = router;
