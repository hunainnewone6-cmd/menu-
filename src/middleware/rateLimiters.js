const rateLimit = require('express-rate-limit');

// In test mode, skip rate limiters so multiple test files running in the same
// process do not trip each other's limits. The business logic is tested
// separately (account lockout, etc.) without the HTTP rate-layer noise.
const noop = (req, res, next) => next();

function limiter(fn) {
  return process.env.NODE_ENV === 'test' ? noop : fn;
}

const loginLimiter = limiter(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Try again later.', code: 'RATE_LIMITED' },
  keyGenerator: (req) => req.ip + ':' + (req.body?.username || ''),
}));

const totpLimiter = limiter(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many 2FA attempts. Try again later.', code: 'RATE_LIMITED' },
}));

const orderLimiter = limiter(rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many orders from this IP. Try again later.', code: 'RATE_LIMITED' },
  keyGenerator: (req) => req.ip,
}));

const generalLimiter = limiter(rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Slow down.', code: 'RATE_LIMITED' },
}));

const trackingLimiter = limiter(rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many tracking requests. Try again later.', code: 'RATE_LIMITED' },
}));

module.exports = { loginLimiter, totpLimiter, orderLimiter, generalLimiter, trackingLimiter };
