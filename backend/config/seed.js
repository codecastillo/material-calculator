require('dotenv').config();
const supabase = require('./database');
const bcrypt = require('bcryptjs');

async function seed() {
  console.log('Seeding Supabase database...\n');

  // 1. Create default user
  const seedPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!seedPassword) { console.error('Set SEED_ADMIN_PASSWORD env var before seeding'); return; }
  const hash = bcrypt.hashSync(seedPassword, 10);
  const seedEmail = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
  const { data: existingUser } = await supabase.from('users').select('id').eq('email', seedEmail).single();

  let userId;
  if (existingUser) {
    userId = existingUser.id;
    console.log(`[Users] User already exists (id=${userId})`);
  } else {
    const { data: newUser, error } = await supabase.from('users').insert({ email: seedEmail, password_hash: hash, name: 'Admin' }).select('id').single();
    if (error) { console.error('User create error:', error.message); return; }
    userId = newUser.id;
    console.log(`[Users] Created admin (id=${userId})`);
  }

  // 2. Create categories
  const categoryNames = ['Lath', 'Gray Coat', 'Color Coat', 'Stone', 'Drywall', 'Painting'];
  const categoryMap = {};

  for (let i = 0; i < categoryNames.length; i++) {
    const name = categoryNames[i];
    const { data: existing } = await supabase.from('categories').select('id').eq('name', name).eq('user_id', userId).single();
    if (existing) {
      categoryMap[name] = existing.id;
      console.log(`[Categories] "${name}" exists (id=${existing.id})`);
    } else {
      const { data: cat, error } = await supabase.from('categories').insert({ name, user_id: userId, sort_order: i + 1 }).select('id').single();
      if (error) { console.error(`Category "${name}" error:`, error.message); continue; }
      categoryMap[name] = cat.id;
      console.log(`[Categories] Created "${name}" (id=${cat.id})`);
    }
  }

  // 3. Create suppliers
  const supplierConfigs = [
    { name: 'Pacific Supply', categories: ['Lath', 'Gray Coat', 'Color Coat', 'Stone', 'Drywall'] },
    { name: 'ABC Supply', categories: ['Lath', 'Gray Coat', 'Color Coat', 'Stone', 'Drywall'] },
    { name: 'Sherwin Williams', categories: ['Painting'] },
  ];
  const supplierMap = {};

  for (const sc of supplierConfigs) {
    const { data: existing } = await supabase.from('suppliers').select('id').eq('name', sc.name).eq('user_id', userId).single();
    let supId;
    if (existing) {
      supId = existing.id;
      console.log(`[Suppliers] "${sc.name}" exists (id=${supId})`);
    } else {
      const { data: sup, error } = await supabase.from('suppliers').insert({ name: sc.name, user_id: userId }).select('id').single();
      if (error) { console.error(`Supplier "${sc.name}" error:`, error.message); continue; }
      supId = sup.id;
      console.log(`[Suppliers] Created "${sc.name}" (id=${supId})`);
    }
    supplierMap[sc.name] = supId;

    // Link categories
    for (const catName of sc.categories) {
      const catId = categoryMap[catName];
      if (!catId) continue;
      await supabase.from('supplier_categories').upsert({ supplier_id: supId, category_id: catId });
    }
  }

  // 4. Seed materials
  const pacificId = supplierMap['Pacific Supply'];
  const abcId = supplierMap['ABC Supply'];
  const swId = supplierMap['Sherwin Williams'];

  const allMaterials = [
    // Pacific Supply + ABC Supply materials
    ...[
      { name: 'Wire Lath 2.5 lb (36" x 150\')', sku: 'WL-2536150', unit: 'roll', price: 52, category: 'Lath', coverage: 450, calc_type: 'sqft' },
      { name: '2-Ply 60min Paper (150 sqft)', sku: 'PB-2P60-150', unit: 'roll', price: 28, category: 'Lath', coverage: 150, calc_type: 'sqft' },
      { name: '7/16" Staples (10,000ct)', sku: 'ST-716-10K', unit: 'box', price: 45, category: 'Lath', coverage: 2000, calc_type: 'sqft' },
      { name: 'Weep Screed 26ga (10\')', sku: 'WS-26-10', unit: 'piece', price: 8.50, category: 'Lath', coverage: 10, calc_type: 'linear_ft' },
      { name: 'Corner Aid 26ga (10\')', sku: 'CA-26-10', unit: 'piece', price: 6.75, category: 'Lath', coverage: 10, calc_type: 'linear_ft' },
      { name: 'Casing Bead 26ga (10\')', sku: 'CB-26-10', unit: 'piece', price: 5.50, category: 'Lath', coverage: 10, calc_type: 'linear_ft' },
      { name: 'Self-Furring Nails 1.5" (25lb)', sku: 'SFN-15-25', unit: 'box', price: 42, category: 'Lath', coverage: 1500, calc_type: 'sqft' },
      { name: 'Portland Cement Type S (94lb)', sku: 'PC-TS-94', unit: 'bag', price: 14.50, category: 'Gray Coat', coverage: 25, calc_type: 'sqft' },
      { name: 'Plaster Sand', sku: 'PS-TON', unit: 'ton', price: 45, category: 'Gray Coat', coverage: 250, calc_type: 'sqft' },
      { name: 'Hydrated Lime Type S (50lb)', sku: 'HL-TS-50', unit: 'bag', price: 12, category: 'Gray Coat', coverage: 75, calc_type: 'sqft' },
      { name: 'Fiber Mesh (1lb)', sku: 'FM-1LB', unit: 'bag', price: 8.50, category: 'Gray Coat', coverage: 300, calc_type: 'sqft' },
      { name: 'Bonding Agent - Weld-Crete (5 gal)', sku: 'BA-WC-5G', unit: 'pail', price: 62, category: 'Gray Coat', coverage: 500, calc_type: 'sqft' },
      { name: 'LaHabra X-Kaliber Finish (65lb)', sku: 'LH-XK-65', unit: 'bag', price: 28, category: 'Color Coat', coverage: 65, calc_type: 'sqft' },
      { name: 'Color Pigment (1lb tube)', sku: 'LH-PIG-1', unit: 'tube', price: 9.50, category: 'Color Coat', coverage: 200, calc_type: 'sqft' },
      { name: 'Finish Sand 30-mesh (80lb)', sku: 'FS-30-80', unit: 'bag', price: 12, category: 'Color Coat', coverage: 100, calc_type: 'sqft' },
      { name: 'Acrylic Additive (1 gal)', sku: 'AA-QR-1G', unit: 'gal', price: 18, category: 'Color Coat', coverage: 150, calc_type: 'sqft' },
      { name: 'Manufactured Stone Veneer (flat)', sku: 'SV-FLAT-BOX', unit: 'box', price: 125, category: 'Stone', coverage: 10, calc_type: 'sqft' },
      { name: 'Stone Corners (linear)', sku: 'SV-CORN-BOX', unit: 'box', price: 85, category: 'Stone', coverage: 5, calc_type: 'linear_ft' },
      { name: 'Stone Mortar Mix (80lb)', sku: 'SM-MRT-80', unit: 'bag', price: 12.50, category: 'Stone', coverage: 20, calc_type: 'sqft' },
      { name: 'Stone Grout Bag (50lb)', sku: 'SM-GRT-50', unit: 'bag', price: 14, category: 'Stone', coverage: 35, calc_type: 'sqft' },
      { name: 'Metal Lath for Stone (2.5 lb)', sku: 'ML-ST-25', unit: 'roll', price: 52, category: 'Stone', coverage: 450, calc_type: 'sqft' },
      { name: 'Scratch Coat Cement (94lb)', sku: 'SC-ST-94', unit: 'bag', price: 14.50, category: 'Stone', coverage: 25, calc_type: 'sqft' },
      { name: 'Drywall Sheet 1/2" 4x8', sku: 'DW-12-48', unit: 'sheet', price: 12.50, category: 'Drywall', coverage: 32, calc_type: 'sqft' },
      { name: 'Drywall Sheet 5/8" 4x8', sku: 'DW-58-48', unit: 'sheet', price: 14.50, category: 'Drywall', coverage: 32, calc_type: 'sqft' },
      { name: 'Red Dot Joint Compound (4.5 gal)', sku: 'RD-AP-45G', unit: 'bucket', price: 18, category: 'Drywall', coverage: 230, calc_type: 'sqft' },
      { name: 'TNT Lite Topping (4.5 gal)', sku: 'TNT-LT-45G', unit: 'bucket', price: 22, category: 'Drywall', coverage: 270, calc_type: 'sqft' },
      { name: 'Sanding Discs 120 Grit (25pk)', sku: 'SD-120-25', unit: 'box', price: 15, category: 'Drywall', coverage: 1500, calc_type: 'sqft' },
      { name: 'Sanding Discs 150 Grit (25pk)', sku: 'SD-150-25', unit: 'box', price: 15, category: 'Drywall', coverage: 1500, calc_type: 'sqft' },
      { name: 'Paper Joint Tape (500\')', sku: 'PJT-500', unit: 'roll', price: 4.50, category: 'Drywall', coverage: 200, calc_type: 'sqft' },
      { name: 'Mesh Joint Tape (300\')', sku: 'MJT-300', unit: 'roll', price: 7, category: 'Drywall', coverage: 150, calc_type: 'sqft' },
      { name: 'Corner Bead Metal 8\'', sku: 'CB-MT-8', unit: 'piece', price: 3.50, category: 'Drywall', coverage: 8, calc_type: 'linear_ft' },
    ].flatMap(m => [
      { ...m, supplier_id: pacificId, price_mod: 1.0 },
      { ...m, supplier_id: abcId, price_mod: 1.03 },
    ]),
    // Sherwin Williams - Painting only
    ...[
      { name: 'Painters Plastic (9\' x 400\')', sku: 'PP-9400', unit: 'roll', price: 18, category: 'Painting', coverage: 3600, calc_type: 'sqft' },
      { name: 'Primer (1 gal)', sku: 'SW-PRM-1G', unit: 'gal', price: 28, category: 'Painting', coverage: 400, calc_type: 'sqft' },
      { name: 'Primer (5 gal)', sku: 'SW-PRM-5G', unit: 'bucket', price: 115, category: 'Painting', coverage: 2000, calc_type: 'sqft' },
      { name: 'A-100 Exterior Latex (1 gal)', sku: 'SW-A100-1G', unit: 'gal', price: 42, category: 'Painting', coverage: 400, calc_type: 'sqft' },
      { name: 'A-100 Exterior Latex (5 gal)', sku: 'SW-A100-5G', unit: 'bucket', price: 185, category: 'Painting', coverage: 2000, calc_type: 'sqft' },
    ].map(m => ({ ...m, supplier_id: swId, price_mod: 1.0 })),
  ];

  let created = 0, skipped = 0;
  for (const mat of allMaterials) {
    const { data: existing } = await supabase.from('materials')
      .select('id').eq('supplier_id', mat.supplier_id).eq('name', mat.name).single();
    if (existing) { skipped++; continue; }

    const finalPrice = Math.round(mat.price * (mat.price_mod || 1) * 100) / 100;
    const { error } = await supabase.from('materials').insert({
      supplier_id: mat.supplier_id,
      name: mat.name,
      sku: mat.sku,
      unit: mat.unit,
      price_per_unit: finalPrice,
      category_id: categoryMap[mat.category],
      coverage_per_unit: mat.coverage,
      calc_type: mat.calc_type,
      sort_order: created + 1
    });
    if (error) { console.error(`Material "${mat.name}" error:`, error.message); }
    else created++;
  }

  console.log(`\n[Materials] ${created} created, ${skipped} skipped`);
  console.log('\nSeed complete!');
  console.log('Login with: admin@example.com / password123');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
