const { getDb } = require('../db/connection');
const { generateOrderId } = require('../utils/ids');
const menuService = require('./menuService');
const config = require('../config');
const {
  BadRequestError,
  NotFoundError,
} = require('../utils/errors');
const { validateOrderItem, validateStatusTransition } = require('../utils/validation');

// SQLite stores datetimes as "YYYY-MM-DD HH:MM:SS". Normalize to ISO 8601
// ("YYYY-MM-DDTHH:MM:SSZ") so clients receive a consistent format.
function toIso(value) {
  if (!value) return null;
  if (typeof value !== 'string') return value;
  return value.replace(' ', 'T') + 'Z';
}

function createOrder({ customerName, mobile, address, branch, notes, items }) {
  const db = getDb();

  const itemIds = items.map((it) => it.menuItemId);
  const menuItems = menuService.getByIds(itemIds);
  const menuById = new Map(menuItems.map((m) => [m.id, m]));

  const resolvedItems = [];
  let subtotal = 0;

  for (const raw of items) {
    const { errors, data } = validateOrderItem(raw);
    if (errors.length) throw new BadRequestError(errors.join('; '), 'INVALID_ITEM');

    const menuItem = menuById.get(data.menuItemId);
    if (!menuItem) {
      throw new BadRequestError(`Menu item ${data.menuItemId} not found`, 'MENU_ITEM_NOT_FOUND');
    }
    if (!menuItem.available) {
      throw new BadRequestError(`"${menuItem.name}" is currently unavailable`, 'ITEM_UNAVAILABLE');
    }

    const lineTotal = menuItem.price * data.quantity;
    subtotal += lineTotal;
    resolvedItems.push({
      menuItemId: menuItem.id,
      name: menuItem.name,
      price: menuItem.price,
      quantity: data.quantity,
    });
  }

  const deliveryCharge = config.delivery.charge;
  const total = subtotal + deliveryCharge;
  const orderId = generateOrderId();

  const insertOrder = db.prepare(`
    INSERT INTO orders (id, customer_name, mobile, address, branch, notes, subtotal, delivery_charge, total, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Received')
  `);
  const insertItem = db.prepare(`
    INSERT INTO order_items (order_id, menu_item_id, name, price, quantity)
    VALUES (?, ?, ?, ?, ?)
  `);

  db.exec('BEGIN');
  try {
    insertOrder.run(orderId, customerName, mobile, address, branch, notes || null, subtotal, deliveryCharge, total);
    for (const it of resolvedItems) {
      insertItem.run(orderId, it.menuItemId, it.name, it.price, it.quantity);
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  return { orderId, total, status: 'Received' };
}

function getOrder(id) {
  const db = getDb();
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  if (!order) return null;

  const items = db.prepare('SELECT menu_item_id, name, price, quantity FROM order_items WHERE order_id = ?').all(id);

  return {
    orderId: order.id,
    customerMobile: order.mobile,
    status: order.status,
    branch: order.branch,
    createdAt: toIso(order.created_at),
    updatedAt: toIso(order.updated_at),
    items: items.map((it) => ({
      menuItemId: it.menu_item_id,
      name: it.name,
      price: it.price,
      quantity: it.quantity,
      lineTotal: it.price * it.quantity,
    })),
    subtotal: order.subtotal,
    deliveryCharge: order.delivery_charge,
    total: order.total,
  };
}

function getOrderForCustomer(id, mobile) {
  const full = getOrder(id);
  if (!full) return null;

  // If a mobile is provided, verify it matches the order's stored phone number
  // before revealing protected order details. Without a mobile, the order is
  // returned for public tracking (no customer PII exposed).
  if (mobile && mobile !== full.customerMobile) {
    return null;
  }

  return {
    orderId: full.orderId,
    status: full.status,
    branch: full.branch,
    createdAt: full.createdAt,
    updatedAt: full.updatedAt,
    items: full.items.map((it) => ({ name: it.name, quantity: it.quantity, price: it.price, lineTotal: it.lineTotal })),
    subtotal: full.subtotal,
    deliveryCharge: full.deliveryCharge,
    total: full.total,
  };
}

function listOrders({ branch, date } = {}) {
  const db = getDb();
  const where = [];
  const params = [];

  if (branch) {
    if (!config.branches.includes(branch)) {
      throw new BadRequestError(`branch must be one of: ${config.branches.join(', ')}`, 'INVALID_BRANCH');
    }
    where.push('o.branch = ?');
    params.push(branch);
  }
  if (date) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new BadRequestError('date must be in YYYY-MM-DD format', 'INVALID_DATE');
    }
    where.push("date(o.created_at) = ?");
    params.push(date);
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const orders = db
    .prepare(`SELECT * FROM orders o ${whereClause} ORDER BY o.created_at DESC LIMIT 500`)
    .all(...params);

  const itemStmt = db.prepare('SELECT menu_item_id, name, price, quantity FROM order_items WHERE order_id = ?');

  return orders.map((o) => ({
    id: o.id,
    customer_name: o.customer_name,
    mobile: o.mobile,
    address: o.address,
    branch: o.branch,
    status: o.status,
    subtotal: o.subtotal,
    delivery_charge: o.delivery_charge,
    total: o.total,
    created_at: toIso(o.created_at),
    updated_at: toIso(o.updated_at),
    items: itemStmt.all(o.id).map((it) => ({
      menuItemId: it.menu_item_id,
      name: it.name,
      price: it.price,
      quantity: it.quantity,
    })),
  }));
}

function toCustomerSafeOrder(full) {
  return {
    orderId: full.orderId,
    status: full.status,
    branch: full.branch,
    createdAt: full.createdAt,
    updatedAt: full.updatedAt,
    items: full.items.map((it) => ({ name: it.name, quantity: it.quantity, price: it.price, lineTotal: it.lineTotal })),
    subtotal: full.subtotal,
    deliveryCharge: full.deliveryCharge,
    total: full.total,
  };
}

function updateStatus(id, newStatus) {
  const db = getDb();
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  if (!order) throw new NotFoundError('Order not found', 'ORDER_NOT_FOUND');

  const check = validateStatusTransition(order.status, newStatus);
  if (!check.valid) throw new BadRequestError(check.error, 'INVALID_STATUS_TRANSITION');

  db.prepare("UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?").run(newStatus, id);
  return toCustomerSafeOrder(getOrder(id));
}

module.exports = { createOrder, getOrder, getOrderForCustomer, listOrders, updateStatus };