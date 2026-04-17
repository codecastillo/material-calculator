/**
 * Seed script — run with: npm run seed
 *
 * Creates a default user and populates suppliers, categories, and materials
 * matching the frontend defaults.
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });

const bcrypt = require('bcryptjs');
const path = require('path');

// Set DB_PATH before requiring database so it resolves correctly
if (!process.env.DB_PATH) {
  process.env.DB_PATH = './data/calculator.db';
}

const db = require('./database');

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------
function getOrCreateUser(email, password, name) {
  const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (existing) {
    console.log(`  User "${email}" already exists (id=${existing.id}), skipping.`);
    return existing;
  }
  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare(
    'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)'
  ).run(email, hash, name);
  console.log(`  Created user "${email}" (id=${result.lastInsertRowid})`);
  return { id: result.lastInsertRowid, email, name };
}

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------
function seed() {
  console.log('Seeding database...\n');

  // 1. Default user
  console.log('[Users]');
  const user = getOrCreateUser('admin@example.com', 'password123', 'Admin');
  const userId = user.id;

  // 2. Categories
  console.log('\n[Categories]');
  const categoryNames = ['Lath', 'Gray Coat', 'Color Coat', 'Stone', 'Drywall', 'Painting'];
  const categoryMap = {};

  const insertCat = db.prepare(
    'INSERT INTO categories (name, user_id, sort_order) VALUES (?, ?, ?)'
  );
  const findCat = db.prepare(
    'SELECT * FROM categories WHERE name = ? AND user_id = ?'
  );

  categoryNames.forEach((name, idx) => {
    let cat = findCat.get(name, userId);
    if (cat) {
      console.log(`  Category "${name}" already exists (id=${cat.id}), skipping.`);
    } else {
      const result = insertCat.run(name, userId, idx + 1);
      cat = { id: result.lastInsertRowid, name };
      console.log(`  Created category "${name}" (id=${cat.id})`);
    }
    categoryMap[name] = cat.id;
  });

  // 3. Suppliers
  console.log('\n[Suppliers]');
  const supplierDefs = [
    { name: 'Pacific Supply', categories: ['Lath', 'Gray Coat', 'Color Coat', 'Stone', 'Drywall'] },
    { name: 'ABC Supply', categories: ['Lath', 'Gray Coat', 'Color Coat', 'Stone', 'Drywall'] },
    { name: 'Sherwin Williams', categories: ['Drywall', 'Painting'] },
  ];

  const insertSupplier = db.prepare(
    'INSERT INTO suppliers (name, user_id) VALUES (?, ?)'
  );
  const findSupplier = db.prepare(
    'SELECT * FROM suppliers WHERE name = ? AND user_id = ?'
  );
  const insertSC = db.prepare(
    'INSERT OR IGNORE INTO supplier_categories (supplier_id, category_id) VALUES (?, ?)'
  );

  const supplierMap = {};

  for (const def of supplierDefs) {
    let supplier = findSupplier.get(def.name, userId);
    if (supplier) {
      console.log(`  Supplier "${def.name}" already exists (id=${supplier.id}), skipping.`);
    } else {
      const result = insertSupplier.run(def.name, userId);
      supplier = { id: result.lastInsertRowid, name: def.name };
      console.log(`  Created supplier "${def.name}" (id=${supplier.id})`);
    }
    supplierMap[def.name] = supplier.id;

    // Link categories
    for (const catName of def.categories) {
      insertSC.run(supplier.id, categoryMap[catName]);
    }
  }

  // 4. Materials
  console.log('\n[Materials]');

  // Base materials for Pacific Supply
  const baseMaterials = [
    // Lath
    { name: '2.5 LB Diamond Lath', sku: 'PS-LATH-001', unit: 'sheet', price: 4.50, category: 'Lath', coverage: 2.5, calc_type: 'sqft', sort: 1 },
    { name: '3.4 LB Diamond Lath', sku: 'PS-LATH-002', unit: 'sheet', price: 6.75, category: 'Lath', coverage: 2.5, calc_type: 'sqft', sort: 2 },
    { name: 'Galv Furring Nails (50lb)', sku: 'PS-LATH-003', unit: 'box', price: 85.00, category: 'Lath', coverage: 1000, calc_type: 'sqft', sort: 3 },
    { name: 'Self-Furring Nails (50lb)', sku: 'PS-LATH-004', unit: 'box', price: 78.00, category: 'Lath', coverage: 1000, calc_type: 'sqft', sort: 4 },
    { name: 'Weep Screed 10ft', sku: 'PS-LATH-005', unit: 'stick', price: 5.25, category: 'Lath', coverage: 10, calc_type: 'linear_ft', sort: 5 },
    { name: 'Corner Aid 10ft', sku: 'PS-LATH-006', unit: 'stick', price: 4.50, category: 'Lath', coverage: 10, calc_type: 'linear_ft', sort: 6 },
    { name: 'Casing Bead 10ft', sku: 'PS-LATH-007', unit: 'stick', price: 3.75, category: 'Lath', coverage: 10, calc_type: 'linear_ft', sort: 7 },
    { name: '60 Minute Paper (2 roll)', sku: 'PS-LATH-008', unit: 'roll', price: 65.00, category: 'Lath', coverage: 400, calc_type: 'sqft', sort: 8 },
    { name: '17# Felt Paper', sku: 'PS-LATH-009', unit: 'roll', price: 28.00, category: 'Lath', coverage: 400, calc_type: 'sqft', sort: 9 },

    // Gray Coat
    { name: 'Portland Cement (94lb)', sku: 'PS-GRAY-001', unit: 'bag', price: 14.50, category: 'Gray Coat', coverage: 35, calc_type: 'sqft', sort: 1 },
    { name: 'Plaster Sand (ton)', sku: 'PS-GRAY-002', unit: 'ton', price: 45.00, category: 'Gray Coat', coverage: 200, calc_type: 'sqft', sort: 2 },
    { name: 'Lime Putty (50lb)', sku: 'PS-GRAY-003', unit: 'bag', price: 12.00, category: 'Gray Coat', coverage: 100, calc_type: 'sqft', sort: 3 },
    { name: 'Fibermesh (1lb bag)', sku: 'PS-GRAY-004', unit: 'bag', price: 8.50, category: 'Gray Coat', coverage: 300, calc_type: 'sqft', sort: 4 },

    // Color Coat
    { name: 'Omega One Coat Stucco', sku: 'PS-CLR-001', unit: 'bag', price: 22.00, category: 'Color Coat', coverage: 60, calc_type: 'sqft', sort: 1 },
    { name: 'LaHabra Color Pack', sku: 'PS-CLR-002', unit: 'bag', price: 18.50, category: 'Color Coat', coverage: 55, calc_type: 'sqft', sort: 2 },
    { name: 'LaHabra Float', sku: 'PS-CLR-003', unit: 'bag', price: 19.00, category: 'Color Coat', coverage: 55, calc_type: 'sqft', sort: 3 },

    // Stone
    { name: 'Cultured Stone Veneer', sku: 'PS-STN-001', unit: 'sqft', price: 8.50, category: 'Stone', coverage: 1, calc_type: 'sqft', sort: 1 },
    { name: 'Stone Mortar (80lb)', sku: 'PS-STN-002', unit: 'bag', price: 11.00, category: 'Stone', coverage: 40, calc_type: 'sqft', sort: 2 },
    { name: 'Stone Grout (50lb)', sku: 'PS-STN-003', unit: 'bag', price: 9.50, category: 'Stone', coverage: 50, calc_type: 'sqft', sort: 3 },

    // Drywall
    { name: 'USG Sheetrock 4x8 1/2"', sku: 'PS-DW-001', unit: 'sheet', price: 12.50, category: 'Drywall', coverage: 32, calc_type: 'sqft', sort: 1 },
    { name: 'USG Sheetrock 4x12 1/2"', sku: 'PS-DW-002', unit: 'sheet', price: 18.75, category: 'Drywall', coverage: 48, calc_type: 'sqft', sort: 2 },
    { name: 'Joint Compound (5 gal)', sku: 'PS-DW-003', unit: 'bucket', price: 16.00, category: 'Drywall', coverage: 300, calc_type: 'sqft', sort: 3 },
    { name: 'Paper Tape (500ft)', sku: 'PS-DW-004', unit: 'roll', price: 5.50, category: 'Drywall', coverage: 500, calc_type: 'linear_ft', sort: 4 },
    { name: 'Drywall Screws (1lb)', sku: 'PS-DW-005', unit: 'box', price: 8.00, category: 'Drywall', coverage: 100, calc_type: 'sqft', sort: 5 },
  ];

  const insertMaterial = db.prepare(`
    INSERT INTO materials (supplier_id, name, sku, unit, price_per_unit, category_id, coverage_per_unit, calc_type, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const findMaterial = db.prepare(
    'SELECT id FROM materials WHERE supplier_id = ? AND name = ?'
  );

  let created = 0;
  let skipped = 0;

  // Pacific Supply materials
  const pacificId = supplierMap['Pacific Supply'];
  for (const mat of baseMaterials) {
    const existing = findMaterial.get(pacificId, mat.name);
    if (existing) {
      skipped++;
      continue;
    }
    insertMaterial.run(pacificId, mat.name, mat.sku, mat.unit, mat.price, categoryMap[mat.category], mat.coverage, mat.calc_type, mat.sort);
    created++;
  }
  console.log(`  Pacific Supply: ${created} created, ${skipped} skipped`);

  // ABC Supply materials (same items, 1.03x price, different SKU prefix)
  created = 0;
  skipped = 0;
  const abcId = supplierMap['ABC Supply'];
  for (const mat of baseMaterials) {
    const existing = findMaterial.get(abcId, mat.name);
    if (existing) {
      skipped++;
      continue;
    }
    const abcSku = mat.sku.replace('PS-', 'ABC-');
    const abcPrice = +(mat.price * 1.03).toFixed(2);
    insertMaterial.run(abcId, mat.name, abcSku, mat.unit, abcPrice, categoryMap[mat.category], mat.coverage, mat.calc_type, mat.sort);
    created++;
  }
  console.log(`  ABC Supply: ${created} created, ${skipped} skipped`);

  // Sherwin Williams materials (Drywall + Painting only)
  created = 0;
  skipped = 0;
  const swId = supplierMap['Sherwin Williams'];

  const swMaterials = [
    // Drywall
    { name: 'USG Sheetrock 4x8 1/2"', sku: 'SW-DW-001', unit: 'sheet', price: 12.50, category: 'Drywall', coverage: 32, calc_type: 'sqft', sort: 1 },
    { name: 'USG Sheetrock 4x12 1/2"', sku: 'SW-DW-002', unit: 'sheet', price: 18.75, category: 'Drywall', coverage: 48, calc_type: 'sqft', sort: 2 },
    { name: 'Joint Compound (5 gal)', sku: 'SW-DW-003', unit: 'bucket', price: 16.00, category: 'Drywall', coverage: 300, calc_type: 'sqft', sort: 3 },
    { name: 'Paper Tape (500ft)', sku: 'SW-DW-004', unit: 'roll', price: 5.50, category: 'Drywall', coverage: 500, calc_type: 'linear_ft', sort: 4 },
    { name: 'Drywall Screws (1lb)', sku: 'SW-DW-005', unit: 'box', price: 8.00, category: 'Drywall', coverage: 100, calc_type: 'sqft', sort: 5 },

    // Painting
    { name: 'Duration Exterior Latex', sku: 'SW-PT-001', unit: 'gallon', price: 72.00, category: 'Painting', coverage: 350, calc_type: 'sqft', sort: 1 },
    { name: 'SuperPaint Interior Latex', sku: 'SW-PT-002', unit: 'gallon', price: 62.00, category: 'Painting', coverage: 400, calc_type: 'sqft', sort: 2 },
    { name: 'PrimeRx Primer', sku: 'SW-PT-003', unit: 'gallon', price: 48.00, category: 'Painting', coverage: 400, calc_type: 'sqft', sort: 3 },
    { name: 'Caulk Paintable (10oz)', sku: 'SW-PT-004', unit: 'tube', price: 6.50, category: 'Painting', coverage: 25, calc_type: 'linear_ft', sort: 4 },
    { name: 'Painters Tape 1.5" (60yd)', sku: 'SW-PT-005', unit: 'roll', price: 7.50, category: 'Painting', coverage: 180, calc_type: 'linear_ft', sort: 5 },
    { name: 'Drop Cloth 9x12', sku: 'SW-PT-006', unit: 'each', price: 15.00, category: 'Painting', coverage: 0, calc_type: 'fixed', sort: 6 },
    { name: 'Roller Covers 9" (3pk)', sku: 'SW-PT-007', unit: 'pack', price: 18.00, category: 'Painting', coverage: 0, calc_type: 'fixed', sort: 7 },
  ];

  for (const mat of swMaterials) {
    const existing = findMaterial.get(swId, mat.name);
    if (existing) {
      skipped++;
      continue;
    }
    insertMaterial.run(swId, mat.name, mat.sku, mat.unit, mat.price, categoryMap[mat.category], mat.coverage, mat.calc_type, mat.sort);
    created++;
  }
  console.log(`  Sherwin Williams: ${created} created, ${skipped} skipped`);

  console.log('\nSeed complete!');
  console.log('Login with: admin@example.com / password123');
}

seed();
