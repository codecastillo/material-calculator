'use strict';

const supabase = require('../config/database');

// Paywall middleware: enforces that the authenticated user holds an active license.
//
// Admin users are always allowed through. Everyone else must have a lifetime
// license, or a non-expired license_expires value (covers paid subscriptions
// and the 7-day trial issued on account creation).
//
// Fail-open policy on genuine DB errors: if Supabase is unreachable, we call
// next() rather than locking out every user during an outage. A clean "no
// license" row (data: null, no error) is fail-closed and returns 402.
//
// Must be applied after `authenticate` so req.user is populated.
async function requireActiveLicense(req, res, next) {
  try {
    const { id, role } = req.user;

    if (role === 'admin') {
      return next();
    }

    const { data, error } = await supabase
      .from('users')
      .select('license_type, license_expires')
      .eq('id', id)
      .single();

    if (error) {
      // DB/service error: let the request through so an outage does not lock
      // everyone out. The actual error is logged for ops visibility.
      console.error('[requireActiveLicense] DB error, failing open:', error.message);
      return next();
    }

    if (!data) {
      return res.status(402).json({
        error: 'An active license is required',
        code: 'LICENSE_REQUIRED',
      });
    }

    if (data.license_type === 'lifetime') {
      return next();
    }

    if (data.license_expires && new Date(data.license_expires) > new Date()) {
      return next();
    }

    return res.status(402).json({
      error: 'An active license is required',
      code: 'LICENSE_REQUIRED',
    });
  } catch (err) {
    // Unexpected exception: fail-open for the same reason as DB errors.
    console.error('[requireActiveLicense] unexpected error, failing open:', err.message);
    return next();
  }
}

module.exports = { requireActiveLicense };
