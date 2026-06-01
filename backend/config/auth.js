'use strict';

// A missing JWT_SECRET in production means every token is signed with a
// known value, making them trivially forgeable by anyone. Crash early so
// a misconfigured deploy is obvious rather than silently insecure.

const DEV_FALLBACK = 'dev-only-change-this-in-production';
const JWT_EXPIRY = '24h';

let JWT_SECRET;

if (process.env.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'change-this') {
    console.error(
      '[auth] JWT_SECRET is missing or set to the insecure default. ' +
        'Set a strong random value in your production environment and restart.'
    );
    process.exit(1);
  }
  JWT_SECRET = process.env.JWT_SECRET;
} else {
  if (!process.env.JWT_SECRET) {
    console.warn('[auth] JWT_SECRET not set. Using dev fallback - set a real value in production.');
    JWT_SECRET = DEV_FALLBACK;
  } else {
    JWT_SECRET = process.env.JWT_SECRET;
  }
}

module.exports = { JWT_SECRET, JWT_EXPIRY };
