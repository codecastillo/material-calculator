// Parser for supplier quote text pasted from a PDF viewer. Pure functions (no
// DOM), so they can be unit-tested in Node and reused by the browser. PDFs are
// not parsed here; the viewer's copy already decodes the text correctly, which
// the Node PDF libraries do not for these supplier templates.
//
// UMD shim: exports for Node tests and attaches to window for classic scripts.
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof root !== 'undefined') root.QuoteImport = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const SUPPLIER_SIGNATURES = [
    [/pacific\s+(?:coast\s+)?supply/i, 'Pacific Supply'],
    [/l\s*\.?\s*k\s*\.?\s*l\s*\.?\s*associates|lkl\s+associates/i, 'LKL Associates'],
    [/l\s*&\s*w\s+supply/i, 'L&W Supply'],
  ];
  // Structural lines (anchored at the start) that are never products.
  const SKIP =
    /^(page\b|quote\b|account|branch|phone|fax|bill to|ship to|payment terms|printed|close date|exp delv|activation|quoted|po:|ref:|job:|quantity|item\s*\/|material\s*\/|customer|information|quotation|net cash|terms|these prices|this estimate|otc|will call|cpu\b)/i;
  // Order-total / tax summary keywords, matched anywhere in the line (a tax line
  // can read "St. George Utah Tax 171.92"). Material names in this domain do not
  // contain these words.
  const SUMMARY =
    /\b(subtotal|sales tax|state tax|tax|amount due|balance due|grand total|total)\b/i;
  function skipLine(line) {
    return !line || SKIP.test(line) || SUMMARY.test(line);
  }
  // A price like 363.00 or 1,036.00 (two decimals required).
  const PRICE = /\d{1,3}(?:,\d{3})*\.\d{2}/;
  const PRICE_G = /\d{1,3}(?:,\d{3})*\.\d{2}/g;
  // Tabular noise stripped to recover a same-line description.
  const UOM =
    /\b(MSF|UOM|EA|BX|RL|PL|LF|ML|CT|PA|BG|YD|TON|SK|TB|PC|SF|GAL|MSFEA|MLPC|MSPC|RLRL|BXBX|PLPL|MLFBX|PCBX|RLCT|PKBX|TBCT|BGBG|YDYD|EAEA)\b/gi;
  const ITEM_CODE = /\b[A-Z]{1,5}\d[A-Z0-9/-]*\b/g;
  const SIZE = /\d+(?:-\d+\/\d+)?'?\s*\d*"?\s*[xX]\s*\d+'?\s*\d*"?/g;

  function detectSupplier(lines) {
    const head = lines.slice(0, 30).join('\n');
    for (const [re, name] of SUPPLIER_SIGNATURES) if (re.test(head)) return name;
    // Generic fallback: first non-price line that names a supply house. Only
    // company-type words (supply, associates, distribution), never material
    // words like "drywall" or "stucco" that show up in product descriptions.
    // When the company name is a logo image (common), nothing matches and the
    // caller falls back to the active supplier.
    for (const l of lines) {
      if (PRICE.test(l) || skipLine(l)) continue;
      if (/\b(supply|associates|distribut|building materials?|building supply)\b/i.test(l)) {
        const cleaned = l.replace(/,?\s*(inc|llc|co)\.?$/i, '').trim();
        if (cleaned.length >= 4 && cleaned.length <= 60) return cleaned;
      }
    }
    return null;
  }

  // Strip qty/UOM/code/size/price noise to see if a usable description sits on
  // the same line (the generic layout) or must come from an adjacent line.
  function residualDescription(line) {
    return line
      .replace(PRICE_G, ' ')
      .replace(UOM, ' ')
      .replace(ITEM_CODE, ' ')
      .replace(SIZE, ' ')
      .replace(/[/]/g, ' ')
      .replace(/\b\d+\b/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  function letterCount(s) {
    return (s.match(/[a-z]/gi) || []).length;
  }

  function isDescriptionLine(line) {
    return line && !PRICE.test(line) && !skipLine(line) && letterCount(line) >= 3;
  }

  function parseQuoteText(text) {
    const lines = String(text || '')
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    const supplierName = detectSupplier(lines);
    const rows = [];
    const seen = new Set();

    lines.forEach((line, i) => {
      if (skipLine(line)) return;
      const m = line.match(PRICE);
      if (!m) return;
      const price = parseFloat(m[0].replace(/,/g, ''));
      if (!(price > 0)) return;

      // A real description has lowercase words; a same-line residual that is
      // all-caps and short is just leftover item codes (e.g. "S EQ"), so prefer
      // the description on the adjacent line in that case.
      const resid = residualDescription(line);
      const residIsRealText = /[a-z]/.test(resid) && letterCount(resid) >= 4;
      let name = residIsRealText ? resid : '';
      if (!name) {
        if (isDescriptionLine(lines[i + 1])) name = lines[i + 1];
        else if (isDescriptionLine(lines[i - 1])) name = lines[i - 1];
        else if (letterCount(resid) >= 3) name = resid;
      }
      name = name.replace(/\s{2,}/g, ' ').trim();
      if (letterCount(name) < 3) return;

      const key = name.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      rows.push({ name, price, sku: null });
    });

    return { supplierName, rows };
  }

  return { parseQuoteText, detectSupplier };
});
