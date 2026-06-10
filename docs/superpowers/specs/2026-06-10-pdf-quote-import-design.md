# PDF Quote Import, design

## Goal

Upload a supplier's quote PDF and have EstiCount extract the supplier name and
line-item prices, resolve which supplier the prices belong to (by name or
alias), and run the result through the existing import diff preview so the user
confirms before anything is written. This removes the manual "export the quote
to CSV" step from the price-refresh workflow.

## Scope

In scope:

- Text-based PDFs from the three known suppliers (Pacific Supply, the shared
  L.K.L. Associates / L&W Supply "QUOTE" template) plus a generic fallback for
  any other layout.
- Extracting supplier name, item description, price, and SKU/item code when the
  format exposes one.
- Reusing the existing diff preview and apply path.

Out of scope (YAGNI):

- OCR for scanned/image-only PDFs (text-based only).
- Inferring coverage or phase from a quote (price sheets do not carry them).

## Approach

Server-side parsing (chosen over client-side to avoid vendoring PDF.js under the
`script-src 'self'` CSP and to keep the messy parsing logic in testable Node).

## Components

### Backend

- **Dependency:** `pdf-parse` for PDF text extraction. Run `npm audit` after
  adding; resolve any high/critical findings.
- **`backend/lib/quoteParser.js`** (pure, no I/O):
  - `parseQuote(text) -> { supplierName, rows: [{ name, price, sku?, unit? }] }`.
  - Detects supplier from header text; applies a tuned extractor for Pacific and
    the LKL/L&W template, else a generic line scanner (price-like token per
    line, preceding text is the description, drop headers/subtotals/totals).
- **`POST /api/materials/parse-quote`** (auth required; returns data only, no DB
  write):
  - Body: `{ dataBase64, filename }`. Validates `%PDF` magic bytes and a size
    cap (e.g. 5 MB). Decodes, runs `pdf-parse`, then `parseQuote`.
  - Returns `{ supplierName, rows }`; `422` with a message on parse failure or
    no rows; `400` on a non-PDF or oversized body.
  - Express JSON body limit raised as needed for this route.

### Frontend

- **`api.parseQuote(dataBase64, filename)`** in `frontend/js/api.js`.
- **"Import quote (PDF)"** control beside "Import CSV" on the catalog header; a
  hidden `accept="application/pdf"` file input. On select: read file -> base64
  -> `api.parseQuote` -> `{ supplierName, rows }`.
- **Supplier resolution:** normalize the parsed supplier name and match against
  existing supplier names and aliases (`window._supplierAliasMap` + `suppliers`).
  - Match -> that supplier is the import target.
  - No match -> confirm "This looks like '<name>', not in your list, create it?"
    On confirm, `api.createSupplier`, refresh `suppliers` / id map / alias map,
    then import into it.
  - No supplier detected -> fall back to the active supplier.
- **Reuse the preview:** refactor the CSV importer's plan builder into
  `buildImportPlanFromRows(rows, supplier)`. The CSV path parses to rows then
  calls it; the PDF path passes the server rows + resolved supplier. The
  existing `renderImportPreview` and `applyImportPlan` are unchanged.

## Data flow

1. User picks a PDF.
2. Frontend -> `POST /api/materials/parse-quote` -> `{ supplierName, rows }`.
3. Frontend resolves supplier (name/alias match, else prompt-create, else active).
4. `buildImportPlanFromRows(rows, supplier)` diffs against that supplier's
   catalog -> preview (changed / new / unchanged).
5. Apply -> existing `applyImportPlan` updates prices, creates new items as
   stubs, syncs to backend.

## New-item behavior

Matched items get their price (and unit when present) updated. New items are
created as stubs with default coverage and phase, listed separately in the
preview and flagged, since a price sheet does not define coverage or phase. The
catalog health check surfaces anything left incomplete.

## Error handling

- Non-PDF, oversized, parse failure, or zero rows: notify the user, do not open
  the preview.
- Server catches `pdf-parse` errors and returns `422` with a readable message.

## Testing

- Node unit tests for `quoteParser` against text snippets from all three known
  formats plus a generic sample (supplier name + representative rows).
- A light endpoint test (auth required, non-PDF rejected). Real PDF binaries are
  hard to fixture, so the parser logic carries the bulk of the coverage.
