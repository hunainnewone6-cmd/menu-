const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');
const config = require('../config');

let db;

function getDb() {
  if (db) return db;

  const dbPath = config.db.path;
  const isMemory = dbPath === ':memory:' || dbPath === '';

  if (!isMemory) {
    const resolved = path.resolve(dbPath);
    const dbDir = path.dirname(resolved);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
  }

  db = new DatabaseSync(dbPath);
  db.exec('PRAGMA foreign_keys = ON');
  db.exec('PRAGMA busy_timeout = 5000');
  if (!isMemory) {
    db.exec('PRAGMA journal_mode = WAL');
  }

  return db;
}

function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = { getDb, closeDb };