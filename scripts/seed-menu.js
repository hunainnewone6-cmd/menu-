require('dotenv').config();

const { migrate } = require('../src/db/migrate');
const { seedMenu } = require('../src/db/seed');
const { closeDb } = require('../src/db/connection');

migrate();
const count = seedMenu();
console.log(`Menu seed finished (${count} items present).`);
closeDb();
