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
    ['Diamond Mesh 27"x96" 2.50#', null],
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
  test('cement bags and sand cubic yards at 3/4" over 1000 sf', () => {
    const r = eng.computePhase('Gray Coat', 1000, { grayThicknessIn: 0.75 });
    // wet=62.5cf, dry=78.125cf, cement=ceil(19.53)=20 bags, sand=58.59cf=2.17cy
    assert.equal(r.cement.qty, 20);
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

describe('waste factor by application method', () => {
  test('spray 5%, trowel 12% (default)', () => {
    assert.equal(eng.wasteFactor('spray'), 1.05);
    assert.equal(eng.wasteFactor('trowel'), 1.12);
    assert.equal(eng.wasteFactor(undefined), 1.12);
  });
});
