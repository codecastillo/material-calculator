'use strict';

const { test, before, describe } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const jwt = require('jsonwebtoken');

const { loadApp } = require('./helpers/loadApp');

// Load once for all auth tests. Each describe block that needs a fresh DB
// state calls fake.setResponse() before the request.
let app;
let fake;

before(() => {
  ({ app, fake } = loadApp());
});

// ---------------------------------------------------------------------------
// Auth middleware (tested via GET /api/auth/me)
// ---------------------------------------------------------------------------
describe('GET /api/auth/me - auth middleware', () => {
  test('no Authorization header -> 401', async () => {
    const res = await request(app).get('/api/auth/me');
    assert.equal(res.status, 401);
    assert.ok(res.body.error, 'should have an error field');
  });

  test('malformed Authorization header (no Bearer prefix) -> 401', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Token abc123');
    assert.equal(res.status, 401);
  });

  test('Authorization: Bearer alone (missing token) -> 401', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer');
    assert.equal(res.status, 401);
  });

  test('token signed with the wrong secret -> 401', async () => {
    const badToken = jwt.sign({ id: 1, email: 'x@x.com' }, 'wrong-secret');
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${badToken}`);
    assert.equal(res.status, 401);
  });

  test('expired token -> 401 with "Token has expired"', async () => {
    const expiredToken = jwt.sign(
      { id: 1, email: 'x@x.com', name: 'Test', role: 'user' },
      'test-secret-value',
      { expiresIn: '-1s' }
    );
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${expiredToken}`);
    assert.equal(res.status, 401);
    assert.equal(res.body.error, 'Token has expired');
  });

  test('valid token + user in DB -> 200 with user object', async () => {
    const validToken = jwt.sign(
      { id: 'user-uuid-1', email: 'jane@example.com', name: 'Jane', role: 'user' },
      'test-secret-value',
      { expiresIn: '1h' }
    );
    fake.setResponse('users', {
      id: 'user-uuid-1',
      email: 'jane@example.com',
      name: 'Jane',
      role: 'user',
    });

    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${validToken}`);

    assert.equal(res.status, 200);
    assert.ok(res.body.user, 'response should contain a user field');
    assert.equal(res.body.user.email, 'jane@example.com');

    fake.reset();
  });
});

// ---------------------------------------------------------------------------
// POST /api/auth/register - input validation (no DB writes for these cases)
// ---------------------------------------------------------------------------
describe('POST /api/auth/register - validation', () => {
  test('missing email -> 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ password: 'StrongPass1', name: 'Alice' });
    assert.equal(res.status, 400);
    assert.ok(res.body.error);
  });

  test('missing password -> 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'alice@example.com', name: 'Alice' });
    assert.equal(res.status, 400);
    assert.ok(res.body.error);
  });

  test('missing name -> 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'alice@example.com', password: 'StrongPass1' });
    assert.equal(res.status, 400);
    assert.ok(res.body.error);
  });

  test('password too short -> 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'alice@example.com', password: 'Short1', name: 'Alice' });
    assert.equal(res.status, 400);
    assert.match(res.body.error, /8 characters/);
  });

  test('password with no uppercase -> 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'alice@example.com', password: 'nouppercase1', name: 'Alice' });
    assert.equal(res.status, 400);
    assert.match(res.body.error, /uppercase/i);
  });

  test('password with no number -> 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'alice@example.com', password: 'NoNumbersHere', name: 'Alice' });
    assert.equal(res.status, 400);
    assert.match(res.body.error, /number/i);
  });
});

// ---------------------------------------------------------------------------
// POST /api/auth/login - input validation
// ---------------------------------------------------------------------------
describe('POST /api/auth/login - validation', () => {
  test('missing email -> 400', async () => {
    const res = await request(app).post('/api/auth/login').send({ password: 'somepass' });
    assert.equal(res.status, 400);
    assert.ok(res.body.error);
  });

  test('missing password -> 400', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'alice@example.com' });
    assert.equal(res.status, 400);
    assert.ok(res.body.error);
  });

  test('empty body -> 400', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    assert.equal(res.status, 400);
    assert.ok(res.body.error);
  });
});

// ---------------------------------------------------------------------------
// Per-code attempt cap (anti-bruteforce) on /verify and /reset-password
// ---------------------------------------------------------------------------
describe('verification code attempt cap', () => {
  const userToken = jwt.sign(
    { id: 'user-uuid-1', email: 'jane@example.com', name: 'Jane', role: 'user' },
    'test-secret-value',
    { expiresIn: '1h' }
  );
  const future = () => new Date(Date.now() + 10 * 60 * 1000).toISOString();
  const past = () => new Date(Date.now() - 60 * 1000).toISOString();

  test('/verify wrong code below cap -> 400 and attempts incremented, code kept', async () => {
    fake.setResponse('verification_codes', {
      id: 'vc1',
      user_id: 'user-uuid-1',
      code: '111111',
      attempts: 0,
      expires_at: future(),
    });

    const res = await request(app)
      .post('/api/auth/verify')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ code: '999999' });

    assert.equal(res.status, 400);
    assert.equal(res.body.error, 'Invalid code');
    assert.ok(fake.updateWasCalled('verification_codes'), 'attempts should be incremented');
    assert.equal(fake.updatePayload('verification_codes').attempts, 1);
    assert.ok(!fake.deleteWasCalled('verification_codes'), 'code should not be deleted yet');
    fake.reset();
  });

  test('/verify wrong code at cap -> 400 and code deleted', async () => {
    fake.setResponse('verification_codes', {
      id: 'vc1',
      user_id: 'user-uuid-1',
      code: '111111',
      attempts: 4,
      expires_at: future(),
    });

    const res = await request(app)
      .post('/api/auth/verify')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ code: '999999' });

    assert.equal(res.status, 400);
    assert.match(res.body.error, /too many/i);
    assert.ok(fake.deleteWasCalled('verification_codes'), 'code should be destroyed at the cap');
    fake.reset();
  });

  test('/verify expired code -> 400 and code deleted', async () => {
    fake.setResponse('verification_codes', {
      id: 'vc1',
      user_id: 'user-uuid-1',
      code: '111111',
      attempts: 0,
      expires_at: past(),
    });

    const res = await request(app)
      .post('/api/auth/verify')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ code: '111111' });

    assert.equal(res.status, 400);
    assert.match(res.body.error, /expired/i);
    assert.ok(fake.deleteWasCalled('verification_codes'));
    fake.reset();
  });

  test('/verify correct code -> 200 and email verified', async () => {
    fake.setResponse('verification_codes', {
      id: 'vc1',
      user_id: 'user-uuid-1',
      code: '111111',
      attempts: 0,
      expires_at: future(),
    });

    const res = await request(app)
      .post('/api/auth/verify')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ code: '111111' });

    assert.equal(res.status, 200);
    assert.match(res.body.message, /verified/i);
    fake.reset();
  });

  test('/reset-password wrong code below cap -> 400 and attempts incremented', async () => {
    fake.setResponse('verification_codes', {
      id: 'vc1',
      user_id: 'user-uuid-default',
      code: '111111',
      attempts: 1,
      expires_at: future(),
    });

    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ email: 'jane@example.com', code: '999999', password: 'StrongPass1' });

    assert.equal(res.status, 400);
    assert.equal(res.body.error, 'Invalid code');
    assert.equal(fake.updatePayload('verification_codes').attempts, 2);
    fake.reset();
  });

  test('/reset-password wrong code at cap -> 400 and code deleted', async () => {
    fake.setResponse('verification_codes', {
      id: 'vc1',
      user_id: 'user-uuid-default',
      code: '111111',
      attempts: 4,
      expires_at: future(),
    });

    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ email: 'jane@example.com', code: '999999', password: 'StrongPass1' });

    assert.equal(res.status, 400);
    assert.match(res.body.error, /too many/i);
    assert.ok(fake.deleteWasCalled('verification_codes'));
    fake.reset();
  });
});
