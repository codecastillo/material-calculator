'use strict';

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');

const eng = require('../../frontend/js/engineering.js');

// Helpers mirror how the calculator will call it: net area already includes the
// waste factor. These tests pin the engineering math to the agreed spec numbers.

describe('materialRole detection', () => {
  const cases = [
    ['30 Min Building Paper Double Ply 40"x49\'', 'paper'],
    ['Stucco Wire 17 Ga 36"x150\'', 'wire'],
    ['Stucco Netting 20ga Self-Furred 36x150', 'wire'],
    ['Marblewall Fine Sand 1.0 Base White 5 Gal', 'colorcoat'],
    ['Plaster Sand 1yd', 'sand'],
    ['Portland Cement Type S', 'cement'],
    ['1/2" Light Drywall 4x8', 'sheet'],
    ['DensShield Tile Backer 1/2" 4x8', 'sheet'],
    ['Hamilton All-Purpose Joint Compound 3.5 Gal', 'mud'],
    ["Joint Tape 500'", 'tape'],
    ["Wallboard Tape 500'", 'tape'],
    ['Screws 1-1/4" 8M', 'screw'],
    ['A-100 Exterior Latex 5gal', 'paint'],
    ['Primer 1gal', 'primer'],
    ['Stone Mortar Type S 80#', 'mortar'],
    // Accessories / non-formula products fall back to coverage (null role)
    ['Acrylic Latex Caulk 10.1oz', null],
    ['0.31mil 9x400 Painters Plastic', null],
    ['Duct Tape White 2"x60yd', null],
    ['Green Foam Float 5"x12"', null],
    ['Diamond Mesh 27"x96" 2.50#', 'lath'],
    ['2.5# Diamond Flat Lath 27x97', 'lath'],
    ['K-Lath 1-Kote 20ga 36x150', 'wire'],
    ['Dryvit Genesis DM Adhesive & Base Coat 50#', 'basecoat'],
    ['Dryvit Mojave Mid Base 5g', 'colorcoat'],
  ];
  for (const [name, expected] of cases) {
    test(`${name} -> ${expected}`, () => {
      assert.equal(eng.materialRole({ name }), expected);
    });
  }
});

describe('Lath net yields (code laps)', () => {
  test('paper roll yield is 292.85 net sf', () => {
    assert.equal(eng.CONSTANTS.PAPER_2PLY_SF_PER_ROLL, 292.85);
    assert.equal(eng.computePhase('Lath', 1000, {}).paper.qty, 4); // ceil(1000/292.85)=4
    assert.equal(eng.computePhase('Lath', 292.85, {}).paper.qty, 1);
    assert.equal(eng.computePhase('Lath', 292.86, {}).paper.qty, 2);
  });
  test('wire roll yield is 431.56 net sf', () => {
    assert.equal(eng.CONSTANTS.WIRE_NETTING_SF_PER_ROLL, 431.56);
    assert.equal(eng.computePhase('Lath', 1000, {}).wire.qty, 3); // ceil(1000/431.56)=3
    assert.equal(eng.computePhase('Lath', 431.56, {}).wire.qty, 1);
  });
});

describe('Gray Coat volumetric (1.25 shrinkage, 1:3 mix)', () => {
  test('cement bags, lime, and sand cubic yards at 3/4" over 1000 sf', () => {
    const r = eng.computePhase('Gray Coat', 1000, { grayThicknessIn: 0.75 });
    // wet=62.5cf, dry=78.125cf, cement=ceil(19.53)=20 bags, lime=ceil(9.77)=10, sand=58.59cf=2.17cy
    assert.equal(r.cement.qty, 20);
    assert.equal(r.lime.qty, 10);
    assert.equal(r.sand.qty, 2.17);
    assert.equal(r.sand.unit, 'cubic yard');
  });
  test('thickness scales the volume', () => {
    const thin = eng.computePhase('Gray Coat', 1000, { grayThicknessIn: 0.375 });
    assert.equal(thin.cement.qty, 10); // half the thickness -> half the cement
  });
});

describe('Color Coat (140 sf per 80lb bag)', () => {
  test('bags', () => {
    assert.equal(eng.computePhase('Color Coat', 1000, {}).colorcoat.qty, 8); // ceil(1000/140)
    assert.equal(eng.computePhase('Color Coat', 140, {}).colorcoat.qty, 1);
  });
});

describe('Drywall (sheets / mud / screws / tape)', () => {
  test('4x12 sheets, mud, screws, tape over 1000 sf', () => {
    const r = eng.computePhase('Drywall', 1000, { sheetSqft: 48 });
    assert.equal(r.sheet.qty, 21); // ceil(1000/48)
    assert.equal(r.mud.qty, 50); // 1000*0.05
    assert.equal(r.screw.qty, 770); // ceil(1000/1.3)
    assert.equal(r.tape.qty, 370); // ceil(1000*0.37)
  });
  test('4x8 sheet choice', () => {
    assert.equal(eng.computePhase('Drywall', 1000, { sheetSqft: 32 }).sheet.qty, 32); // ceil(1000/32)
  });
});

describe('Paint (surface + coats)', () => {
  test('smooth, 2 coats + primer', () => {
    const r = eng.computePhase('Painting', 1000, { surface: 'smooth', coats: 2 });
    assert.equal(r.paint.qty, 5); // ceil((1000/400)*2)
    assert.equal(r.primer.qty, 3); // ceil(1000/350)
  });
  test('textured, 1 coat', () => {
    const r = eng.computePhase('Painting', 1000, { surface: 'textured', coats: 1 });
    assert.equal(r.paint.qty, 4); // ceil((1000/250)*1)
  });
});

describe('Stone (corner subtraction + mortar)', () => {
  test('corners reduce flat area, mortar by weight', () => {
    const r = eng.computePhase('Stone', 1000, { cornerLinearFt: 20 });
    assert.equal(r.stone_corner.qty, 20); // 1:1 linear ft
    assert.equal(r.stone_flat.qty, 988); // 1000 - 20*0.6
    assert.equal(r.mortar.qty, 16); // ceil((1000*1.25)/80)
  });
});

describe('parsePackage from product names', () => {
  const cases = [
    ['Hamilton All-Purpose Joint Compound 3.5 Gal', { value: 3.5, unit: 'gal' }],
    ['A-100 Exterior Latex 5gal', { value: 5, unit: 'gal' }],
    ['Screws 1-1/4" 8M', { value: 8000, unit: 'count' }],
    ["Joint Tape 500'", { value: 500, unit: 'ft' }],
    ['Red Dot All Purpose 50#', { value: 50, unit: 'lb' }],
    ["Bullnose II 10' 50 Pc/Box", { value: 50, unit: 'count' }],
    ['Green Foam Float 5"x12"', null], // inch marks, not feet
  ];
  for (const [name, expected] of cases) {
    test(`${name}`, () => {
      assert.deepEqual(eng.parsePackage(name), expected);
    });
  }
});

describe('packagesForRole converts net need to purchase units', () => {
  test('mud gallons -> 3.5gal pails', () => {
    const r = eng.computePhase('Drywall', 1000, { sheetSqft: 48 });
    assert.equal(
      eng.packagesForRole('mud', r.mud, { name: 'Hamilton All-Purpose 3.5 Gal', unit: 'pail' }),
      15 // ceil(50 / 3.5)
    );
  });
  test('screws count -> 8M boxes', () => {
    const r = eng.computePhase('Drywall', 1000, { sheetSqft: 48 });
    assert.equal(
      eng.packagesForRole('screw', r.screw, { name: 'Screws 1-1/4" 8M', unit: 'box' }),
      1
    ); // ceil(770/8000)
  });
  test("tape linear ft -> 500' rolls", () => {
    const r = eng.computePhase('Drywall', 1000, { sheetSqft: 48 });
    assert.equal(eng.packagesForRole('tape', r.tape, { name: "Joint Tape 500'", unit: 'roll' }), 1); // ceil(370/500)
  });
  test('paper/wire pass through as rolls', () => {
    const r = eng.computePhase('Lath', 1000, {});
    assert.equal(eng.packagesForRole('paper', r.paper, { name: 'Building Paper' }), 4);
    assert.equal(eng.packagesForRole('wire', r.wire, { name: 'Stucco Wire' }), 3);
  });
  test('color coat falls back to coverage (null)', () => {
    const r = eng.computePhase('Color Coat', 1000, {});
    assert.equal(
      eng.packagesForRole('colorcoat', r.colorcoat, { name: 'Marblewall', coveragePerUnit: 80 }),
      null
    );
  });
  test('stored package overrides the parsed name', () => {
    const r = eng.computePhase('Drywall', 1000, { sheetSqft: 48 });
    assert.equal(
      eng.packagesForRole('mud', r.mud, {
        name: 'Mud 3.5 Gal',
        unit: 'pail',
        packageValue: 5,
        packageUnit: 'gal',
      }),
      10 // ceil(50/5) using the stored 5gal, not the name's 3.5
    );
  });
});

describe('waste factor by application method', () => {
  test('spray 5%, trowel 12% (default)', () => {
    assert.equal(eng.wasteFactor('spray'), 1.05);
    assert.equal(eng.wasteFactor('trowel'), 1.12);
    assert.equal(eng.wasteFactor(undefined), 1.12);
  });
});

describe('parsePackage box-of-rolls', () => {
  test('24 rolls/box of 300ft -> 7200 ft', () => {
    assert.deepEqual(eng.parsePackage('Mesh Tape 2"x300\' Blue (24 rolls/box)'), {
      value: 7200,
      unit: 'ft',
    });
  });
  test('a plain 500ft roll is still 500 ft', () => {
    assert.deepEqual(eng.parsePackage("Joint Tape 500'"), { value: 500, unit: 'ft' });
  });
});

describe('expanded materialRole (real catalog names)', () => {
  const cases = [
    ['Diamond Mesh 27"x96" 2.50#', 'lath'],
    ['A19 1/4" Tacker Staples 5M', 'staple'],
    ['Casing Bead #66 1/2" SF w/Weep', 'trim'],
    ["CornerAid Straight 10'", 'trim'],
    ['Omega DiamondWall Grey 80lb', 'basecoat'],
    ['Western 1-Kote Sanded 80#', 'basecoat'],
    ['Fine Sand 1.0 5Gl Base White', 'colorcoat'], // not 'sand'
    ['Full Circle Level 360 Sanding Disc 8-3/4" 150 Grit', 'sanding'],
    ['Trim-Tex 560 Pro Fine Sanding Pads 120G 4/Box', 'sanding'], // not colorcoat
    ["Clinch-On Paper Faced Tape-On Jumbo Wide Cornerbead 10'", 'cornerbead'],
    ['Trim-Tex Architectural Z Shadow Bead 1/2"x1/2"x10\'', 'cornerbead'],
    ['Dryvit Color Vial 8oz', 'pigment'],
    ['Sherwin Elastomeric Coating 5gal', 'paint'],
    ['Plaster Sand 1yd', 'sand'],
    ['Stucco Wire 17 Ga 36"x150\'', 'wire'],
    // dropped extras
    ['Green Foam Float 5"x12"', null],
    ['3M 8511 N95 Particulate Mask with Valve', null],
    ["EPS 1# T&G Foam Sheet 1\"x4'x8'", null],
    ['Roofing Nails EG 1-3/4"', null],
  ];
  for (const [name, expected] of cases) {
    test(`${name} -> ${expected}`, () => {
      assert.equal(eng.materialRole({ name }), expected);
    });
  }
});

describe('phaseWasteFactor', () => {
  test('coating phases follow the application method', () => {
    assert.equal(eng.phaseWasteFactor('Gray Coat', 'spray'), 1.05);
    assert.equal(eng.phaseWasteFactor('Gray Coat', 'trowel'), 1.12);
    assert.equal(eng.phaseWasteFactor('Color Coat', 'spray'), 1.05);
  });
  test('other phases use built-in defaults', () => {
    assert.equal(eng.phaseWasteFactor('Lath', 'trowel'), 1.1);
    assert.equal(eng.phaseWasteFactor('Drywall', 'spray'), 1.1);
    assert.equal(eng.phaseWasteFactor('Painting', 'trowel'), 1.05);
  });
});

describe('roleAllowedForPhase', () => {
  test('on-list roles pass, off-list and null are dropped', () => {
    assert.equal(eng.roleAllowedForPhase('paper', 'Lath'), true);
    assert.equal(eng.roleAllowedForPhase('trim', 'Lath'), true);
    assert.equal(eng.roleAllowedForPhase('mud', 'Drywall'), true);
    assert.equal(eng.roleAllowedForPhase('staple', 'Drywall'), false); // screws, not staples
    assert.equal(eng.roleAllowedForPhase(null, 'Lath'), false);
    assert.equal(eng.roleAllowedForPhase('paint', 'Accessories'), false); // no auto roles
  });
});

describe('paintYield', () => {
  test('elastomeric vs textured vs smooth', () => {
    assert.equal(eng.paintYield({ elastomeric: true }), 100);
    assert.equal(eng.paintYield({ surface: 'textured' }), 250);
    assert.equal(eng.paintYield({ surface: 'smooth' }), 400);
    assert.equal(eng.isElastomeric('Sherwin Elastomeric 5gal'), true);
    assert.equal(eng.isElastomeric('A-100 Latex 5gal'), false);
  });
});

describe('Lath staples + packagesForRole', () => {
  test('staple count then 5M-box conversion', () => {
    const r = eng.computePhase('Lath', 1000, {});
    assert.equal(r.staple.qty, 2000); // ceil(1000 / 0.5)
    assert.equal(
      eng.packagesForRole('staple', r.staple, { name: 'A19 Tacker Staples 5M', unit: 'box' }),
      1 // ceil(2000 / 5000)
    );
  });
});
