'use strict';

// Stripe webhook tests. The webhook route uses express.raw() on the webhook
// path, and server.js deliberately skips express.json() for /api/stripe/webhook
// so the raw body is preserved for signature verification.
//
// We generate a real HMAC-signed header with stripe.webhooks.generateTestHeaderString
// so the constructEvent call succeeds. Bad-signature tests send a mismatched header.

const { test, before, describe } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const { loadApp } = require('./helpers/loadApp');

// Require Stripe directly to generate test headers. This is the real SDK --
// it doesn't need a valid API key for signature operations.
const Stripe = require('stripe');
// Use the same dummy key loadApp sets so getStripe() in the route returns an instance.
const stripeForSig = new Stripe('test-stripe-key-stub');

const WEBHOOK_SECRET = 'test-webhook-signing-secret-stub-001';

let app;
let fake;

function buildCheckoutEvent(sessionId, email, plan) {
  return {
    id: 'evt_test_001',
    type: 'checkout.session.completed',
    data: {
      object: {
        id: sessionId,
        customer_details: { email },
        metadata: { plan },
      },
    },
  };
}

function signedHeader(payload) {
  return stripeForSig.webhooks.generateTestHeaderString({
    payload,
    secret: WEBHOOK_SECRET,
  });
}

before(() => {
  ({ app, fake } = loadApp());
});

// ---------------------------------------------------------------------------
// Valid signature - happy path
// ---------------------------------------------------------------------------
describe('POST /api/stripe/webhook - valid signature', () => {
  test('checkout.session.completed with valid sig -> 200 { received: true }', async () => {
    fake.reset();

    // Idempotency check: no existing token for this session
    fake.setResponse('onboarding_tokens', null);

    const event = buildCheckoutEvent('cs_test_session_1', 'buyer@example.com', 'monthly');
    const payload = JSON.stringify(event);
    const sig = signedHeader(payload);

    const res = await request(app)
      .post('/api/stripe/webhook')
      .set('Content-Type', 'application/json')
      .set('stripe-signature', sig)
      .send(payload);

    assert.equal(res.status, 200);
    assert.equal(res.body.received, true);
    // The insert for the onboarding_tokens table should have been called
    assert.equal(
      fake.insertWasCalled('onboarding_tokens'),
      true,
      'should insert an onboarding token on valid checkout'
    );
  });

  test('idempotent: duplicate session -> 200 { received: true, idempotent: true }', async () => {
    fake.reset();
    // Idempotency lookup returns an existing row
    fake.setResponse('onboarding_tokens', { id: 'existing-row' });

    const event = buildCheckoutEvent('cs_test_session_1', 'buyer@example.com', 'monthly');
    const payload = JSON.stringify(event);
    const sig = signedHeader(payload);

    const res = await request(app)
      .post('/api/stripe/webhook')
      .set('Content-Type', 'application/json')
      .set('stripe-signature', sig)
      .send(payload);

    assert.equal(res.status, 200);
    assert.equal(res.body.received, true);
    assert.equal(res.body.idempotent, true);
    // No new token inserted because we short-circuited
    assert.equal(
      fake.insertWasCalled('onboarding_tokens'),
      false,
      'should not insert a second token for the same session'
    );
  });
});

// ---------------------------------------------------------------------------
// Invalid or missing signature -> 400
// ---------------------------------------------------------------------------
describe('POST /api/stripe/webhook - bad signature', () => {
  test('wrong signature -> 400, no token insert', async () => {
    fake.reset();

    const event = buildCheckoutEvent('cs_test_session_2', 'buyer@example.com', 'monthly');
    const payload = JSON.stringify(event);

    // Sign with a different secret so verification fails
    const badSig = stripeForSig.webhooks.generateTestHeaderString({
      payload,
      secret: 'wrong-webhook-signing-secret-stub',
    });

    const res = await request(app)
      .post('/api/stripe/webhook')
      .set('Content-Type', 'application/json')
      .set('stripe-signature', badSig)
      .send(payload);

    assert.equal(res.status, 400);
    assert.equal(fake.insertWasCalled('onboarding_tokens'), false);
  });

  test('missing stripe-signature header -> 400, no token insert', async () => {
    fake.reset();

    const event = buildCheckoutEvent('cs_test_session_3', 'buyer@example.com', 'monthly');
    const payload = JSON.stringify(event);

    const res = await request(app)
      .post('/api/stripe/webhook')
      .set('Content-Type', 'application/json')
      .send(payload);

    assert.equal(res.status, 400);
    assert.equal(fake.insertWasCalled('onboarding_tokens'), false);
  });

  test('tampered payload with valid-looking header -> 400', async () => {
    fake.reset();

    const event = buildCheckoutEvent('cs_test_session_4', 'buyer@example.com', 'yearly');
    const originalPayload = JSON.stringify(event);
    const sig = signedHeader(originalPayload);

    // Tamper: change the plan after signing
    const tamperedPayload = originalPayload.replace('"yearly"', '"lifetime"');

    const res = await request(app)
      .post('/api/stripe/webhook')
      .set('Content-Type', 'application/json')
      .set('stripe-signature', sig)
      .send(tamperedPayload);

    assert.equal(res.status, 400);
    assert.equal(fake.insertWasCalled('onboarding_tokens'), false);
  });
});

// ---------------------------------------------------------------------------
// STRIPE_WEBHOOK_SECRET unset: route must refuse without inserting.
//
// The route reads process.env.STRIPE_WEBHOOK_SECRET at request time (not at
// module load time), so we can test this by temporarily removing the env var
// and using the shared app instance. We restore it immediately after.
// ---------------------------------------------------------------------------
describe('POST /api/stripe/webhook - STRIPE_WEBHOOK_SECRET unset', () => {
  test('route returns 503 when STRIPE_WEBHOOK_SECRET is not configured', async () => {
    fake.reset();

    const savedSecret = process.env.STRIPE_WEBHOOK_SECRET;
    delete process.env.STRIPE_WEBHOOK_SECRET;

    const event = buildCheckoutEvent('cs_test_session_5', 'buyer@example.com', 'monthly');
    const payload = JSON.stringify(event);

    let res;
    try {
      res = await request(app)
        .post('/api/stripe/webhook')
        .set('Content-Type', 'application/json')
        .send(payload);
    } finally {
      // Always restore so later tests are not affected
      process.env.STRIPE_WEBHOOK_SECRET = savedSecret;
    }

    assert.equal(res.status, 503);
    assert.equal(fake.insertWasCalled('onboarding_tokens'), false);
  });
});
