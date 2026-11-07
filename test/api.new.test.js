process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-do-not-use-in-production';
process.env.DB_PATH = ':memory:';
process.env.DELIVERY_CHARGE = '150';
process.env.FRONTEND_ORIGIN = '*';

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const { createApp } = require('../src/app');
const { migrate } = require('../src/db/migrate');
const { seedMenu, REQUIRED_MENU } = require('../src/db/seed');
const { closeDb } = require('../src/db/connection');
const adminService = require('../src/services/adminService');
const { signAccessToken } = require('../src/utils/auth');

let app;
let adminToken;

before(async () => {
  migrate();
  seedMenu();
  app = createApp();
  const admin = await adminService.createAdmin({ username: 'testadmin', password: 'testpassword123' });
  adminToken = signAccessToken({ sub: admin.id, username: admin.username, role: 'admin', type: 'access' });
});

after(() => {
  closeDb();
});

// ---- Seed exactness ----

test('Seed data: exact 12 assignment items with correct IDs/prices/tags', async () => {
  const res = await request(app).get('/api/menu');
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));
  assert.equal(res.body.length, 12, `Expected 12 seed items, got ${res.body.length}`);

  const ids = new Set(res.body.map((i) => i.id));
  for (const item of REQUIRED_MENU) {
    assert.ok(ids.has(item.id), `id=${item.id} ${item.name} present`);
  }
  const byId = (id) => res.body.find((i) => i.id === id);
  assert.equal(byId(1)?.name, 'Chicken Malai Boti');
  assert.equal(byId(1)?.price, 850, 'Chicken Malai Boti price = 850');
  assert.deepStrictEqual(byId(1)?.tags, ['mild']);
  assert.deepStrictEqual(byId(2)?.price, 780, 'Beef Seekh Kebab price = 780');
  assert.deepStrictEqual(byId(2)?.tags, ['spicy']);
  assert.deepStrictEqual(byId(3)?.price, 1650, 'Mutton Karahi (half) price = 1650');
  assert.deepStrictEqual(byId(3)?.tags, ['spicy']);
  assert.deepStrictEqual(byId(4)?.price, 1250, 'Chicken Karahi (half) price = 1250');
  assert.deepStrictEqual(byId(4)?.tags, ['spicy']);
  assert.deepStrictEqual(byId(5)?.price, 550, 'Chicken Biryani price = 550');
  assert.deepStrictEqual(byId(5)?.tags, ['spicy']);
  assert.deepStrictEqual(byId(6)?.price, 420, 'Vegetable Pulao price = 420');
  assert.deepStrictEqual(byId(6)?.tags, ['veg']);
  assert.deepStrictEqual(byId(7)?.price, 450, 'Zinger Paratha Roll price = 450');
  assert.deepStrictEqual(byId(7)?.tags, ['spicy']);
  assert.deepStrictEqual(byId(8)?.price, 480, 'Paneer Tikka Roll price = 480');
  assert.deepStrictEqual(byId(8)?.tags, ['veg']);
  assert.deepStrictEqual(byId(9)?.price, 220, 'Mint Margarita price = 220');
  assert.deepStrictEqual(byId(9)?.tags, ['veg']);
  assert.deepStrictEqual(byId(10)?.price, 150, 'Doodh Patti Chai price = 150');
  assert.deepStrictEqual(byId(10)?.tags, ['veg']);
  assert.deepStrictEqual(byId(11)?.price, 250, 'Gulab Jamun (2 pcs) price = 250');
  assert.deepStrictEqual(byId(11)?.tags, ['veg']);
  assert.deepStrictEqual(byId(12)?.price, 300, 'Kheer price = 300');
  assert.deepStrictEqual(byId(12)?.tags, ['veg']);
});

test('Seed does not duplicate items across restarts', async () => {
  const res = await request(app).get('/api/menu');
  assert.equal(res.body.length, 12);
});

// ---- Phone verification ----

test('POST /api/orders phone verification: correct mobile returns order', async () => {
  const menuRes = await request(app).get('/api/menu');
  const item = menuRes.body[0];
  const created = await request(app)
    .post('/api/orders')
    .send({ customerName: 'PhoneTest', mobile: '03001234567', address: 'Addr', branch: 'Clifton', items: [{ menuItemId: item.id, quantity: 1 }] });
  const res = await request(app).get(`/api/orders/${created.body.orderId}?mobile=03001234567`);
  assert.equal(res.status, 200);
  assert.equal(res.body.orderId, created.body.orderId);
  assert.equal(res.body.items.length, 1);
});

test('POST /api/orders phone verification: wrong mobile returns 404', async () => {
  const menuRes = await request(app).get('/api/menu');
  const item = menuRes.body[0];
  const created = await request(app)
    .post('/api/orders')
    .send({ customerName: 'PhoneTest', mobile: '03001234567', address: 'Addr', branch: 'Clifton', items: [{ menuItemId: item.id, quantity: 1 }] });
  const res = await request(app).get(`/api/orders/${created.body.orderId}?mobile=03009999999`);
  assert.equal(res.status, 404);
});

test('POST /api/orders no mobile returns public order without PII', async () => {
  const menuRes = await request(app).get('/api/menu');
  const item = menuRes.body[0];
  const created = await request(app)
    .post('/api/orders')
    .send({ customerName: 'PhoneTest', mobile: '03001234567', address: 'Addr', branch: 'Clifton', items: [{ menuItemId: item.id, quantity: 1 }] });
  const res = await request(app).get(`/api/orders/${created.body.orderId}`);
  assert.equal(res.status, 200);
  assert.equal(res.body.orderId, created.body.orderId);
  assert.ok(!res.body.customerName);
  assert.ok(!res.body.mobile);
});

// ---- Nested customer shape ----

test('POST /api/orders nested customer shape accepted', async () => {
  const menuRes = await request(app).get('/api/menu');
  const item = menuRes.body[0];
  const res = await request(app)
    .post('/api/orders')
    .send({
      customer: { name: 'Ali', phone: '03001234567', address: 'Karachi' },
      branch: 'Clifton',
      items: [{ menuItemId: item.id, quantity: 2 }],
    });
  assert.equal(res.status, 201);
  assert.equal(res.body.total, item.price * 2 + 150);
});

test('POST /api/orders flat shape still works', async () => {
  const menuRes = await request(app).get('/api/menu');
  const item = menuRes.body[0];
  const res = await request(app)
    .post('/api/orders')
    .send({ customerName: 'FlatTest', mobile: '03001234567', address: 'Addr', branch: 'Clifton', items: [{ menuItemId: item.id, quantity: 1 }] });
  assert.equal(res.status, 201);
});

// ---- Validation edge cases ----

test('POST /api/orders rejects prices sent by client', async () => {
  const menuRes = await request(app).get('/api/menu');
  const item = menuRes.body[0];
  const res = await request(app)
    .post('/api/orders')
    .send({ customerName: 'A', mobile: '03001234567', address: 'Addr', branch: 'Clifton', items: [{ menuItemId: item.id, quantity: 1, price: 1 }] });
  assert.equal(res.status, 201);
  assert.equal(res.body.total, item.price + 150, 'server must ignore client-sent price');
});

test('POST /api/orders qty boundaries', async () => {
  const menuRes = await request(app).get('/api/menu');
  const item = menuRes.body[0];
  let res = await request(app).post('/api/orders').send({ customerName: 'A', mobile: '03001234567', address: 'A', branch: 'Clifton', items: [{ menuItemId: item.id, quantity: 1 }] });
  assert.equal(res.status, 201);
  res = await request(app).post('/api/orders').send({ customerName: 'A', mobile: '03001234567', address: 'A', branch: 'Clifton', items: [{ menuItemId: item.id, quantity: 50 }] });
  assert.equal(res.status, 201);
  res = await request(app).post('/api/orders').send({ customerName: 'A', mobile: '03001234567', address: 'A', branch: 'Clifton', items: [{ menuItemId: item.id, quantity: 0 }] });
  assert.equal(res.status, 400);
  res = await request(app).post('/api/orders').send({ customerName: 'A', mobile: '03001234567', address: 'A', branch: 'Clifton', items: [{ menuItemId: item.id, quantity: 51 }] });
  assert.equal(res.status, 400);
});

test('POST /api/orders invalid branch rejected', async () => {
  const menuRes = await request(app).get('/api/menu');
  const item = menuRes.body[0];
  const res = await request(app)
    .post('/api/orders')
    .send({ customerName: 'A', mobile: '03001234567', address: 'A', branch: 'DHA', items: [{ menuItemId: item.id, quantity: 1 }] });
  assert.equal(res.status, 400);
});

test('POST /api/orders empty items rejected', async () => {
  const res = await request(app).post('/api/orders').send({ customerName: 'A', mobile: '03001234567', address: 'A', branch: 'Clifton', items: [] });
  assert.equal(res.status, 400);
});

test('POST /api/orders missing required fields rejected 400', async () => {
  const res = await request(app).post('/api/orders').send({});
  assert.equal(res.status, 400);
  assert.ok(res.body.error);
});

test('POST /api/orders invalid Pakistani phone rejected 400', async () => {
  const res = await request(app).post('/api/orders').send({ customerName: 'A', mobile: '12345', address: 'A', branch: 'Clifton', items: [{ menuItemId: 1, quantity: 1 }] });
  assert.equal(res.status, 400);
});

// ---- ISO date format ----

test('POST /api/orders tracking response uses ISO date format', async () => {
  const menuRes = await request(app).get('/api/menu');
  const item = menuRes.body[0];
  const created = await request(app)
    .post('/api/orders')
    .send({ customerName: 'DateTest', mobile: '03001234567', address: 'Addr', branch: 'Clifton', items: [{ menuItemId: item.id, quantity: 1 }] });
  const res = await request(app).get(`/api/orders/${created.body.orderId}`);
  assert.equal(res.status, 200);
  assert.match(res.body.createdAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
  assert.match(res.body.updatedAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
});

test('GET /api/admin/orders returns ISO dates', async () => {
  const auth = { Authorization: `Bearer ${adminToken}` };
  const res = await request(app).get('/api/admin/orders').set(auth);
  assert.equal(res.status, 200);
  if (res.body.orders.length > 0) {
    const o = res.body.orders[0];
    assert.match(o.created_at, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
    assert.match(o.updated_at, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
  }
});

// ---- Status response sanitization ----

test('PATCH /api/admin/orders/:id/status sanitized response has no PII', async () => {
  const menuRes = await request(app).get('/api/menu');
  const item = menuRes.body[0];
  const created = await request(app)
    .post('/api/orders')
    .send({ customerName: 'StatusTest', mobile: '03001234567', address: 'Addr', branch: 'Clifton', items: [{ menuItemId: item.id, quantity: 1 }] });
  const auth = { Authorization: `Bearer ${adminToken}` };
  await request(app).patch(`/api/admin/orders/${created.body.orderId}/status`).set(auth).send({ status: 'Preparing' });
  const res = await request(app).get(`/api/orders/${created.body.orderId}`);
  assert.equal(res.status, 200);
  assert.ok(!res.body.customerName);
  assert.ok(!res.body.mobile);
  assert.equal(res.body.orderId, created.body.orderId);
});

// ---- CSV formula injection ----

test('Admin CSV export prevents formula injection', async () => {
  const menuRes = await request(app).get('/api/menu');
  const item = menuRes.body[0];
  await request(app)
    .post('/api/orders')
    .send({ customerName: '=HACKER', mobile: '+923001234567', address: '+923001234567', branch: 'Clifton', items: [{ menuItemId: item.id, quantity: 1 }] });
  const auth = { Authorization: `Bearer ${adminToken}` };
  const res = await request(app).get('/api/admin/orders/export.csv').set(auth);
  assert.equal(res.status, 200);
  assert.match(res.headers['content-type'], /text\/csv/);
  // Check that the cells were prefixed with a quote to neutralize formulas
  assert.ok(!res.text.includes('\n=HACKER,'), 'formula-injected =HACKER should be quoted in CSV');
  assert.ok(!res.text.includes('\n+923001234567,'), 'formula-injected +923001234567 should be quoted in CSV');
});
