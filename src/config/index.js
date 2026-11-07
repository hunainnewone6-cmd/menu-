require('dotenv').config();

const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5500',

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-me-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },

  admin: {
    username: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD,
  },

  totp: {
    issuer: process.env.TOTP_ISSUER || 'KarachiBites',
  },

  delivery: {
    charge: parseInt(process.env.DELIVERY_CHARGE || '150', 10),
  },

  db: {
    path: process.env.DB_PATH || './data/karachi-bites.db',
  },

  branches: ['Clifton', 'Gulshan-e-Iqbal', 'North Nazimabad'],

  orderStatuses: ['Received', 'Preparing', 'Out for Delivery', 'Delivered'],
};

if (config.nodeEnv === 'production' && config.jwt.secret === 'dev-secret-change-me-in-production') {
  console.warn('WARNING: JWT_SECRET is not set. Using default is unsafe in production.');
}

module.exports = config;
