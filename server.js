require('dotenv').config();

const { createApp } = require('./src/app');
const { migrate } = require('./src/db/migrate');
const { seedMenu } = require('./src/db/seed');
const { closeDb } = require('./src/db/connection');
const config = require('./src/config');

migrate();
seedMenu();

const app = createApp();

const server = app.listen(config.port, () => {
  console.log(`[Karachi Bites] API listening on http://localhost:${config.port}`);
  console.log(`[Karachi Bites] Environment: ${config.nodeEnv}`);
});

function shutdown(signal) {
  console.log(`\n[Karachi Bites] Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    closeDb();
    process.exit(0);
  });
  setTimeout(() => {
    console.error('[Karachi Bites] Forced shutdown after timeout.');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  console.error('[Karachi Bites] Unhandled rejection:', reason);
});
