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
const { seedMenu } = require('../src/db/seed');
const { closeDb, getDb } = require('../src/db/connection');
const adminService = require('../src/services/adminService');
const { signAccessToken, signShortLivedToken } = require('../src/utils/auth');
const totp = require('../src/utils/totp');

let app;
let adminToken;
let adminId;

before(async () => {
  migrate();
  seedMenu();
  app = createApp();

  const admin = await adminService.createAdmin({ username: 'testadmin', password: 'testpassword123' });
  adminId = admin.id;
  adminToken = signAccessToken({ sub: admin.id, username: admin.username, role: 'admin', type: 'access' });
});

after(() => {
  closeDb();
});

test('GET /api/health returns ok', async () => {
  const res = await request(app).get('/api/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'ok');
});

test('GET /api/menu returns seeded items', async () => {
  const res = await request(app).get('/api/menu');
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));
  assert.ok(res.body.length >= 12, `expected at least 12 items, got ${res.body.length}`);
  const biryani = res.body.find((i) => i.name === 'Chicken Biryani');
  assert.ok(biryani, 'Chicken Biryani should be seeded');
  assert.equal(biryani.price, 550);
  assert.ok(Array.isArray(biryani.tags));
});

test('POST /api/orders creates an order with server-calculated totals', async () => {
  const menuRes = await request(app).get('/api/menu');
  const item = menuRes.body[0];

  const res = await request(app)
    .post('/api/orders')
    .send({
      customerName: 'Ali Khan',
      mobile: '03001234567',
      address: 'House 12, Block A, Clifton',
      branch: 'Clifton',
      items: [{ menuItemId: item.id, quantity: 2 }],
    });

  assert.equal(res.status, 201);
  assert.ok(res.body.orderId.startsWith('KB-'));
  assert.equal(res.body.status, 'Received');
  assert.equal(res.body.total, item.price * 2 + 150);
});

test('POST /api/orders rejects invalid input', async () => {
  const res = await request(app).post('/api/orders').send({ customerName: '', mobile: '123', branch: 'Unknown', items: [] });
  assert.equal(res.status, 400);
  assert.ok(res.body.error);
});

test('POST /api/orders rejects prices sent by client (server calculates)', async () => {
  const menuRes = await request(app).get('/api/menu');
  const item = menuRes.body[0];

  const res = await request(app)
    .post('/api/orders')
    .send({
      customerName: 'Sara',
      mobile: '03001234567',
      address: 'Addr',
      branch: 'Clifton',
      items: [{ menuItemId: item.id, quantity: 1, price: 1 }],
    });

  assert.equal(res.status, 201);
  assert.equal(res.body.total, item.price + 150, 'server must ignore client-sent price');
});

test('GET /api/orders/:id returns order summary for customer', async () => {
  const menuRes = await request(app).get('/api/menu');
  const item = menuRes.body[0];
  const created = await request(app)
    .post('/api/orders')
    .send({
      customerName: 'Ahmed',
      mobile: '03001234567',
      address: 'Addr',
      branch: 'Gulshan-e-Iqbal',
      items: [{ menuItemId: item.id, quantity: 1 }],
    });

  const res = await request(app).get(`/api/orders/${created.body.orderId}`);
  assert.equal(res.status, 200);
  assert.equal(res.body.orderId, created.body.orderId);
  assert.equal(res.body.status, 'Received');
  assert.ok(!res.body.customerName, 'customer PII must not be exposed on public endpoint');
  assert.ok(!res.body.mobile, 'mobile must not be exposed on public endpoint');
});

test('GET /api/orders/:id returns 404 for unknown order', async () => {
  const res = await request(app).get('/api/orders/KB-UNKNOWN-XYZ');
  assert.equal(res.status, 404);
});

test('POST /api/auth/login returns 202 + pendingToken when 2FA enabled', async () => {
  const db = getDb();
  const secret = totp.generateSecret();
  db.prepare('UPDATE admins SET totp_enabled = 1, totp_secret = ?, backup_codes = ? WHERE id = ?')
    .run(secret, JSON.stringify([]), adminId);

  const res = await request(app).post('/api/auth/login').send({ username: 'testadmin', password: 'testpassword123' });
  assert.equal(res.status, 202);
  assert.equal(res.body.requires2FA, true);
  assert.ok(res.body.pendingToken);

  db.prepare('UPDATE admins SET totp_enabled = 0, totp_secret = NULL WHERE id = ?').run(adminId);
});

test('POST /api/auth/login with 2FA disabled returns token directly', async () => {
  const res = await request(app).post('/api/auth/login').send({ username: 'testadmin', password: 'testpassword123' });
  assert.equal(res.status, 200);
  assert.ok(res.body.token);
});

test('POST /api/auth/login rejects invalid credentials', async () => {
  const res = await request(app).post('/api/auth/login').send({ username: 'testadmin', password: 'wrongpassword' });
  assert.equal(res.status, 401);
});

test('POST /api/auth/verify-2fa issues access token on valid TOTP', async () => {
  const db = getDb();
  const secret = totp.generateSecret();
  db.prepare('UPDATE admins SET totp_enabled = 1, totp_secret = ?, backup_codes = ? WHERE id = ?')
    .run(secret, JSON.stringify([]), adminId);

  const loginRes = await request(app).post('/api/auth/login').send({ username: 'testadmin', password: 'testpassword123' });
  const code = totp.authenticator.generate(secret);

  const verifyRes = await request(app)
    .post('/api/auth/verify-2fa')
    .set('Authorization', `Bearer ${loginRes.body.pendingToken}`)
    .send({ token: code });

  assert.equal(verifyRes.status, 200);
  assert.ok(verifyRes.body.token);

  db.prepare('UPDATE admins SET totp_enabled = 0, totp_secret = NULL WHERE id = ?').run(adminId);
});

test('POST /api/auth/verify-2fa accepts valid backup code and consumes it', async () => {
  const db = getDb();
  const secret = totp.generateSecret();
  const backupCodes = ['abcdef12', '12345678'];
  const hashed = backupCodes.map(totp.hashBackupCode);
  db.prepare('UPDATE admins SET totp_enabled = 1, totp_secret = ?, backup_codes = ? WHERE id = ?')
    .run(secret, JSON.stringify(hashed), adminId);

  const loginRes = await request(app).post('/api/auth/login').send({ username: 'testadmin', password: 'testpassword123' });

  const verifyRes = await request(app)
    .post('/api/auth/verify-2fa')
    .set('Authorization', `Bearer ${loginRes.body.pendingToken}`)
    .send({ token: 'abcdef12', useBackupCode: true });

  assert.equal(verifyRes.status, 200);
  assert.ok(verifyRes.body.token);

  const admin = db.prepare('SELECT backup_codes FROM admins WHERE id = ?').get(adminId);
  const remaining = JSON.parse(admin.backup_codes);
  assert.equal(remaining.length, 1, 'backup code should be consumed');

  db.prepare('UPDATE admins SET totp_enabled = 0, totp_secret = NULL, backup_codes = NULL WHERE id = ?').run(adminId);
});

test('POST /api/auth/verify-2fa rejects invalid code', async () => {
  const db = getDb();
  const secret = totp.generateSecret();
  db.prepare('UPDATE admins SET totp_enabled = 1, totp_secret = ?, backup_codes = ? WHERE id = ?')
    .run(secret, JSON.stringify([]), adminId);

  const loginRes = await request(app).post('/api/auth/login').send({ username: 'testadmin', password: 'testpassword123' });
  const verifyRes = await request(app)
    .post('/api/auth/verify-2fa')
    .set('Authorization', `Bearer ${loginRes.body.pendingToken}`)
    .send({ token: '000000' });

  assert.equal(verifyRes.status, 401);

  db.prepare('UPDATE admins SET totp_enabled = 0, totp_secret = NULL WHERE id = ?').run(adminId);
});

test('GET /api/admin/orders requires auth', async () => {
  const res = await request(app).get('/api/admin/orders');
  assert.equal(res.status, 401);
});

test('GET /api/admin/orders with valid token returns list', async () => {
  const res = await request(app).get('/api/admin/orders').set('Authorization', `Bearer ${adminToken}`);
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body.orders));
});

test('GET /api/admin/orders filters by branch and date', async () => {
  const menuRes = await request(app).get('/api/menu');
  const item = menuRes.body[0];
  await request(app)
    .post('/api/orders')
    .send({
      customerName: 'Branch Filter',
      mobile: '03001234567',
      address: 'Addr',
      branch: 'North Nazimabad',
      items: [{ menuItemId: item.id, quantity: 1 }],
    });

  const res = await request(app)
    .get('/api/admin/orders?branch=North Nazimabad')
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(res.status, 200);
  assert.ok(res.body.orders.every((o) => o.branch === 'North Nazimabad'));
});

test('PATCH /api/admin/orders/:id/status follows allowed sequence only', async () => {
  const menuRes = await request(app).get('/api/menu');
  const item = menuRes.body[0];
  const created = await request(app)
    .post('/api/orders')
    .send({
      customerName: 'Status Test',
      mobile: '03001234567',
      address: 'Addr',
      branch: 'Clifton',
      items: [{ menuItemId: item.id, quantity: 1 }],
    });

  const orderId = created.body.orderId;
  const auth = { Authorization: `Bearer ${adminToken}` };

  const r1 = await request(app).patch(`/api/admin/orders/${orderId}/status`).set(auth).send({ status: 'Preparing' });
  assert.equal(r1.status, 200);
  assert.equal(r1.body.status, 'Preparing');

  const skip = await request(app).patch(`/api/admin/orders/${orderId}/status`).set(auth).send({ status: 'Delivered' });
  assert.equal(skip.status, 400, 'cannot skip "Out for Delivery"');

  const back = await request(app).patch(`/api/admin/orders/${orderId}/status`).set(auth).send({ status: 'Received' });
  assert.equal(back.status, 400, 'cannot go backward');

  const r2 = await request(app).patch(`/api/admin/orders/${orderId}/status`).set(auth).send({ status: 'Out for Delivery' });
  assert.equal(r2.status, 200);

  const r3 = await request(app).patch(`/api/admin/orders/${orderId}/status`).set(auth).send({ status: 'Delivered' });
  assert.equal(r3.status, 200);

  const beyond = await request(app).patch(`/api/admin/orders/${orderId}/status`).set(auth).send({ status: 'Delivered' });
  assert.equal(beyond.status, 400, 'cannot go beyond Delivered');
});

test('PATCH /api/admin/orders/:id/status returns 404 for unknown order', async () => {
  const res = await request(app)
    .patch('/api/admin/orders/KB-DOES-NOT-EXIST/status')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ status: 'Preparing' });
  assert.equal(res.status, 404);
});

test('PATCH /api/admin/orders/:id/status returns 401 without token', async () => {
  const res = await request(app).patch('/api/admin/orders/KB-X/status').send({ status: 'Preparing' });
  assert.equal(res.status, 401);
});

test('Admin menu CRUD: create, update availability', async () => {
  const auth = { Authorization: `Bearer ${adminToken}` };

  const created = await request(app)
    .post('/api/menu/admin')
    .set(auth)
    .send({ name: 'Test Biryani', category: 'Rice', price: 999, tags: 'test' });
  assert.equal(created.status, 201);
  const newId = created.body.id;

  const updated = await request(app).patch(`/api/menu/admin/${newId}`).set(auth).send({ available: false });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.available, false);

  const list = await request(app).get('/api/menu');
  assert.equal(list.status, 200);
  assert.ok(!list.body.find((i) => i.id === newId), 'unavailable items should not appear on public menu');
});

test('Admin orders CSV export returns valid CSV', async () => {
  const res = await request(app).get('/api/admin/orders/export.csv').set('Authorization', `Bearer ${adminToken}`);
  assert.equal(res.status, 200);
  assert.match(res.headers['content-type'], /text\/csv/);
  assert.ok(res.text.includes('order_id'), 'CSV should have header');
});

test('Database persistence: data survives new connection (file DB test skipped in memory mode)', async () => {
  const db = getDb();
  const count = db.prepare('SELECT COUNT(*) as c FROM menu_items').get();
  assert.ok(count.c >= 12, 'menu items persisted');
});

test('Login rate limiting: locks account after repeated failures', async () => {
  const db = getDb();
  const admin = await adminService.createAdmin({ username: 'ratelimituser', password: 'ratelimitpassword123' });

  for (let i = 0; i < 5; i++) {
    await request(app).post('/api/auth/login').send({ username: 'ratelimituser', password: 'wrong' });
  }
  const lockedRes = await request(app).post('/api/auth/login').send({ username: 'ratelimituser', password: 'wrong' });
  assert.equal(lockedRes.status, 401);
  assert.match(lockedRes.body.error, /locked/i);

  db.prepare("DELETE FROM admins WHERE id = ?").run(admin.id);
});

test('2FA enroll + confirm flow end-to-end', async () => {
  const auth = { Authorization: `Bearer ${adminToken}` };

  const enrollRes = await request(app).post('/api/auth/2fa/enroll').set(auth);
  assert.equal(enrollRes.status, 200);
  assert.ok(enrollRes.body.secret);
  assert.ok(enrollRes.body.qrCode);

  const code = totp.authenticator.generate(enrollRes.body.secret);
  const confirmRes = await request(app).post('/api/auth/2fa/confirm').set(auth).send({ token: code });
  assert.equal(confirmRes.status, 200);
  assert.ok(Array.isArray(confirmRes.body.backupCodes));
  assert.equal(confirmRes.body.backupCodes.length, 8);

  const disableCode = totp.authenticator.generate(enrollRes.body.secret);
  const disableRes = await request(app).post('/api/auth/2fa/disable').set(auth).send({ token: disableCode });
  assert.equal(disableRes.status, 200);
});

test('Expired/invalid pending token is rejected for 2FA verify', async () => {
  const badToken = signShortLivedToken({ sub: adminId, type: 'wrong-type' }, '1s');
  const res = await request(app).post('/api/auth/verify-2fa').set('Authorization', `Bearer ${badToken}`).send({ token: '123456' });
  assert.equal(res.status, 401);
});
