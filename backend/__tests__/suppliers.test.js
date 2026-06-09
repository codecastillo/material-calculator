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
  const token = jwt.sign(
    { id: 'user-uuid-sup', email: 'builder@example.com', name: 'Builder', role: 'user' },
    'test-secret-value',
    { expiresIn: '1h' }
  );
  authHeader = `Bearer ${token}`;
});

describe('PUT /api/suppliers/:id - update alias', () => {
  test('no auth header -> 401', async () => {
    const res = await request(app).put('/api/suppliers/7').send({ alias: 'L&W' });
    assert.equal(res.status, 401);
  });

  test('empty body -> 400, no update issued', async () => {
    fake.reset();
    const res = await request(app)
      .put('/api/suppliers/7')
      .set('Authorization', authHeader)
      .send({});
    assert.equal(res.status, 400);
    assert.equal(fake.updateWasCalled('suppliers'), false);
  });

  test('sets alias -> 200 and updates the row', async () => {
    fake.reset();
    fake.setResponse('suppliers', { id: 7, name: 'ABC Supply', alias: 'L&W' });
    const res = await request(app)
      .put('/api/suppliers/7')
      .set('Authorization', authHeader)
      .send({ alias: 'L&W' });
    assert.equal(res.status, 200);
    assert.equal(res.body.supplier.alias, 'L&W');
    assert.equal(fake.updateWasCalled('suppliers'), true);
    assert.deepEqual(fake.updatePayload('suppliers'), { alias: 'L&W' });
  });

  test('clearing alias stores null', async () => {
    fake.reset();
    fake.setResponse('suppliers', { id: 7, name: 'ABC Supply', alias: null });
    const res = await request(app)
      .put('/api/suppliers/7')
      .set('Authorization', authHeader)
      .send({ alias: '' });
    assert.equal(res.status, 200);
    assert.equal(fake.updatePayload('suppliers').alias, null);
  });
});
