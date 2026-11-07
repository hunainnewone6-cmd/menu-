require('dotenv').config();

const readline = require('readline');
const { migrate } = require('../src/db/migrate');
const { closeDb } = require('../src/db/connection');
const adminService = require('../src/services/adminService');
const config = require('../src/config');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

async function main() {
  migrate();

  let username = config.admin.username;
  let password = config.admin.password;

  if (!username) username = await ask('Admin username: ');
  if (!password) password = await ask('Admin password (min 10 chars): ');

  try {
    const admin = await adminService.createAdmin({ username, password });
    console.log(`Admin "${admin.username}" created (id=${admin.id}).`);
    console.log('\nNext step: log in at POST /api/auth/login, then enable 2FA:');
    console.log('  POST /api/auth/2fa/enroll  (with the Bearer token)');
    console.log('  POST /api/auth/2fa/confirm  (with a 6-digit code from your authenticator app)');
    console.log('Save the backup codes printed after confirmation in a safe place.');
  } catch (err) {
    console.error('Setup failed:', err.message);
    process.exitCode = 1;
  } finally {
    rl.close();
    closeDb();
  }
}

main();
