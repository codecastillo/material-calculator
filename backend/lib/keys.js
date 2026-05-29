const crypto = require('crypto');
const supabase = require('../config/database');

const PLAN_DURATION_DAYS = {
  trial: 7,
  monthly: 30,
  yearly: 365,
  lifetime: null
};

function generateKeyString(type) {
  const prefix = String(type || 'TRI').toUpperCase().slice(0, 3);
  return 'EC-' + prefix + '-' + crypto.randomBytes(8).toString('hex').toUpperCase();
}

function expiryFor(type, durationDays) {
  if (type === 'lifetime') return null;
  const days = durationDays != null ? durationDays : PLAN_DURATION_DAYS[type];
  if (!days) return null;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

/**
 * Create a license_keys row. Returns the inserted row.
 * @param {Object} opts
 * @param {string} opts.type        trial | monthly | yearly | lifetime
 * @param {number} [opts.duration_days]  defaults to PLAN_DURATION_DAYS[type]
 * @param {number} [opts.max_uses]  defaults to 1
 * @param {number|null} [opts.created_by]  admin user id, or null for system
 * @param {number} [opts.times_used]  defaults to 0
 */
async function createLicenseKey({ type, duration_days, max_uses = 1, created_by = null, times_used = 0 }) {
  const days = duration_days != null ? duration_days : PLAN_DURATION_DAYS[type];
  const key = generateKeyString(type);
  const { data, error } = await supabase.from('license_keys').insert({
    key,
    type,
    duration_days: days,
    max_uses,
    times_used,
    created_by
  }).select().single();
  if (error) throw error;
  return data;
}

module.exports = {
  generateKeyString,
  expiryFor,
  createLicenseKey,
  PLAN_DURATION_DAYS
};
