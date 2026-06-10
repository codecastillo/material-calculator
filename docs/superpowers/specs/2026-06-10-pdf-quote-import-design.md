# Quote Import, design

## Goal

Cut the manual work of re-typing supplier prices from a quote. The user copies
the quote text from their PDF viewer and pastes it into EstiCount, which detects
the supplier (by name or alias), parses the line items, and runs them through
the existing import diff preview so the user confirms before anything is
written.

## Why paste, not PDF upload (decision record)

Investigated server-side PDF parsing against the three real quotes:

- **Pacific quote: no text layer** (image/scanned). No text parser can read it;
  only OCR could, which is out of scope.
- **LKL / L&W quotes: correct text exists but the font encoding defeats the Node
  libraries.** `pdf-parse` corrupts specific characters (the digit `2`, the `/`),
  which is unacceptable for prices. `pdfjs-dist` is ESM-only with audit warnings
  and awkward in this CommonJS backend. `poppler`/`pdftotext` reads them
  perfectly but is a system binary, adding Railway deploy risk for an
  occasional-use feature.

The user's PDF viewer (Preview/Acrobat) extracts the text correctly. So pasting
viewer-copied text sidesteps the encoding problem entirely, needs no server PDF
engine, no new dependency, and no deploy change. Image-only PDFs still cannot be
read by any text method and fall back to CSV/manual.

## Scope

In scope: parse pasted quote text (the shared LKL/L&W "QUOTE" layout, plus a
generic line scanner), detect supplier, match by name/alias, update prices of
matched items, create new items as stubs, all through the existing preview.

Out of scope (YAGNI): PDF upload/parsing, OCR, inferring coverage or phase from a
quote.

## Components

### Parser, `frontend/js/quoteimport.js` (UMD, pure, unit-tested in Node)

- `parseQuoteText(text) -> { supplierName, rows: [{ name, price, sku? }] }`.
- Supplier detection from header signatures (Pacific, LKL, L&W) with a generic
  company-line fallback.
- Row extraction: pair a price-bearing data line with its adjacent description
  line; take the first clean `NNN.NN` price token; capture the item code as SKU
  when present; skip headers/subtotals/totals.

### Frontend wiring, `frontend/js/app.js` + `index.html`

- A "Paste quote" control beside "Import CSV" opens a modal with a textarea.
- On parse: `QuoteImport.parseQuoteText(text)` -> resolve supplier (match parsed
  name against supplier names and aliases; no match prompts to create; none
  detected falls back to the active supplier) -> build a **price-only** plan ->
  show the existing preview -> apply.
- Refactor the CSV importer's diff loop into `buildImportPlanFromRows(rows,
supplier, { priceOnly })`. CSV passes fully-specified rows with `priceOnly:
false` (unchanged behavior). Paste passes name/price/sku rows with `priceOnly:
true`: matched items get only their price (and unit if present) updated,
  coverage and phase untouched; new items are created as stubs (default coverage
  and phase) and listed separately in the preview.
- `renderImportPreview` and `applyImportPlan` are unchanged.

## Data flow

1. User pastes quote text, clicks Parse.
2. `parseQuoteText` -> `{ supplierName, rows }`.
3. Resolve supplier (name/alias match, else prompt-create, else active).
4. `buildImportPlanFromRows(rows, supplier, { priceOnly: true })` diffs against
   that supplier's catalog -> preview (changed / new / unchanged).
5. Apply -> existing `applyImportPlan` updates prices, creates stub new items,
   syncs to backend.

## Error handling

- No rows parsed (e.g. text from an image PDF, or unrecognized layout): notify
  the user it could not read line items and to try CSV, do not open the preview.

## Testing

- Node unit tests for `quoteimport.parseQuoteText` against synthetic fixtures
  modeled on the real LKL/L&W layout (generic item names and made-up prices, so
  no real supplier pricing lands in the repo) plus a generic sample and an
  empty/garbage input.
- No backend changes, so no new endpoint tests.
