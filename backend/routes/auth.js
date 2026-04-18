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

function generateReferralCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'REF-';
  for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
}

async function sendVerificationEmail(email, code) {
  await resend.emails.send({
    from: 'EstiCount <noreply@esticount.com>',
    to: email,
    subject: 'Your EstiCount verification code',
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f2f5;padding:40px 20px">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
        <!-- Header -->
        <tr><td style="background:#1c2128;padding:28px 32px;text-align:center">
          <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px">EstiCount</h1>
          <p style="margin:4px 0 0;color:#8b949e;font-size:13px">Material Estimating & Order Management</p>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:36px 32px 20px">
          <h2 style="margin:0 0 8px;color:#1f2328;font-size:20px;font-weight:600">Verify your email</h2>
          <p style="margin:0 0 24px;color:#59636e;font-size:15px;line-height:1.5">Welcome to EstiCount! Enter this verification code to complete your account setup:</p>
          <!-- Code box -->
          <div style="background:#f6f8fa;border:2px solid #d1d9e0;border-radius:10px;padding:28px;text-align:center;margin:0 0 24px">
            <span style="font-size:36px;font-weight:700;letter-spacing:10px;color:#1f2328;font-family:'Courier New',monospace">${code}</span>
          </div>
          <p style="margin:0 0 6px;color:#59636e;font-size:14px">This code expires in <strong>15 minutes</strong>.</p>
          <p style="margin:0;color:#8b949e;font-size:13px">If you didn't create an EstiCount account, you can safely ignore this email.</p>
        </td></tr>
        <!-- Divider -->
        <tr><td style="padding:0 32px"><div style="border-top:1px solid #e5e7eb"></div></td></tr>
        <!-- Footer -->
        <tr><td style="padding:20px 32px 28px;text-align:center">
          <p style="margin:0;color:#8b949e;font-size:12px">EstiCount &mdash; Built for contractors</p>
          <p style="margin:4px 0 0;color:#b0b8c1;font-size:11px"><a href="https://esticount.com" style="color:#0969da;text-decoration:none">esticount.com</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
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

    // Referral support: look up referrer if referral_code provided
    let referred_by = null;
    if (req.body.referral_code) {
      const { data: referrer } = await supabase.from('users').select('id').eq('referral_code', req.body.referral_code).single();
      if (referrer) referred_by = referrer.id;
    }

    const insertData = { email, password_hash: hash, name, email_verified: false };
    if (referred_by) insertData.referred_by = referred_by;

    const { data: user, error } = await supabase.from('users').insert(insertData)
      .select('id, email, name, role, license_type, license_key, license_expires, is_active, email_verified').single();
    if (error) throw error;

    // Generate unique referral code for the new user
    const referralCode = generateReferralCode();
    await supabase.from('users').update({ referral_code: referralCode }).eq('id', user.id);

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

// POST /forgot-password — send reset code (no auth required)
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const { data: user } = await supabase.from('users').select('id, email, name').eq('email', email.trim().toLowerCase()).single();
    // Always return success even if user not found (prevent email enumeration)
    if (!user) return res.json({ message: 'If that email exists, a reset code has been sent.' });

    // Delete old codes
    await supabase.from('verification_codes').delete().eq('user_id', user.id);

    // Generate code
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    await supabase.from('verification_codes').insert({ user_id: user.id, code, expires_at: expiresAt });

    // Send email
    await resend.emails.send({
      from: 'EstiCount <noreply@esticount.com>',
      to: email,
      subject: 'Reset your EstiCount password',
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f2f5;padding:40px 20px">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
        <tr><td style="background:#1c2128;padding:28px 32px;text-align:center">
          <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px">EstiCount</h1>
          <p style="margin:4px 0 0;color:#8b949e;font-size:13px">Material Estimating & Order Management</p>
        </td></tr>
        <tr><td style="padding:36px 32px 20px">
          <h2 style="margin:0 0 8px;color:#1f2328;font-size:20px;font-weight:600">Reset your password</h2>
          <p style="margin:0 0 24px;color:#59636e;font-size:15px;line-height:1.5">Hi ${user.name || 'there'}, we received a request to reset your password. Enter this code to set a new one:</p>
          <div style="background:#f6f8fa;border:2px solid #d1d9e0;border-radius:10px;padding:28px;text-align:center;margin:0 0 24px">
            <span style="font-size:36px;font-weight:700;letter-spacing:10px;color:#1f2328;font-family:'Courier New',monospace">${code}</span>
          </div>
          <p style="margin:0 0 6px;color:#59636e;font-size:14px">This code expires in <strong>15 minutes</strong>.</p>
          <p style="margin:0;color:#8b949e;font-size:13px">If you didn't request a password reset, you can safely ignore this email.</p>
        </td></tr>
        <tr><td style="padding:0 32px"><div style="border-top:1px solid #e5e7eb"></div></td></tr>
        <tr><td style="padding:20px 32px 28px;text-align:center">
          <p style="margin:0;color:#8b949e;font-size:12px">EstiCount &mdash; Built for contractors</p>
          <p style="margin:4px 0 0"><a href="https://esticount.com" style="color:#0969da;text-decoration:none;font-size:11px">esticount.com</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
      `
    });

    res.json({ message: 'If that email exists, a reset code has been sent.' });
  } catch (err) { next(err); }
});

// POST /reset-password — verify code and set new password (no auth required)
router.post('/reset-password', async (req, res, next) => {
  try {
    const { email, code, password } = req.body;
    if (!email || !code || !password) return res.status(400).json({ error: 'Email, code, and new password are required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const { data: user } = await supabase.from('users').select('id').eq('email', email.trim().toLowerCase()).single();
    if (!user) return res.status(400).json({ error: 'Invalid email or code' });

    const { data: record } = await supabase.from('verification_codes')
      .select('*').eq('user_id', user.id).eq('code', code.trim()).order('created_at', { ascending: false }).limit(1).single();

    if (!record) return res.status(400).json({ error: 'Invalid code' });
    if (new Date(record.expires_at) < new Date()) return res.status(400).json({ error: 'Code has expired. Request a new one.' });

    // Update password
    const hash = bcrypt.hashSync(password, 10);
    await supabase.from('users').update({ password_hash: hash }).eq('id', user.id);

    // Clean up codes
    await supabase.from('verification_codes').delete().eq('user_id', user.id);

    res.json({ message: 'Password reset successfully. You can now sign in.' });
  } catch (err) { next(err); }
});

// GET /referral-stats — get user's referral code and count of referred users
router.get('/referral-stats', authenticate, async (req, res, next) => {
  try {
    const { data: user } = await supabase.from('users').select('referral_code').eq('id', req.user.id).single();
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { count, error } = await supabase.from('users').select('id', { count: 'exact', head: true }).eq('referred_by', req.user.id);
    if (error) throw error;

    res.json({ referral_code: user.referral_code, referral_count: count || 0 });
  } catch (err) { next(err); }
});

module.exports = router;
