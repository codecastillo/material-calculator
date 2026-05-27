# Address Autocomplete & Delivery Notes

## Summary

Add Google Places autocomplete to the project address field so addresses are always complete (street, city, state, zip). Add a delivery notes textarea for lot numbers, gate codes, and delivery instructions. Notes print on the order form sent to suppliers.

## Address Autocomplete

### Integration

- Load Google Maps JS SDK with the `places` library via a `<script>` tag in `index.html`.
- API key: stored as `GOOGLE_PLACES_API_KEY` in the backend `.env`. The backend injects it into the page via a template variable or a `/api/config` endpoint that returns public client config. Fallback: hardcode in `index.html` for initial development.
- On calculator page load, attach `google.maps.places.Autocomplete` to the existing `#calcProjectAddress` input.

### Configuration

- `types: ['address']` — only street addresses, not businesses or regions.
- `componentRestrictions: { country: 'us' }` — US addresses only.
- `fields: ['formatted_address']` — minimize billing by only requesting the formatted string.

### Behavior

- On `place_changed` event: write `place.formatted_address` into the input, then call `updateCalcHeader()` to refresh the subtitle.
- If the user types manually without selecting a suggestion, the plain text value is kept. No validation gate — the autocomplete enhances but doesn't block.
- The Google `pac-container` dropdown receives CSS overrides to match the app's dark theme (dark background, light text, accent highlight on hover).

### Existing flows — no changes needed

- Save/load job: `projectAddress` is already a plain text field; the full address string is stored the same way.
- Order form: `#orderDeliverAddress` already reads from `projectAddress`.
- Search: job search already indexes `projectAddress`.
- Backend: `project_address` column is already `text`; no schema change.

## Delivery Notes

### Calculator field

- New `<textarea>` with `id="calcDeliveryNotes"` placed directly below the `#calcProjectAddress` input, inside the same form group area.
- Label: "Delivery Notes"
- Placeholder: `"Lot #, gate code, delivery instructions..."`
- Default size: 2 rows. CSS `resize: vertical` so the user can expand.
- Styled to match existing `calc-v2-input` (same background, border, font).

### Data persistence

- Added to the job object as `deliveryNotes` (string).
- Saved alongside `projectAddress` in `saveJob()`.
- Restored in `loadJob()`.
- The backend `jobs` table does not currently have a `delivery_notes` column; for now, store it in localStorage with the rest of the job data. A backend migration can be added later if needed.

### Order form printing

- The existing `#orderNotesPrint` element (currently hidden and unused) is repurposed.
- When `deliveryNotes` is non-empty, `renderOrderForm()` populates `#orderNotesPrint` with a bordered section:
  - Eyebrow label: "DELIVERY NOTES"
  - Content: the notes text, preserving line breaks.
  - Positioned between the deliver-to block and the first supplier material group.
- When empty, the section stays hidden — no empty box on the printout.

### Email to supplier

- The `emailOrderToSupplier()` function appends delivery notes to the email body when present, under a "Delivery Notes:" heading.

## Files modified

- `frontend/index.html` — Google Maps script tag, delivery notes textarea, possible config endpoint.
- `frontend/js/app.js` — Places autocomplete init, delivery notes save/load/render, order form notes rendering, email body update.
- `frontend/css/styles.css` — Dark theme overrides for `.pac-container`, delivery notes textarea styling.
- `frontend/css/orders-v2.css` — Print styles for the delivery notes section.
- `backend/.env` — `GOOGLE_PLACES_API_KEY` variable.

## Out of scope

- Structured address fields (separate city/state/zip inputs) — the single formatted string is sufficient for supplier delivery.
- Map preview or pin-drop UI.
- Address validation/verification beyond what Google Places provides.
- Backend `delivery_notes` column migration (can be added later).
