'use strict';

const { test, before, describe } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const jwt = require('jsonwebtoken');

const { loadApp } = require('./helpers/loadApp');

let app;
let fake;
let authHeader;

before(() => {
  ({ app, fake } = loadApp());
  // A valid token that the middleware will accept for all jobs tests
  const token = jwt.sign(
    { id: 'user-uuid-jobs', email: 'builder@example.com', name: 'Builder', role: 'user' },
    'test-secret-value',
    { expiresIn: '1h' }
  );
  authHeader = `Bearer ${token}`;
});

// ---------------------------------------------------------------------------
// POST /api/jobs - numeric field validation (server-side fix)
// ---------------------------------------------------------------------------
describe('POST /api/jobs - invalid numeric fields rejected before DB', () => {
  test('negative sqft -> 400, insert NOT called', async () => {
    fake.reset();
    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', authHeader)
      .send({ name: 'Test Job', sqft: -5 });

    assert.equal(res.status, 400);
    assert.match(res.body.error, /non-negative/);
    assert.equal(fake.insertWasCalled('jobs'), false, 'insert should not be called on bad input');
  });

  test('NaN sqft (string "abc") -> 400, insert NOT called', async () => {
    fake.reset();
    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', authHeader)
      .send({ name: 'Test Job', sqft: 'abc' });

    assert.equal(res.status, 400);
    assert.ok(res.body.error);
    assert.equal(fake.insertWasCalled('jobs'), false);
  });

  test('waste_pct > 100 -> 400, insert NOT called', async () => {
    fake.reset();
    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', authHeader)
      .send({ name: 'Test Job', waste_pct: 150 });

    assert.equal(res.status, 400);
    assert.match(res.body.error, /waste_pct/);
    assert.equal(fake.insertWasCalled('jobs'), false);
  });

  test('profit_pct > 500 -> 400, insert NOT called', async () => {
    fake.reset();
    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', authHeader)
      .send({ name: 'Test Job', profit_pct: 600 });

    assert.equal(res.status, 400);
    assert.match(res.body.error, /profit_pct/);
    assert.equal(fake.insertWasCalled('jobs'), false);
  });

  test('tax_pct > 30 -> 400, insert NOT called', async () => {
    fake.reset();
    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', authHeader)
      .send({ name: 'Test Job', tax_pct: 99 });

    assert.equal(res.status, 400);
    assert.match(res.body.error, /tax_pct/);
    assert.equal(fake.insertWasCalled('jobs'), false);
  });

  test('negative labor_rate -> 400, insert NOT called', async () => {
    fake.reset();
    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', authHeader)
      .send({ name: 'Test Job', labor_rate: -10 });

    assert.equal(res.status, 400);
    assert.match(res.body.error, /non-negative/);
    assert.equal(fake.insertWasCalled('jobs'), false);
  });
});

// ---------------------------------------------------------------------------
// POST /api/jobs - missing name
// ---------------------------------------------------------------------------
describe('POST /api/jobs - name required', () => {
  test('missing name -> 400', async () => {
    fake.reset();
    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', authHeader)
      .send({ sqft: 100, waste_pct: 10 });

    assert.equal(res.status, 400);
    assert.match(res.body.error, /name/i);
  });
});

// ---------------------------------------------------------------------------
// POST /api/jobs - valid payload reaches DB and returns 201
// ---------------------------------------------------------------------------
describe('POST /api/jobs - valid input', () => {
  test('valid job data -> 201, insert called with correct data', async () => {
    fake.reset();
    const jobRow = {
      id: 'job-uuid-1',
      user_id: 'user-uuid-jobs',
      name: 'Garage Stucco',
      sqft: 800,
      waste_pct: 10,
      profit_pct: 20,
      tax_pct: 0,
    };
    fake.setResponse('jobs', jobRow);

    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', authHeader)
      .send({ name: 'Garage Stucco', sqft: 800, waste_pct: 10, profit_pct: 20, tax_pct: 0 });

    assert.equal(res.status, 201);
    assert.ok(res.body.job, 'response should include job object');
    assert.equal(res.body.job.name, 'Garage Stucco');
    assert.equal(fake.insertWasCalled('jobs'), true, 'insert should be called on valid input');
  });
});

// ---------------------------------------------------------------------------
// PUT /api/jobs/:id - validation on update
// ---------------------------------------------------------------------------
describe('PUT /api/jobs/:id - invalid numeric field rejected before DB', () => {
  test('negative sqft on update -> 400, update NOT called', async () => {
    fake.reset();
    const res = await request(app)
      .put('/api/jobs/job-uuid-1')
      .set('Authorization', authHeader)
      .send({ sqft: -1 });

    assert.equal(res.status, 400);
    assert.match(res.body.error, /non-negative/);
    assert.equal(fake.updateWasCalled('jobs'), false);
  });

  test('valid partial update -> update called', async () => {
    fake.reset();
    const updatedJob = { id: 'job-uuid-1', name: 'Updated Job', sqft: 900 };
    fake.setResponse('jobs', updatedJob);

    const res = await request(app)
      .put('/api/jobs/job-uuid-1')
      .set('Authorization', authHeader)
      .send({ name: 'Updated Job', sqft: 900 });

    assert.equal(res.status, 200);
    assert.ok(res.body.job);
    assert.equal(fake.updateWasCalled('jobs'), true);
  });
});
