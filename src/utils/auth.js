const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config');

const BCRYPT_ROUNDS = 12;

function hashPassword(plain) {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

function signAccessToken(payload) {
  return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
}

function signShortLivedToken(payload, expiresIn = '10m') {
  return jwt.sign(payload, config.jwt.secret, { expiresIn });
}

function verifyToken(token) {
  return jwt.verify(token, config.jwt.secret);
}

function extractBearerToken(authHeader) {
  if (!authHeader || typeof authHeader !== 'string') return null;
  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token;
}

module.exports = {
  hashPassword,
  verifyPassword,
  signAccessToken,
  signShortLivedToken,
  verifyToken,
  extractBearerToken,
};