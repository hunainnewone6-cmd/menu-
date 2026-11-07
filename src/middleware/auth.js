const { extractBearerToken, verifyToken } = require('../utils/auth');
const { UnauthorizedError } = require('../utils/errors');

function requireAdmin(req, res, next) {
  const token = extractBearerToken(req.headers.authorization);
  if (!token) {
    return next(new UnauthorizedError('Missing or invalid Authorization header', 'MISSING_TOKEN'));
  }

  try {
    const payload = verifyToken(token);
    if (payload.type !== 'access' || payload.role !== 'admin') {
      return next(new UnauthorizedError('Invalid token', 'INVALID_TOKEN'));
    }
    req.admin = { id: payload.sub, username: payload.username };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Token expired', 'TOKEN_EXPIRED'));
    }
    return next(new UnauthorizedError('Invalid token', 'INVALID_TOKEN'));
  }
}

module.exports = { requireAdmin };
