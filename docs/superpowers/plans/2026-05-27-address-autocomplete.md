# Address Autocomplete & Delivery Notes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Google Places autocomplete to the project address field and a delivery notes textarea that prints on orders and is included in supplier emails.

**Architecture:** Google Maps JS SDK loaded via script tag with API key from backend `.env`. The `Autocomplete` widget attaches to the existing address input — no custom dropdown code. A new `<textarea>` for delivery notes sits below the address field, persists with saved jobs, and renders on the printed order form.

**Tech Stack:** Google Maps Places API (JS SDK), vanilla JS, CSS

---

## File Map

| File                         | Changes                                                                    |
| ---------------------------- | -------------------------------------------------------------------------- |
| `backend/.env`               | Add `GOOGLE_PLACES_API_KEY`                                                |
| `backend/server.js`          | Add `GET /api/config` endpoint to expose the API key                       |
| `frontend/index.html`        | Add Google Maps script tag, delivery notes textarea                        |
| `frontend/js/app.js`         | Init autocomplete, save/load/render delivery notes, update email function  |
| `frontend/css/styles.css`    | Dark theme overrides for `.pac-container`, delivery notes textarea styling |
| `frontend/css/orders-v2.css` | Print styles for delivery notes section                                    |

---

### Task 1: Backend — API key and config endpoint

**Files:**

- Modify: `backend/.env`
- Modify: `backend/server.js`

- [ ] **Step 1: Add the API key to `.env`**

Add this line to `backend/.env`:

```
GOOGLE_PLACES_API_KEY=YOUR_KEY_HERE
```

The user will replace `YOUR_KEY_HERE` with their actual Google Cloud API key (must have Places API enabled).

- [ ] **Step 2: Add a public config endpoint to `server.js`**

In `backend/server.js`, find the route registration block (after `app.use('/api/activity', activityRoutes);`) and add this **before** the static file serving and error handler:

```js
app.get('/api/config', (req, res) => {
  res.json({
    googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY || '',
  });
});
```

- [ ] **Step 3: Restart the server and verify**

Run: `curl http://localhost:3000/api/config`
Expected: `{"googlePlacesApiKey":"YOUR_KEY_HERE"}`

- [ ] **Step 4: Commit**

```bash
git add backend/.env backend/server.js
git commit -m "Add /api/config endpoint for Google Places API key"
```

---

### Task 2: Load Google Maps SDK dynamically

**Files:**

- Modify: `frontend/js/app.js`

The SDK is loaded dynamically after fetching the API key from `/api/config`, so the key is never hardcoded in frontend code.

- [ ] **Step 1: Add the SDK loader function**

In `frontend/js/app.js`, find the `// ===== NAVIGATION =====` comment (around line 217). Add this block **above** that comment:

```js
// ===== GOOGLE PLACES AUTOCOMPLETE =====
function loadGooglePlaces(apiKey) {
  if (!apiKey || document.getElementById('googleMapsScript')) return;
  const s = document.createElement('script');
  s.id = 'googleMapsScript';
  s.src =
    'https://maps.googleapis.com/maps/api/js?key=' +
    encodeURIComponent(apiKey) +
    '&libraries=places';
  s.async = true;
  s.defer = true;
  s.onload = initPlacesAutocomplete;
  document.head.appendChild(s);
}

function initPlacesAutocomplete() {
  if (typeof google === 'undefined' || !google.maps || !google.maps.places) return;
  const input = document.getElementById('calcProjectAddress');
  if (!input) return;
  const ac = new google.maps.places.Autocomplete(input, {
    types: ['address'],
    componentRestrictions: { country: 'us' },
    fields: ['formatted_address'],
  });
  ac.addListener('place_changed', function () {
    const place = ac.getPlace();
    if (place && place.formatted_address) {
      input.value = place.formatted_address;
    }
    if (typeof updateCalcHeader === 'function') updateCalcHeader();
  });
}
```

- [ ] **Step 2: Call the loader during app init**

In the same file, find the data-loading block that fetches suppliers from the API (search for `api.getSuppliers()`). It's inside an async IIFE or init function. After that fetch completes successfully, add:

```js
try {
  const cfg = await fetch('/api/config').then((r) => r.json());
  if (cfg.googlePlacesApiKey) loadGooglePlaces(cfg.googlePlacesApiKey);
} catch (_) {}
```

This should be placed near the end of the init block (after suppliers/categories are loaded), so the input element exists by the time the script loads.

- [ ] **Step 3: Verify autocomplete loads**

1. Restart the backend server
2. Open http://localhost:3000 in a browser
3. Navigate to the Calculator page
4. Type "123 Main" in the Project Address field
5. A Google Places dropdown should appear with address suggestions
6. Selecting one should fill the full formatted address

- [ ] **Step 4: Commit**

```bash
git add frontend/js/app.js
git commit -m "Load Google Places SDK and attach autocomplete to address field"
```

---

### Task 3: Dark theme CSS for the Places dropdown

**Files:**

- Modify: `frontend/css/styles.css`

The Google `pac-container` dropdown needs dark theme styling to match the app.

- [ ] **Step 1: Add `.pac-container` dark theme overrides**

In `frontend/css/styles.css`, find the `/* Hide legacy result chrome in v2 */` comment (around line 1030). Add this block **above** it:

```css
/* Google Places autocomplete dropdown — dark theme */
.pac-container {
  background: var(--v2-bg-surface, #1a1d21);
  border: 1px solid var(--v2-border-hairline, #2a2d31);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  font-family: var(--v2-font-sans);
  margin-top: 4px;
  z-index: 10000;
}
.pac-item {
  padding: 10px 14px;
  border-top: 1px solid var(--v2-border-hairline, #2a2d31);
  color: var(--v2-text-secondary, #9aa0a9);
  font-size: 0.88rem;
  cursor: pointer;
}
.pac-item:first-child {
  border-top: none;
}
.pac-item:hover,
.pac-item-selected {
  background: var(--v2-bg-surface-hover, rgba(255, 255, 255, 0.04));
}
.pac-item-query {
  color: var(--v2-text-primary, #e8e6e1);
  font-weight: 500;
}
.pac-icon,
.pac-icon-marker {
  display: none;
}
.pac-matched {
  color: var(--v2-accent, #4a9eff);
}

[data-theme='light'] .pac-container {
  background: #ffffff;
  border-color: #e2e2dd;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}
[data-theme='light'] .pac-item {
  border-color: #e2e2dd;
  color: #555;
}
[data-theme='light'] .pac-item:hover,
[data-theme='light'] .pac-item-selected {
  background: #f5f5f3;
}
[data-theme='light'] .pac-item-query {
  color: #111;
}
[data-theme='light'] .pac-matched {
  color: #0066cc;
}
```

- [ ] **Step 2: Verify styling**

1. Open the calculator, type an address
2. The dropdown should have a dark background with light text (dark theme) or white background (light theme)
3. The map pin icon should be hidden
4. Hover highlight should be visible

- [ ] **Step 3: Commit**

```bash
git add frontend/css/styles.css
git commit -m "Style Google Places dropdown for dark and light themes"
```

---

### Task 4: Add delivery notes textarea to calculator form

**Files:**

- Modify: `frontend/index.html`
- Modify: `frontend/css/styles.css`

- [ ] **Step 1: Add the textarea to index.html**

In `frontend/index.html`, find the address field (line 445):

```html
<div class="calc-v2-field">
  <label>Project Address</label
  ><input
    type="text"
    class="calc-v2-input"
    id="calcProjectAddress"
    placeholder="e.g. 123 Main St, City, ST"
    data-on-input="updateCalcHeader"
  />
</div>
```

Add a new row **after** the closing `</div>` of the `.calc-v2-form-row` that contains the address (line 446). Insert between the `</div>` of that form row and the next `<div class="calc-v2-form-row calc-v2-form-row-3">`:

```html
<div class="calc-v2-form-row">
  <div class="calc-v2-field calc-v2-field-full">
    <label>Delivery Notes</label
    ><textarea
      class="calc-v2-input calc-v2-textarea"
      id="calcDeliveryNotes"
      rows="2"
      placeholder="Lot #, gate code, delivery instructions..."
    ></textarea>
  </div>
</div>
```

- [ ] **Step 2: Add textarea CSS**

In `frontend/css/styles.css`, find the `.calc-v2-input` rule. Add this nearby (after it):

```css
.calc-v2-textarea {
  resize: vertical;
  min-height: 48px;
  line-height: 1.4;
  font-family: var(--v2-font-sans);
}
.calc-v2-field-full {
  grid-column: 1/-1;
}
```

- [ ] **Step 3: Verify**

1. Refresh the calculator page
2. A "Delivery Notes" textarea should appear below the address field, spanning the full width
3. It should match the input styling (dark bg, light text, same border)
4. It should be resizable vertically

- [ ] **Step 4: Commit**

```bash
git add frontend/index.html frontend/css/styles.css
git commit -m "Add delivery notes textarea to calculator form"
```

---

### Task 5: Save and load delivery notes with jobs

**Files:**

- Modify: `frontend/js/app.js`

- [ ] **Step 1: Add `deliveryNotes` to the job save object**

In `frontend/js/app.js`, find the `doSaveJob` function (around line 1911). In the `const job = {...}` object literal, find `projectAddress:isTemplate?'':document.getElementById('calcProjectAddress').value` and add `deliveryNotes` right after it:

Change:

```js
projectAddress:isTemplate?'':document.getElementById('calcProjectAddress').value,supplier:
```

To:

```js
projectAddress:isTemplate?'':document.getElementById('calcProjectAddress').value,deliveryNotes:isTemplate?'':(document.getElementById('calcDeliveryNotes')?.value||''),supplier:
```

- [ ] **Step 2: Restore `deliveryNotes` in `loadJob`**

In `frontend/js/app.js`, find the `loadJob` function (around line 2118). Find the line that sets the address:

```js
document.getElementById('calcProjectAddress').value = job.isTemplate
  ? ''
  : job.projectAddress || '';
```

Add immediately after it:

```js
const dnEl = document.getElementById('calcDeliveryNotes');
if (dnEl) dnEl.value = job.isTemplate ? '' : job.deliveryNotes || '';
```

- [ ] **Step 3: Verify round-trip**

1. Type a project name, address, and delivery notes
2. Calculate, then save the job
3. Navigate to Saved Jobs, click the job to load it
4. Verify all three fields are restored including delivery notes

- [ ] **Step 4: Commit**

```bash
git add frontend/js/app.js
git commit -m "Persist delivery notes in saved jobs"
```

---

### Task 6: Render delivery notes on the printed order form

**Files:**

- Modify: `frontend/js/app.js`
- Modify: `frontend/index.html`
- Modify: `frontend/css/orders-v2.css`

- [ ] **Step 1: Move `#orderNotesPrint` above the material groups**

In `frontend/index.html`, the `#orderNotesPrint` div is currently **below** `#orderTotals` (line 634). Move it so it sits between the deliver-to block and the material groups. Cut line 634:

```html
<div class="order-v2-notes-print" id="orderNotesPrint" style="display:none"></div>
```

And paste it between the deliver-to closing `</div>` (after line 625) and the `<!-- Per-supplier sections -->` comment (line 627). The result:

```html
                </div>

                <!-- Delivery notes (populated by renderOrderForm) -->
                <div class="order-v2-notes-print" id="orderNotesPrint" style="display:none"></div>

                <!-- Per-supplier sections (renderOrderForm writes here) -->
```

- [ ] **Step 2: Populate notes in `renderOrderForm`**

In `frontend/js/app.js`, find the `renderOrderForm` function. After the deliver-to block (around line 1728, after `if(da)da.textContent=pa||'';`), add:

```js
const dn = (document.getElementById('calcDeliveryNotes')?.value || '').trim();
const npEl = document.getElementById('orderNotesPrint');
if (npEl) {
  if (dn) {
    npEl.innerHTML =
      '<div class="order-v2-notes-eyebrow">DELIVERY NOTES</div><div class="order-v2-notes-body">' +
      escHtml(dn).replace(/\n/g, '<br>') +
      '</div>';
    npEl.style.display = '';
  } else {
    npEl.innerHTML = '';
    npEl.style.display = 'none';
  }
}
```

- [ ] **Step 3: Add CSS for the notes section**

In `frontend/css/orders-v2.css`, find the existing `.order-v2-notes-print` rule (around line 340-350). If there's no existing rule, add this near the totals styles:

```css
.order-v2-notes-print {
  padding: 16px 0;
  border-bottom: 1px solid var(--v2-border-hairline);
  margin-bottom: 8px;
}
.order-v2-notes-eyebrow {
  font-family: var(--v2-font-mono);
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--v2-text-tertiary);
  margin-bottom: 6px;
}
.order-v2-notes-body {
  font-family: var(--v2-font-sans);
  font-size: 0.85rem;
  line-height: 1.5;
  color: var(--v2-text-secondary);
  white-space: pre-wrap;
}
```

Also add print overrides inside the existing `@media print` block (the first one, around line 628):

```css
.order-v2-notes-print {
  border-color: #bbb !important;
}
.order-v2-notes-eyebrow {
  color: #555 !important;
}
.order-v2-notes-body {
  color: #333 !important;
}
```

- [ ] **Step 4: Verify on the order form**

1. Enter an address and delivery notes like "Lot 42, leave at back gate"
2. Calculate, then Generate Order
3. The notes should appear between the deliver-to address and the first supplier section
4. Click Download — notes should appear in the PDF/print preview
5. Clear the notes field, regenerate — the notes section should be hidden

- [ ] **Step 5: Commit**

```bash
git add frontend/index.html frontend/js/app.js frontend/css/orders-v2.css
git commit -m "Render delivery notes on printed order form"
```

---

### Task 7: Include delivery notes in supplier email

**Files:**

- Modify: `frontend/js/app.js`

- [ ] **Step 1: Update `emailOrderToSupplier` to include notes**

In `frontend/js/app.js`, find the `emailOrderToSupplier` function (around line 1843). Find the line:

```js
body += '\nTotal: $' + Number(currentCalc.materialTotal || 0).toFixed(2) + '\n';
```

Add this **after** it:

```js
const dn = (document.getElementById('calcDeliveryNotes')?.value || '').trim();
if (dn) body += '\nDelivery Notes:\n' + dn + '\n';
```

- [ ] **Step 2: Verify email includes notes**

1. Enter delivery notes
2. Calculate, Generate Order
3. Click "Email to supplier"
4. The mailto window should show delivery notes at the bottom of the body

- [ ] **Step 3: Commit**

```bash
git add frontend/js/app.js
git commit -m "Include delivery notes in supplier email body"
```
