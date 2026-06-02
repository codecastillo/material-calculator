'use strict';

// Bootstraps the Express app for supertest without any real Supabase connection
// or network calls.
//
// Strategy: before requiring server.js we inject a fake module into Node's
// require cache for config/database (and lib/keys when needed), so those modules
// never touch @supabase/supabase-js or process.exit(1).

const path = require('path');
const { createFakeSupabase } = require('./fakeSupabase');

// Absolute paths we may need to evict from the cache when re-loading.
const SERVER_PATH = path.resolve(__dirname, '../../server.js');
const DB_PATH = path.resolve(__dirname, '../../config/database.js');
const KEYS_PATH = path.resolve(__dirname, '../../lib/keys.js');

// routes/auth.js and routes/orderEmail.js call `new Resend(key)` at module
// load time and the constructor throws if the key is missing. We stub the
// package so the constructor is a no-op in tests.
const RESEND_PATH = require.resolve(path.resolve(__dirname, '../../node_modules/resend'));

// Purge every cached module so tests get a fresh app instance.
// This is intentionally broad so route modules that closed over the old
// supabase reference are also evicted.
function purgeAppCache() {
  for (const key of Object.keys(require.cache)) {
    // Keep built-in / node_modules caches (except the packages we own)
    if (key.includes('node_modules')) continue;
    delete require.cache[key];
  }
}

// Inject a fake module into the require cache before loading the real app.
function stubCache(resolvedPath, fakeExports) {
  require.cache[resolvedPath] = {
    id: resolvedPath,
    filename: resolvedPath,
    loaded: true,
    exports: fakeExports,
    children: [],
    parent: null,
  };
}

// loadApp() returns { app, fake } where fake is the fakeSupabase instance
// whose responses tests can configure before making requests.
function loadApp() {
  purgeAppCache();

  // Set env vars that the real modules check at load time.
  // NODE_ENV must not be 'production' (auth.js exits in that case).
  process.env.NODE_ENV = process.env.NODE_ENV || 'test';
  process.env.JWT_SECRET = 'test-secret-value';

  // Stripe env -- routes/stripe.js reads these lazily; set them so getStripe()
  // returns a real Stripe instance for signature tests.
  process.env.STRIPE_SECRET_KEY = 'test-stripe-key-stub';
  process.env.STRIPE_WEBHOOK_SECRET = 'test-webhook-signing-secret-stub-001';

  const fake = createFakeSupabase();

  // Default users row: lifetime license so requireActiveLicense passes in every
  // test that doesn't explicitly override the users table. Tests that need to
  // verify paywall rejection should call fake.setResponse('users', ...) with a
  // row that has an expired license_expires.
  fake.setDefault('users', {
    id: 'user-uuid-default',
    email: 'test@example.com',
    role: 'user',
    license_type: 'lifetime',
    license_expires: null,
  });

  // Stub the resend package: its constructor throws when RESEND_API_KEY is
  // absent, which happens at module load time in routes/auth.js and
  // routes/orderEmail.js. The stub is a harmless no-op class.
  stubCache(RESEND_PATH, {
    Resend: class FakeResend {
      constructor(_key) {}
      emails = {
        send: async () => ({ id: 'fake-email-id' }),
      };
    },
  });

  // Stub config/database so createClient is never called
  stubCache(DB_PATH, fake.client);

  // Stub lib/keys so createLicenseKey does not hit real supabase
  // and returns a predictable key row.
  const keysStub = {
    generateKeyString: () => 'EC-MON-test-stub',
    expiryFor: (type, days) => {
      if (type === 'lifetime') return null;
      return new Date(Date.now() + (days || 30) * 24 * 60 * 60 * 1000).toISOString();
    },
    createLicenseKey: async () => {
      // createLicenseKey itself calls supabase inside lib/keys.js -- but since
      // we've replaced lib/keys entirely, this stub is what routes get.
      return { key: 'EC-MON-test-stub', type: 'monthly' };
    },
    PLAN_DURATION_DAYS: { trial: 7, monthly: 30, yearly: 365, lifetime: null },
  };
  stubCache(KEYS_PATH, keysStub);

  // Now load server -- it will use the stubs for database and lib/keys.
  const app = require(SERVER_PATH);

  return { app, fake };
}

module.exports = { loadApp };
