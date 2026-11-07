const menuService = require('../services/menuService');
const { BadRequestError } = require('../utils/errors');
const { sanitizeString } = require('../utils/validation');

async function listPublic(req, res, next) {
  try {
    const items = menuService.listPublicMenu();
    res.json(items);
  } catch (err) {
    next(err);
  }
}

async function listAdmin(req, res, next) {
  try {
    const includeHidden = req.query.includeHidden !== 'false';
    const items = menuService.listAdminMenu({ includeHidden });
    res.json(items);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const name = sanitizeString(req.body?.name, { maxLength: 100, required: true, label: 'name' });
    const category = sanitizeString(req.body?.category, { maxLength: 50, required: true, label: 'category' });
    const tags = sanitizeString(req.body?.tags, { maxLength: 200 });
    const price = Number(req.body?.price);
    const available = req.body?.available === undefined ? true : Boolean(req.body.available);

    const errors = [];
    if (name.error) errors.push(name.error);
    if (category.error) errors.push(category.error);
    if (!Number.isFinite(price) || price <= 0 || price > 1000000) errors.push('price must be a positive number');
    if (errors.length) throw new BadRequestError(errors.join('; '), 'INVALID_MENU_ITEM');

    const priceInt = Math.round(price);
    const item = menuService.createItem({
      name: name.value,
      category: category.value,
      price: priceInt,
      tags: tags.value || '',
      available,
    });

    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) throw new BadRequestError('Invalid menu item id', 'INVALID_ID');

    const fields = {};
    if (req.body?.name !== undefined) {
      const v = sanitizeString(req.body.name, { maxLength: 100, required: true, label: 'name' });
      if (v.error) throw new BadRequestError(v.error, 'INVALID_NAME');
      fields.name = v.value;
    }
    if (req.body?.category !== undefined) {
      const v = sanitizeString(req.body.category, { maxLength: 50, required: true, label: 'category' });
      if (v.error) throw new BadRequestError(v.error, 'INVALID_CATEGORY');
      fields.category = v.value;
    }
    if (req.body?.price !== undefined) {
      const price = Number(req.body.price);
      if (!Number.isFinite(price) || price <= 0 || price > 1000000) {
        throw new BadRequestError('price must be a positive number', 'INVALID_PRICE');
      }
      fields.price = Math.round(price);
    }
    if (req.body?.tags !== undefined) {
      const v = sanitizeString(req.body.tags, { maxLength: 200 });
      if (v.error) throw new BadRequestError(v.error, 'INVALID_TAGS');
      fields.tags = v.value;
    }
    if (req.body?.available !== undefined) {
      fields.available = Boolean(req.body.available);
    }

    const item = menuService.updateItem(id, fields);
    res.json(item);
  } catch (err) {
    next(err);
  }
}

module.exports = { listPublic, listAdmin, create, update };
