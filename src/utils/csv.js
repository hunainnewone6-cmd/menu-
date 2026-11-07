const { stringify } = require('csv-stringify/sync');

// Prevent spreadsheet formula injection: a cell value starting with one of
// these characters can be interpreted as a formula by Excel/Google Sheets.
// Prefix such values with a single quote so they are treated as text.
const FORMULA_PREFIXES = ['=', '+', '-', '@'];

function sanitizeCsvCell(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (FORMULA_PREFIXES.includes(str.charAt(0))) {
    return `'${str}`;
  }
  return str;
}

function ordersToCsv(orders) {
  const rows = [];
  for (const order of orders) {
    const itemsSummary = (order.items || [])
      .map((it) => `${it.name} x${it.quantity}`)
      .join('; ');
    rows.push({
      order_id: order.id,
      customer_name: sanitizeCsvCell(order.customer_name),
      mobile: sanitizeCsvCell(order.mobile),
      address: sanitizeCsvCell(order.address),
      branch: sanitizeCsvCell(order.branch),
      items: sanitizeCsvCell(itemsSummary),
      subtotal: order.subtotal,
      delivery_charge: order.delivery_charge,
      total: order.total,
      status: order.status,
      created_at: order.created_at,
    });
  }

  return stringify(rows, {
    header: true,
    columns: [
      'order_id',
      'customer_name',
      'mobile',
      'address',
      'branch',
      'items',
      'subtotal',
      'delivery_charge',
      'total',
      'status',
      'created_at',
    ],
  });
}

module.exports = { ordersToCsv, sanitizeCsvCell };
