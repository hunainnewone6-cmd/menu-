const config = require('../config');

const PAKISTANI_MOBILE_REGEX = /^(\+92|0)?3[0-9]{2}[ -]?[0-9]{7}$/;

function normalizeMobile(raw) {
  if (typeof raw !== 'string') return null;
  const digits = raw.replace(/[\s\-()]/g, '');
  if (!PAKISTANI_MOBILE_REGEX.test(digits)) return null;

  let normalized = digits;
  if (normalized.startsWith('+92')) normalized = '0' + normalized.slice(3);
  else if (normalized.startsWith('92')) normalized = '0' + normalized.slice(2);
  else if (!normalized.startsWith('0')) normalized = '0' + normalized;

  return normalized;
}

function sanitizeString(str, { maxLength = 200, required = false, label = 'field' } = {}) {
  if (str === undefined || str === null || str === '') {
    if (required) return { error: `${label} is required` };
    return { value: '' };
  }
  if (typeof str !== 'string') return { error: `${label} must be a string` };
  const trimmed = str.trim().slice(0, maxLength);
  if (required && trimmed.length === 0) return { error: `${label} is required` };
  return { value: trimmed };
}

function validateOrderPayload(body) {
  const errors = [];

  // Accept either the flat shape (customerName/mobile/address) used by the
  // existing contract, or the nested shape (customer: {name, phone, address})
  // documented in the assignment. Both are normalized to flat fields here.
  const customer = body?.customer && typeof body.customer === 'object' ? body.customer : {};
  const name = sanitizeString(body?.customerName ?? customer.name, { maxLength: 80, required: true, label: 'customerName' });
  if (name.error) errors.push(name.error);

  const mobile = normalizeMobile(body?.mobile ?? customer.phone);
  if (!mobile) errors.push('mobile must be a valid Pakistani mobile number');

  const address = sanitizeString(body?.address ?? customer.address, { maxLength: 300, required: true, label: 'address' });
  if (address.error) errors.push(address.error);

  const notes = sanitizeString(body?.notes, { maxLength: 500, label: 'notes' });

  const branch = typeof body?.branch === 'string' ? body.branch.trim() : '';
  if (!config.branches.includes(branch)) {
    errors.push(`branch must be one of: ${config.branches.join(', ')}`);
  }

  const items = Array.isArray(body?.items) ? body.items : null;
  if (!items || items.length === 0) {
    errors.push('items must be a non-empty array');
  }

  return {
    errors,
    data: errors.length === 0
      ? {
          customerName: name.value,
          mobile,
          address: address.value,
          branch,
          notes: notes.value || null,
          items,
        }
      : null,
  };
}

function validateOrderItem(item) {
  const errors = [];
  const menuItemId = Number(item?.menuItemId);
  if (!Number.isInteger(menuItemId) || menuItemId <= 0) {
    errors.push('menuItemId must be a positive integer');
  }
  const quantity = Number(item?.quantity);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 50) {
    errors.push('quantity must be an integer between 1 and 50');
  }
  return { errors, data: errors.length === 0 ? { menuItemId, quantity } : null };
}

function validateStatusTransition(current, next) {
  const order = config.orderStatuses;
  const currentIdx = order.indexOf(current);
  const nextIdx = order.indexOf(next);

  if (nextIdx === -1) {
    return { valid: false, error: `status must be one of: ${order.join(', ')}` };
  }
  if (nextIdx !== currentIdx + 1) {
    return {
      valid: false,
      error: `cannot transition from "${current}" to "${next}". Allowed next status: "${order[currentIdx + 1] || '(none — already Delivered)'}"`,
    };
  }
  return { valid: true };
}

module.exports = {
  normalizeMobile,
  sanitizeString,
  validateOrderPayload,
  validateOrderItem,
  validateStatusTransition,
};
