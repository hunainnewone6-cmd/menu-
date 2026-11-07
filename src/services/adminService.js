const crypto = require('crypto');
const { getDb } = require('../db/connection');
const {
  hashPassword,
  verifyPassword,
  signAccessToken,
  signShortLivedToken,
} = require('../utils/auth');
const totp = require('../utils/totp');
const {
  UnauthorizedError,
  BadRequestError,
  ConflictError,
} = require('../utils/errors');

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

function getAdminByUsername(username) {
  const db = getDb();
  return db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
}

function getAdminById(id) {
  const db = getDb();
  return db.prepare('SELECT * FROM admins WHERE id = ?').get(id);
}

async function createAdmin({ username, password }) {
  if (!username || username.length < 3) throw new BadRequestError('username must be at least 3 characters');
  if (!password || password.length < 10) throw new BadRequestError('password must be at least 10 characters');

  const db = getDb();
  const existing = getAdminByUsername(username);
  if (existing) throw new ConflictError('Username already exists', 'USERNAME_EXISTS');

  const passwordHash = await hashPassword(password);
  const result = db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run(username, passwordHash);
  return getAdminById(result.lastInsertRowid);
}

async function startLogin({ username, password }) {
  const admin = getAdminByUsername(username);

  if (!admin) {
    await hashPassword(password);
    throw new UnauthorizedError('Invalid username or password', 'INVALID_CREDENTIALS');
  }

  if (admin.locked_until) {
    const lockedUntil = new Date(admin.locked_until).getTime();
    if (Date.now() < lockedUntil) {
      const minutes = Math.ceil((lockedUntil - Date.now()) / 60000);
      throw new UnauthorizedError(`Account locked. Try again in ${minutes} minute(s).`, 'ACCOUNT_LOCKED');
    } else {
      const db = getDb();
      db.prepare("UPDATE admins SET failed_login_attempts = 0, locked_until = NULL, updated_at = datetime('now') WHERE id = ?").run(admin.id);
      admin.failed_login_attempts = 0;
    }
  }

  const valid = await verifyPassword(password, admin.password_hash);
  if (!valid) {
    const attempts = admin.failed_login_attempts + 1;
    const db = getDb();
    if (attempts >= MAX_FAILED_ATTEMPTS) {
      const lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000).toISOString();
      db.prepare("UPDATE admins SET failed_login_attempts = ?, locked_until = ?, updated_at = datetime('now') WHERE id = ?")
        .run(attempts, lockedUntil, admin.id);
      throw new UnauthorizedError(`Too many failed attempts. Account locked for ${LOCKOUT_MINUTES} minutes.`, 'ACCOUNT_LOCKED');
    }
    db.prepare("UPDATE admins SET failed_login_attempts = ?, updated_at = datetime('now') WHERE id = ?").run(attempts, admin.id);
    throw new UnauthorizedError('Invalid username or password', 'INVALID_CREDENTIALS');
  }

  const db = getDb();
  db.prepare("UPDATE admins SET failed_login_attempts = 0, locked_until = NULL, updated_at = datetime('now') WHERE id = ?").run(admin.id);

  if (admin.totp_enabled) {
    const pendingToken = signShortLivedToken({ sub: admin.id, username: admin.username, type: '2fa-pending' }, '10m');
    return { requires2FA: true, pendingToken };
  }

  const token = signAccessToken({ sub: admin.id, username: admin.username, role: 'admin', type: 'access' });
  return { requires2FA: false, token };
}

async function complete2FA({ adminId, token, useBackupCode }) {
  const admin = getAdminById(adminId);
  if (!admin) throw new UnauthorizedError('Invalid session', 'INVALID_SESSION');
  if (!admin.totp_enabled) throw new BadRequestError('2FA is not enabled for this account', 'TOTP_NOT_ENABLED');

  if (useBackupCode) {
    const backupCodes = admin.backup_codes ? JSON.parse(admin.backup_codes) : [];
    const idx = totp.verifyBackupCode(token, backupCodes);
    if (idx === -1) throw new UnauthorizedError('Invalid backup code', 'INVALID_BACKUP_CODE');

    backupCodes.splice(idx, 1);
    const db = getDb();
    db.prepare("UPDATE admins SET backup_codes = ?, updated_at = datetime('now') WHERE id = ?")
      .run(JSON.stringify(backupCodes), adminId);
  } else {
    if (!totp.verifyToken(admin.totp_secret, token)) {
      throw new UnauthorizedError('Invalid authentication code', 'INVALID_TOTP');
    }
  }

  const accessToken = signAccessToken({ sub: admin.id, username: admin.username, role: 'admin', type: 'access' });
  return { token: accessToken };
}

async function enroll2FAStart(adminId) {
  const admin = getAdminById(adminId);
  if (!admin) throw new UnauthorizedError('Admin not found');
  if (admin.totp_enabled) throw new BadRequestError('2FA is already enabled', 'TOTP_ALREADY_ENABLED');

  const secret = totp.generateSecret();
  const db = getDb();
  db.prepare("UPDATE admins SET totp_secret = ?, updated_at = datetime('now') WHERE id = ?").run(secret, adminId);

  const otpAuthUrl = totp.getOtpAuthUrl(admin.username, secret);
  const qrCodeDataUrl = await totp.generateQrCodeDataUrl(otpAuthUrl);

  return { secret, qrCode: qrCodeDataUrl, otpAuthUrl };
}

async function enroll2FAConfirm(adminId, token) {
  const admin = getAdminById(adminId);
  if (!admin) throw new UnauthorizedError('Admin not found');
  if (!admin.totp_secret) throw new BadRequestError('Start enrollment first', 'TOTP_NOT_STARTED');
  if (admin.totp_enabled) throw new BadRequestError('2FA is already enabled', 'TOTP_ALREADY_ENABLED');

  if (!totp.verifyToken(admin.totp_secret, token)) {
    throw new UnauthorizedError('Invalid code. Try again.', 'INVALID_TOTP');
  }

  const backupCodes = totp.generateBackupCodes();
  const hashedCodes = backupCodes.map(totp.hashBackupCode);

  const db = getDb();
  db.prepare("UPDATE admins SET totp_enabled = 1, backup_codes = ?, updated_at = datetime('now') WHERE id = ?")
    .run(JSON.stringify(hashedCodes), adminId);

  return { backupCodes };
}

async function disable2FA(adminId, token) {
  const admin = getAdminById(adminId);
  if (!admin) throw new UnauthorizedError('Admin not found');
  if (!admin.totp_enabled) throw new BadRequestError('2FA is not enabled', 'TOTP_NOT_ENABLED');

  if (!totp.verifyToken(admin.totp_secret, token)) {
    throw new UnauthorizedError('Invalid code', 'INVALID_TOTP');
  }

  const db = getDb();
  db.prepare("UPDATE admins SET totp_enabled = 0, totp_secret = NULL, backup_codes = NULL, updated_at = datetime('now') WHERE id = ?")
    .run(adminId);

  return { disabled: true };
}

module.exports = {
  createAdmin,
  startLogin,
  complete2FA,
  enroll2FAStart,
  enroll2FAConfirm,
  disable2FA,
  getAdminByUsername,
  getAdminById,
};