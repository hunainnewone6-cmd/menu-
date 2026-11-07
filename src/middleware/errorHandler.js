const { AppError } = require('../utils/errors');

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = err.isOperational ? err.message : 'Internal server error';

  if (statusCode >= 500) {
    console.error(`[ERROR] ${req.method} ${req.originalUrl}`, {
      message: err.message,
      stack: err.stack,
    });
  }

  res.status(statusCode).json({ error: message, code });
}

function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });
}

module.exports = { errorHandler, notFoundHandler };
