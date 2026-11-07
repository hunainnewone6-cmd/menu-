const { getDb } = require('./connection');

// Exact assignment seed menu (Karachi Bites Student Brief).
// IDs, names, categories, prices and tags are fixed and must not change.
const REQUIRED_MENU = [
  { id: 1,  name: 'Chicken Malai Boti',     category: 'BBQ',     price: 850,  tags: 'mild' },
  { id: 2,  name: 'Beef Seekh Kebab',      category: 'BBQ',     price: 780,  tags: 'spicy' },
  { id: 3,  name: 'Mutton Karahi (half)',  category: 'Karahi', price: 1650, tags: 'spicy' },
  { id: 4,  name: 'Chicken Karahi (half)',  category: 'Karahi', price: 1250, tags: 'spicy' },
  { id: 5,  name: 'Chicken Biryani',        category: 'Rice',    price: 550,  tags: 'spicy' },
  { id: 6,  name: 'Vegetable Pulao',        category: 'Rice',    price: 420,  tags: 'veg' },
  { id: 7,  name: 'Zinger Paratha Roll',    category: 'Rolls',   price: 450,  tags: 'spicy' },
  { id: 8,  name: 'Paneer Tikka Roll',      category: 'Rolls',   price: 480,  tags: 'veg' },
  { id: 9,  name: 'Mint Margarita',         category: 'Drinks',  price: 220,  tags: 'veg' },
  { id: 10, name: 'Doodh Patti Chai',       category: 'Drinks',  price: 150,  tags: 'veg' },
  { id: 11, name: 'Gulab Jamun (2 pcs)',    category: 'Desserts', price: 250, tags: 'veg' },
  { id: 12, name: 'Kheer',                  category: 'Desserts', price: 300, tags: 'veg' },
];

const SEED_VERSION = '2026-karachi-bites-v1';

function currentSeedVersion(db) {
  const row = db.prepare("SELECT value FROM meta WHERE key = 'seed_version'").get();
  return row ? row.value : null;
}

function seedMenu() {
  const db = getDb();
  const version = currentSeedVersion(db);

  if (version === SEED_VERSION) {
    console.log(`Seed already applied (${SEED_VERSION}). Skipping seed.`);
    return REQUIRED_MENU.length;
  }

  const stmt = db.prepare(`
    INSERT INTO menu_items (id, name, category, price, tags, available)
    VALUES (?, ?, ?, ?, ?, 1)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      category = excluded.category,
      price = excluded.price,
      tags = excluded.tags,
      available = 1,
      updated_at = datetime('now')
  `);

  db.exec('BEGIN');
  try {
    for (const item of REQUIRED_MENU) {
      stmt.run(item.id, item.name, item.category, item.price, item.tags);
    }
    db.prepare(
      "INSERT INTO meta (key, value) VALUES ('seed_version', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
    ).run(SEED_VERSION);
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  console.log(`Seeded ${REQUIRED_MENU.length} menu items (${SEED_VERSION}).`);
  return REQUIRED_MENU.length;
}

module.exports = { seedMenu, REQUIRED_MENU, SEED_VERSION };