const { getDb } = require('../db/connection');
const { NotFoundError, BadRequestError } = require('../utils/errors');

function listPublicMenu() {
  const db = getDb();
  return db
    .prepare('SELECT id, name, category, price, tags, available FROM menu_items WHERE available = 1 ORDER BY category, name')
    .all()
    .map(formatMenuItem);
}

function listAdminMenu({ includeHidden = true } = {}) {
  const db = getDb();
  const sql = includeHidden
    ? 'SELECT id, name, category, price, tags, available, created_at, updated_at FROM menu_items ORDER BY category, name'
    : 'SELECT id, name, category, price, tags, available, created_at, updated_at FROM menu_items WHERE available = 1 ORDER BY category, name';
  return db.prepare(sql).all().map(formatMenuItem);
}

function getById(id) {
  const db = getDb();
  const row = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(id);
  if (!row) return null;
  return formatMenuItem(row);
}

function getByIds(ids) {
  if (!ids.length) return [];
  const db = getDb();
  const placeholders = ids.map(() => '?').join(',');
  const rows = db.prepare(`SELECT * FROM menu_items WHERE id IN (${placeholders})`).all(...ids);
  return rows.map(formatMenuItem);
}

function createItem({ name, category, price, tags = '', available = true }) {
  const db = getDb();
  const result = db
    .prepare('INSERT INTO menu_items (name, category, price, tags, available) VALUES (?, ?, ?, ?, ?)')
    .run(name, category, price, tags, available ? 1 : 0);
  return getById(result.lastInsertRowid);
}

function updateItem(id, fields) {
  const existing = getById(id);
  if (!existing) throw new NotFoundError('Menu item not found', 'MENU_ITEM_NOT_FOUND');

  const allowed = ['name', 'category', 'price', 'tags', 'available'];
  const updates = {};
  for (const key of allowed) {
    if (fields[key] !== undefined) updates[key] = fields[key];
  }
  if (Object.keys(updates).length === 0) {
    throw new BadRequestError('No valid fields to update', 'NO_FIELDS');
  }

  if (updates.available !== undefined) {
    updates.available = updates.available ? 1 : 0;
  }

  const setClauses = Object.keys(updates)
    .map((k) => `${k} = ?`)
    .join(', ');
  const values = Object.values(updates);

  const db = getDb();
  db.prepare(`UPDATE menu_items SET ${setClauses}, updated_at = datetime('now') WHERE id = ?`).run(...values, id);
  return getById(id);
}

function formatMenuItem(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: row.price,
    tags: typeof row.tags === 'string' ? row.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    available: Boolean(row.available),
    ...(row.created_at && { createdAt: row.created_at }),
    ...(row.updated_at && { updatedAt: row.updated_at }),
  };
}

module.exports = { listPublicMenu, listAdminMenu, getById, getByIds, createItem, updateItem };
