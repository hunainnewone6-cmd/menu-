const orderService = require('../services/orderService');
const { validateOrderPayload } = require('../utils/validation');
const { BadRequestError, NotFoundError } = require('../utils/errors');
const { ordersToCsv } = require('../utils/csv');

async function create(req, res, next) {
  try {
    const { errors, data } = validateOrderPayload(req.body);
    if (errors.length) throw new BadRequestError(errors.join('; '), 'INVALID_ORDER');

    const result = orderService.createOrder(data);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const id = req.params.id;
    if (typeof id !== 'string' || id.length < 3 || id.length > 64) {
      throw new BadRequestError('Invalid order id', 'INVALID_ID');
    }
    const mobile = req.query.mobile ? String(req.query.mobile).trim() : null;
    const normalizedMobile = mobile ? require('../utils/validation').normalizeMobile(mobile) : null;

    const order = orderService.getOrderForCustomer(id, normalizedMobile);
    if (!order) throw new NotFoundError('Order not found or mobile number mismatch', 'ORDER_NOT_FOUND');
    res.json(order);
  } catch (err) {
    next(err);
  }
}

async function listForAdmin(req, res, next) {
  try {
    const { branch, date } = req.query;
    const orders = orderService.listOrders({ branch, date });
    res.json({ count: orders.length, orders });
  } catch (err) {
    next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const id = req.params.id;
    if (typeof id !== 'string' || id.length < 3 || id.length > 64) {
      throw new BadRequestError('Invalid order id', 'INVALID_ID');
    }
    const status = req.body?.status;
    if (typeof status !== 'string') {
      throw new BadRequestError('status is required', 'MISSING_STATUS');
    }
    const order = orderService.updateStatus(id, status);
    res.json(order);
  } catch (err) {
    next(err);
  }
}

async function exportCsv(req, res, next) {
  try {
    const { branch, date } = req.query;
    const orders = orderService.listOrders({ branch, date });
    const csv = ordersToCsv(orders);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="orders-${Date.now()}.csv"`);
    res.send(csv);
  } catch (err) {
    next(err);
  }
}

module.exports = { create, getById, listForAdmin, updateStatus, exportCsv };
