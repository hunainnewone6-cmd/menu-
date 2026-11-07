const adminService = require('../services/adminService');
const { verifyToken, extractBearerToken } = require('../utils/auth');
const { BadRequestError, UnauthorizedError } = require('../utils/errors');

async function login(req, res, next) {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      throw new BadRequestError('username and password are required', 'MISSING_CREDENTIALS');
    }
    const result = await adminService.startLogin({ username, password });

    if (result.requires2FA) {
      return res.status(202).json({
        requires2FA: true,
        pendingToken: result.pendingToken,
        message: '2FA verification required',
      });
    }
    res.json({ token: result.token });
  } catch (err) {
    next(err);
  }
}

async function verify2FA(req, res, next) {
  try {
    const pendingToken = extractBearerToken(req.headers.authorization);
    if (!pendingToken) throw new UnauthorizedError('Missing pending token', 'MISSING_TOKEN');

    let payload;
    try {
      payload = verifyToken(pendingToken);
    } catch (err) {
      throw new UnauthorizedError('Invalid or expired pending token', 'INVALID_PENDING_TOKEN');
    }
    if (payload.type !== '2fa-pending') {
      throw new UnauthorizedError('Invalid pending token type', 'INVALID_PENDING_TOKEN');
    }

    const token = req.body?.token;
    if (!token || typeof token !== 'string') {
      throw new BadRequestError('token is required', 'MISSING_TOTP');
    }

    const result = await adminService.complete2FA({
      adminId: payload.sub,
      token: token.trim(),
      useBackupCode: Boolean(req.body?.useBackupCode),
    });

    res.json({ token: result.token });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    res.json({ id: req.admin.id, username: req.admin.username });
  } catch (err) {
    next(err);
  }
}

async function enrollStart(req, res, next) {
  try {
    const result = await adminService.enroll2FAStart(req.admin.id);
    res.json({
      secret: result.secret,
      qrCode: result.qrCode,
      otpAuthUrl: result.otpAuthUrl,
    });
  } catch (err) {
    next(err);
  }
}

async function enrollConfirm(req, res, next) {
  try {
    const token = req.body?.token;
    if (!token || typeof token !== 'string') {
      throw new BadRequestError('token is required', 'MISSING_TOTP');
    }
    const result = await adminService.enroll2FAConfirm(req.admin.id, token.trim());
    res.json({
      message: '2FA enabled successfully',
      backupCodes: result.backupCodes,
    });
  } catch (err) {
    next(err);
  }
}

async function disable(req, res, next) {
  try {
    const token = req.body?.token;
    if (!token || typeof token !== 'string') {
      throw new BadRequestError('token is required', 'MISSING_TOTP');
    }
    await adminService.disable2FA(req.admin.id, token.trim());
    res.json({ message: '2FA disabled' });
  } catch (err) {
    next(err);
  }
}

module.exports = { login, verify2FA, me, enrollStart, enrollConfirm, disable };
