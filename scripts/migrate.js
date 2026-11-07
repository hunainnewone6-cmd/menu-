require('dotenv').config();

const { migrate } = require('../src/db/migrate');
const { closeDb } = require('../src/db/connection');

migrate();
console.log('Migrations applied.');
closeDb();
