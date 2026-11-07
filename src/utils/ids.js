const crypto = require('crypto');

function generateOrderId() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `KB-${ts}-${rand}`;
}

module.exports = { generateOrderId };
