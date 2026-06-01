'use strict';

// Validation unit tests:
//   1. Order email send: invalid `to` -> 400; valid address passes validation.
//   2. config/auth: JWT_EXPIRY constant is '24h', and tokens issued with it
//      decode to a 24-hour window.

const { test, before, describe } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const path = require('path');

const { loadApp } = require('./helpers/loadApp');

let app;

before(() => {
  ({ app } = loadApp());
});

// ---------------------------------------------------------------------------
// POST /api/order-email/send - email address validation
// ---------------------------------------------------------------------------
describe('POST /api/order-email/send - recipient validation', () => {
  // Minimal valid groups payload to pass the groups check and reach the
  // email validation. The route validates `to` before consulting the DB.
  const validGroups = [
    {
      supplier: 'ABC Supply',
      phases: ['Phase 1'],
      items: [
        {
          sku: 'MAT-001',
          name: 'Stucco Mix',
          qty: 10,
          unit: 'bag',
          pricePerUnit: 12,
          lineTotal: 120,
        },
      ],
    },
  ];

  test('missing to field -> 400', async () => {
    const res = await request(app)
      .post('/api/order-email/send')
      .send({ groups: validGroups, materialTotal: 120 });

    assert.equal(res.status, 400);
    assert.match(res.body.error, /email/i);
  });

  test('empty string to -> 400', async () => {
    const res = await request(app)
      .post('/api/order-email/send')
      .send({ to: '', groups: validGroups, materialTotal: 120 });

    assert.equal(res.status, 400);
    assert.match(res.body.error, /email/i);
  });

  test('malformed email (no @) -> 400', async () => {
    const res = await request(app)
      .post('/api/order-email/send')
      .send({ to: 'notanemail', groups: validGroups, materialTotal: 120 });

    assert.equal(res.status, 400);
    assert.match(res.body.error, /email/i);
  });

  test('malformed email (no TLD) -> 400', async () => {
    const res = await request(app)
      .post('/api/order-email/send')
      .send({ to: 'user@nodomain', groups: validGroups, materialTotal: 120 });

    assert.equal(res.status, 400);
    assert.match(res.body.error, /email/i);
  });

  test('email over 254 chars -> 400', async () => {
    const longLocal = 'a'.repeat(244);
    const overlong = `${longLocal}@example.com`; // 244 + 12 = 256 chars
    const res = await request(app)
      .post('/api/order-email/send')
      .send({ to: overlong, groups: validGroups, materialTotal: 120 });

    assert.equal(res.status, 400);
    assert.match(res.body.error, /email/i);
  });

  test('valid email but no groups -> 400 (groups check)', async () => {
    // A well-formed address passes the email gate but fails the groups check.
    // This confirms the route processes a valid address and moves to the next validation.
    const res = await request(app)
      .post('/api/order-email/send')
      .send({ to: 'supplier@acmesupply.com', groups: [] });

    assert.equal(res.status, 400);
    assert.match(res.body.error, /items/i);
  });
});

// ---------------------------------------------------------------------------
// config/auth: JWT_EXPIRY and token lifetime
// ---------------------------------------------------------------------------
describe('config/auth - JWT_EXPIRY', () => {
  test('JWT_EXPIRY is "24h"', () => {
    // Resolve config/auth directly (it was cached by loadApp via server.js).
    // Re-require from the resolved path so we get the same cached instance.
    const authConfig = require(path.resolve(__dirname, '../config/auth'));
    assert.equal(authConfig.JWT_EXPIRY, '24h');
  });

  test('token signed with JWT_EXPIRY decodes to a 24-hour window', () => {
    const authConfig = require(path.resolve(__dirname, '../config/auth'));
    const payload = { id: 'u1', email: 'test@example.com', name: 'Test', role: 'user' };
    const token = jwt.sign(payload, authConfig.JWT_SECRET, { expiresIn: authConfig.JWT_EXPIRY });

    const decoded = jwt.decode(token);
    const windowSeconds = decoded.exp - decoded.iat;

    // Allow a 2-second tolerance for test execution time
    assert.ok(
      windowSeconds >= 24 * 3600 - 2 && windowSeconds <= 24 * 3600 + 2,
      `Expected 24h window (86400s), got ${windowSeconds}s`
    );
  });
});
