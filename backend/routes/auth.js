const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { Resend } = require('resend');

const JWT_SECRET = process.env.JWT_SECRET || 'change-this';
const resend = new Resend(process.env.RESEND_API_KEY);

function generateToken(user) { return jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role || 'user' }, JWT_SECRET, { expiresIn: '7d' }); }

function generateCode() { return Math.floor(100000 + Math.random() * 900000).toString(); }

async function sendVerificationEmail(email, code) {
  await resend.emails.send({
    from: 'EstiCount <onboarding@resend.dev>',
    to: email,
    subject: 'EstiCount - Verify your email',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
        <h2 style="color:#333;margin-bottom:8px">Verify your email</h2>
        <p style="color:#666;font-size:15px">Enter this code in EstiCount to verify your account:</p>
        <div style="background:#f5f5f5;border-radius:8px;padding:24px;text-align:center;margin:24px 0">
          <span style="font-size:32px;font-weight:700;letter-spacing:8px;color:#333">${code}</span>
        </div>
        <p style="color:#999;font-size:13px">This code expires in 15 minutes. If you didn't create an account, ignore this email.</p>
      </div>
    `
  });
}

// POST /register
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: 'Email, password, and name are required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    const { data: existing } = await supabase.from('users').select('id').eq('email', email).single();
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const hash = bcrypt.hashSync(password, 10);
    const { data: user, error } = await supabase.from('users').insert({
      email, password_hash: hash, name, email_verified: false
    }).select('id, email, name, role, license_type, license_key, license_expires, is_active, email_verified').single();
    if (error) throw error;

    // Generate and send verification code
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    await supabase.from('verification_codes').insert({ user_id: user.id, code, expires_at: expiresAt });

    try {
      await sendVerificationEmail(email, code);
    } catch (emailErr) {
      console.error('Email send failed:', emailErr.message);
    }

    const token = generateToken(user);
    res.status(201).json({ token, user, needsVerification: true });
  } catch (err) { next(err); }
});

// POST /verify - verify email with code
router.post('/verify', authenticate, async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Verification code is required' });

    const { data: record } = await supabase.from('verification_codes')
      .select('*').eq('user_id', req.user.id).eq('code', code.trim()).order('created_at', { ascending: false }).limit(1).single();

    if (!record) return res.status(400).json({ error: 'Invalid code' });
    if (new Date(record.expires_at) < new Date()) return res.status(400).json({ error: 'Code has expired. Request a new one.' });

    // Mark user as verified
    const { data: user, error } = await supabase.from('users').update({ email_verified: true })
      .eq('id', req.user.id).select('id, email, name, role, license_type, license_key, license_expires, is_active, email_verified').single();
    if (error) throw error;

    // Clean up used codes
    await supabase.from('verification_codes').delete().eq('user_id', req.user.id);

    res.json({ user, message: 'Email verified!' });
  } catch (err) { next(err); }
});

// POST /resend-code - resend verification code
router.post('/resend-code', authenticate, async (req, res, next) => {
  try {
    const { data: user } = await supabase.from('users').select('email, email_verified').eq('id', req.user.id).single();
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.email_verified) return res.status(400).json({ error: 'Email already verified' });

    // Delete old codes
    await supabase.from('verification_codes').delete().eq('user_id', req.user.id);

    // Generate new code
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    await supabase.from('verification_codes').insert({ user_id: req.user.id, code, expires_at: expiresAt });

    await sendVerificationEmail(user.email, code);
    res.json({ message: 'New code sent!' });
  } catch (err) { next(err); }
});

// POST /login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    const { data: user } = await supabase.from('users').select('*').eq('email', email).single();
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });
    if (!bcrypt.compareSync(password, user.password_hash)) return res.status(401).json({ error: 'Invalid email or password' });
    if (!user.is_active) return res.status(403).json({ error: 'Account is deactivated. Contact support.' });

    const token = generateToken(user);
    const needsVerification = !user.email_verified;
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role, license_type: user.license_type, license_key: user.license_key, license_expires: user.license_expires, is_active: user.is_active, email_verified: user.email_verified }, needsVerification });
  } catch (err) { next(err); }
});

// GET /me
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const { data: user } = await supabase.from('users').select('id, email, name, role, license_type, license_key, license_expires, is_active, email_verified').eq('id', req.user.id).single();
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) { next(err); }
});

// PUT /profile
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
      updates.password_hash = bcrypt.hashSync(req.body.password, 10);
    }
    if (!Object.keys(updates).length) return res.status(400).json({ error: 'Nothing to update' });
    const { data: user, error } = await supabase.from('users').update(updates).eq('id', req.user.id).select('id, email, name, role, license_type, license_expires, is_active').single();
    if (error) throw error;
    res.json({ user, token: generateToken(user) });
  } catch (err) { next(err); }
});

// POST /activate
router.post('/activate', authenticate, async (req, res, next) => {
  try {
    const { key } = req.body;
    if (!key) return res.status(400).json({ error: 'License key is required' });
    const { data: licenseKey } = await supabase.from('license_keys').select('*').eq('key', key.trim().toUpperCase()).single();
    if (!licenseKey) return res.status(404).json({ error: 'Invalid license key' });
    if (licenseKey.times_used >= licenseKey.max_uses) return res.status(400).json({ error: 'Key has been used the maximum number of times' });
    const expires = new Date();
    expires.setDate(expires.getDate() + licenseKey.duration_days);
    const { data: user, error } = await supabase.from('users').update({
      license_key: key.trim().toUpperCase(),
      license_type: licenseKey.type,
      license_expires: licenseKey.type === 'lifetime' ? null : expires.toISOString(),
    }).eq('id', req.user.id).select('id, email, name, role, license_type, license_key, license_expires, is_active, email_verified').single();
    if (error) throw error;
    await supabase.from('license_keys').update({ times_used: licenseKey.times_used + 1 }).eq('id', licenseKey.id);
    res.json({ user, message: `License activated: ${licenseKey.type}` });
  } catch (err) { next(err); }
});

module.exports = router;
