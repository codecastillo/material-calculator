'use strict';

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');

const { parseQuoteText } = require('../../frontend/js/quoteimport.js');

// Synthetic text modeled on the real LKL / L&W "QUOTE" layout as a viewer copies
// it: a data line (qty, UOM, prices, code, size) followed by the description on
// its own line. Generic item names and made-up prices, no real supplier pricing.
const LKL_QUOTE = [
  'QUANTITY   UOM ITEM/DESCRIPTION PRICE/UOM AMOUNT',
  'L.K.L. ASSOCIATES, INC.',
  'Bill To: Cash Sales St. George',
  "1 1 MSF EA 363.00/ 3 63.00/ 11 1 1.62 D12 4'X8'",
  '1/2" Light Drywall',
  "1 1 MSF EA 400.00/ 4 00.00/ 19 1 9.20 D58 4'X12'",
  '5/8" Type X Drywall',
  '1 BX 47.47/ 4 7.47/ 1 47.47 C11/4',
  '1-1/4" Coarse Screw 8M/BX',
  'Subtotal 2,547.04',
  'St. George Utah Tax 171.92',
].join('\n');

const GENERIC_QUOTE = ['ACME Building Supply', 'Widget A 12.50', 'Big Bag of Mud 18.99'].join('\n');

describe('parseQuoteText', () => {
  test('detects the LKL supplier from the header', () => {
    const { supplierName } = parseQuoteText(LKL_QUOTE);
    assert.equal(supplierName, 'LKL Associates');
  });

  test('pairs each price with its description line', () => {
    const { rows } = parseQuoteText(LKL_QUOTE);
    const byName = Object.fromEntries(rows.map((r) => [r.name, r.price]));
    assert.equal(byName['1/2" Light Drywall'], 363.0);
    assert.equal(byName['5/8" Type X Drywall'], 400.0);
    assert.equal(byName['1-1/4" Coarse Screw 8M/BX'], 47.47);
  });

  test('drops subtotal and tax lines', () => {
    const { rows } = parseQuoteText(LKL_QUOTE);
    assert.ok(!rows.some((r) => /subtotal|tax/i.test(r.name)));
  });

  test('parses a generic same-line layout', () => {
    const { supplierName, rows } = parseQuoteText(GENERIC_QUOTE);
    assert.equal(supplierName, 'ACME Building Supply');
    const byName = Object.fromEntries(rows.map((r) => [r.name, r.price]));
    assert.equal(byName['Widget A'], 12.5);
    assert.equal(byName['Big Bag of Mud'], 18.99);
  });

  test('empty input yields no supplier and no rows', () => {
    const { supplierName, rows } = parseQuoteText('');
    assert.equal(supplierName, null);
    assert.deepEqual(rows, []);
  });
});
