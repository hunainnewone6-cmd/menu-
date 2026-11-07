const { authenticator } = require('otplib');
const QRCode = require('qrcode');
const crypto = require('crypto');
const config = require('../config');

authenticator.options = {
  window: 1,
  step: 30,
};

function generateSecret() {
  return authenticator.generateSecret();
}

function verifyToken(secret, token) {
  if (!secret || !token) return false;
  try {
    return authenticator.verify({ token, secret });
  } catch {
    return false;
  }
}

function getOtpAuthUrl(username, secret) {
  return authenticator.keyuri(username, config.totp.issuer, secret);
}

async function generateQrCodeDataUrl(otpAuthUrl) {
  return QRCode.toDataURL(otpAuthUrl, { width: 256, margin: 1 });
}

function generateBackupCodes(count = 8) {
  const codes = [];
  for (let i = 0; i < count; i++) {
    codes.push(crypto.randomBytes(4).toString('hex'));
  }
  return codes;
}

function hashBackupCode(code) {
  return crypto.createHash('sha256').update(code.toLowerCase().trim()).digest('hex');
}

function verifyBackupCode(code, hashedCodes) {
  const hashed = hashBackupCode(code);
  const idx = hashedCodes.indexOf(hashed);
  return idx >= 0 ? idx : -1;
}

module.exports = {
  authenticator,
  generateSecret,
  verifyToken,
  getOtpAuthUrl,
  generateQrCodeDataUrl,
  generateBackupCodes,
  hashBackupCode,
  verifyBackupCode,
};
