const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Resend } = require('resend');
const supabase = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

const COMPANY_FIELDS = [
  'company_name',
  'company_address',
  'company_phone',
  'company_email',
  'contractor_license'
];

function pickCompanyFields(body) {
  const out = {};
  COMPANY_FIELDS.forEach(k => {
    if (body[k] !== undefined) out[k] = body[k] === null ? null : String(body[k]).trim();
  });
  return out;
}

const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com','guerrillamail.com','guerrillamail.net','guerrillamail.org','guerrillamail.biz','guerrillamail.de','sharklasers.com','grr.la',
  '10minutemail.com','10minutemail.net','tempmail.com','temp-mail.org','temp-mail.io','tempmailaddress.com','tempr.email',
  'throwaway.email','throwawaymail.com','maildrop.cc','yopmail.com','dispostable.com','fakeinbox.com','trashmail.com','trashmail.de',
  'getnada.com','nada.email','mailnesia.com','mintemail.com','mohmal.com','mytemp.email','spamgourmet.com','spam4.me','spambox.us',
  'emailondeck.com','dropmail.me','mailtothis.com','mail-temp.com','mvrht.net','tmail.ws','wegwerfmail.de','wegwerfmail.net',
  'fakemail.net','fakemailgenerator.com','tempinbox.com','mailcatch.com','jetable.org','tempemail.com','tempemail.co','tempemail.net',
  'tempmail.io','tempmail.ninja','tempmail.us.com','tempmail.email','tempinbox.co','snapmail.cc','burnermail.io',
  'incognitomail.com','filzmail.com','spamavert.com','mailexpire.com','tempmailo.com','dispomail.email',
  'example.com','example.org','example.net','test.com','test.org','test.net','asdf.com','aaa.com','bbb.com','qwerty.com',
  'localhost.com','noreply.com','no-reply.com','none.com','null.com','fake.com','fakemail.com','dummy.com'
]);

function isPlausibleEmail(s) {
  const v = String(s || '').trim().toLowerCase();
  if (!v || v.length > 254) return false;
  if (!/^[a-z0-9](?:[a-z0-9._%+-]*[a-z0-9])?@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$/.test(v)) return false;
  if (v.includes('..')) return false;
  const at = v.lastIndexOf('@');
  const local = v.slice(0, at);
  const domain = v.slice(at + 1);
  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) return false;
  for (const d of DISPOSABLE_EMAIL_DOMAINS) { if (domain.endsWith('.' + d)) return false; }
  if (/\.(?:test|example|invalid|localhost|local)$/i.test(domain)) return false;
  if (/^(?:test+|asdf+|aaa+|abc+|qwer+t*y*|fake+|dummy+|none+|x+|123+|abcd+|noreply|no-reply)$/i.test(local)) return false;
  if (/^(.)\1{2,}$/.test(local)) return false;
  return true;
}

function validateCompanyPatch(patch) {
  if (patch.company_email && !isPlausibleEmail(patch.company_email)) {
    return 'Business email is not valid';
  }
  if (patch.company_phone) {
    const digits = String(patch.company_phone).replace(/\D/g, '');
    if (digits && digits.length !== 10) return 'Phone must be 10 digits';
  }
  return null;
}

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role || 'user' },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
}

// GET /api/onboarding/me  — return the authenticated user's company profile
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('company_name, company_address, company_phone, company_email, contractor_license, onboarding_completed')
      .eq('id', req.user.id)
      .single();
    if (error) {
      // Schema not migrated — return blanks so the frontend wizard can run.
      console.warn('[onboarding/me] schema not migrated yet:', error.message);
      return res.json({});
    }
    res.json(data || {});
  } catch (err) { next(err); }
});

// POST /api/onboarding/complete — save company info and mark onboarding done
router.post('/complete', authenticate, async (req, res, next) => {
  try {
    const patch = pickCompanyFields(req.body || {});
    const invalid = validateCompanyPatch(patch);
    if (invalid) return res.status(400).json({ error: invalid });
    patch.onboarding_completed = true;
    const { data, error } = await supabase
      .from('users')
      .update(patch)
      .eq('id', req.user.id)
      .select('company_name, company_address, company_phone, company_email, contractor_license, onboarding_completed')
      .single();
    if (error) {
      // Most likely the company_* columns / onboarding_completed flag haven't
      // been added to Supabase yet. Don't fail the user's onboarding — echo
      // their input back and warn the admin in the response. The frontend
      // caches the data in localStorage so order emails still work.
      console.warn('[onboarding] schema not migrated yet:', error.message);
      return res.json({
        ...patch,
        _warning: 'Backend schema not migrated — values not persisted. Run supabase-schema.sql in Supabase.'
      });
    }
    res.json(data);
  } catch (err) { next(err); }
});

// GET /api/onboarding/token/:token — validate a Stripe magic-link token
router.get('/token/:token', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('onboarding_tokens')
      .select('email, license_key, expires_at, used')
      .eq('token', req.params.token)
      .single();
    if (error || !data) return res.status(404).json({ error: 'Invalid token' });
    if (data.used) return res.status(410).json({ error: 'Token already used' });
    if (new Date(data.expires_at) < new Date()) return res.status(410).json({ error: 'Token expired' });
    // Look up license type / expiry from the key for display
    const { data: keyRow } = await supabase
      .from('license_keys')
      .select('type, duration_days')
      .eq('key', data.license_key)
      .single();
    res.json({
      email: data.email,
      license_type: keyRow ? keyRow.type : null,
      duration_days: keyRow ? keyRow.duration_days : null
    });
  } catch (err) { next(err); }
});

// POST /api/onboarding/redeem — create the account from a magic-link token
// Body: { token, password, name, company_name?, company_address?, ... }
router.post('/redeem', async (req, res, next) => {
  try {
    const { token, password, name } = req.body || {};
    if (!token || !password || !name) {
      return res.status(400).json({ error: 'token, password, and name are required' });
    }
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      return res.status(400).json({ error: 'Password must be at least 8 characters with an uppercase letter and a number' });
    }
    const { data: tk, error: tkErr } = await supabase
      .from('onboarding_tokens')
      .select('*')
      .eq('token', token)
      .single();
    if (tkErr || !tk) return res.status(404).json({ error: 'Invalid token' });
    if (tk.used) return res.status(410).json({ error: 'Token already used' });
    if (new Date(tk.expires_at) < new Date()) return res.status(410).json({ error: 'Token expired' });

    // Block if the email is already a registered user
    const { data: existing } = await supabase.from('users').select('id').eq('email', tk.email).single();
    if (existing) return res.status(409).json({ error: 'An account already exists for this email. Sign in and activate your key on the account page.' });

    // Look up the key so we can compute the expiry
    const { data: keyRow, error: keyErr } = await supabase
      .from('license_keys')
      .select('*')
      .eq('key', tk.license_key)
      .single();
    if (keyErr || !keyRow) return res.status(500).json({ error: 'License key missing' });
    const licenseExpires = keyRow.type === 'lifetime' ? null :
      new Date(Date.now() + (keyRow.duration_days || 30) * 24 * 60 * 60 * 1000).toISOString();

    const hash = bcrypt.hashSync(password, 10);
    const companyPatch = pickCompanyFields(req.body || {});
    const invalid = validateCompanyPatch(companyPatch);
    if (invalid) return res.status(400).json({ error: invalid });

    const insertData = {
      email: tk.email,
      password_hash: hash,
      name,
      email_verified: true,            // Stripe purchase serves as verification
      license_key: tk.license_key,
      license_type: keyRow.type,
      license_expires: licenseExpires,
      onboarding_completed: true,
      ...companyPatch
    };

    const { data: user, error: userErr } = await supabase
      .from('users')
      .insert(insertData)
      .select('id, email, name, role, license_type, license_key, license_expires, is_active, email_verified, onboarding_completed')
      .single();
    if (userErr) throw userErr;

    // Mark the key as used and the token as redeemed (best-effort).
    await supabase.from('license_keys').update({ times_used: (keyRow.times_used || 0) + 1 }).eq('id', keyRow.id);
    await supabase.from('onboarding_tokens').update({ used: true }).eq('id', tk.id);

    const jwtToken = generateToken(user);
    res.status(201).json({ token: jwtToken, user });
  } catch (err) { next(err); }
});

module.exports = router;
