# EstiCount — Page Specs (Dashboard · Pricing · Orders · Bids · Saved Jobs · Admin · Sign-in · Mobile)

This document extends `spec.md` (the Calculator page spec) with one detailed section per remaining page in the EstiCount single-page app. All global tokens — color palette, typography, spacing, radii, hairline borders, phase chip palette, topnav structure — are **inherited verbatim from `spec.md` §1–2** and referenced by name (e.g. `var(--v2-accent)`, `Fraunces 500`, `.v2-chip.lath`). Do **not** redeclare tokens; only specify layout and composition here.

Each page targets the same `1440px` content max-width, the same `40px` horizontal page padding, the same 56px topnav, and the same `24px` top padding below the topnav as the Calculator. The topnav from `spec.md §2` is shared across every authenticated page; only the `.v2-topnav-indicator` text and the `.v2-nav-link.active` underline change.

---

## Build territory map

Each row below tells a parallel builder which HTML region, CSS namespace, and `app.js` render function it owns. **Do not overlap.** Anything not listed in "Owns" is off-limits to that page's builder; coordinate via this map.

| Page | HTML region (`id=`) | CSS namespace prefix | Primary render function in `frontend/js/app.js` | Notes |
|---|---|---|---|---|
| Dashboard | `#dashboardPage` (lines 141–168 of `index.html`) | `dash-v2-*` | `renderDashboard()` (line 952) | Builder rewrites the entire region inner HTML; also owns `dashStats`, `dashRecentJobs`, `dashSuppliers` containers. |
| Pricing | `#pricingPage` (lines 171–200) | `price-v2-*` | `renderMaterialTable()` (line 252), `renderSupplierTabs()` (line 211) | Owns the sidebar (`#supplierTabs` replaced), toolbar, and `#scopeGroups` / `#recentMaterials` / `#statsBar` containers. |
| Orders | `#orderPage` (lines 378–407) | `order-v2-*` | `renderOrderTable()` (line 912) | Owns `#orderEmpty`, `#orderContent`, `#orderTableBody`. May not touch calculator render. |
| Bids | `#bidPage` (lines 410–416) | `bid-v2-*` | `generateBidSummary()` (line 919) — rebuilds `#bidSummary` inner HTML | Owns `#bidEmpty`, `#bidContent`, `#bidSummary`. |
| Saved Jobs | `#savedJobsPage` (lines 419–425) | `jobs-v2-*` | `renderSavedJobs()` (line 937) | Owns `#savedJobsList`, the new search/filter chips, and the footer stats row. |
| Admin | `#adminPage` (lines 467–504) | `admin-v2-*` | `renderAdminPanel()` (line 1043) | Owns `#adminStats`, `#adminKeysList`, `#adminUsersList`, the generate-keys form. |
| Sign-in / Activate | `#loginScreen` (lines 17–60) plus existing `loginForm` / forgot / reset blocks | `login-v2-*` | (no render fn — static markup; handlers wire submit) | Builder rebuilds the screen's two-column layout; activate-with-license-key input is **new** and posts to existing `activateLicense` handler. |
| Mobile (cross-page) | New `<nav id="mobileTabBar">` appended inside `#appContainer` after `<main>` | `mob-v2-*` | New helper `renderMobileTabBar()` inserted near `showPage` in `app.js` | Owns the bottom tab bar component only. All other pages must add `padding-bottom: 72px` at `<768px`. |

### Shared / forbidden territory

- **`frontend/index.html` lines 1–16, 17–60 (login), 61–137 (topnav + page header), 506–527 (modals + footers + closing tags)** — only the Sign-in builder owns 17–60; nobody else touches 1–16 or 506–527. Topnav (94–137) is modified only to add the `data-page` indicator text per page; the markup itself is shared.
- **`frontend/css/styles.css` lines 1–477 (legacy palette + components) and lines 478–1024 (v2 tokens + Calculator v2 styles)** — every page builder appends a single `/* === <namespace> === */` block at the **end of the file**. Nobody edits existing rules. Tokens in `:root` (lines 486–519) are read-only.
- **Modals (lines 509–521)** — owned by Pricing builder (most are pricing-related). Add-supplier and add-category modals get a `price-v2-modal` restyle; other modals (`saveJobModal`) get a minimal restyle owned by Saved Jobs builder.
- **`app.js` shared helpers**: `showPage`, `fmt`, `escHtml`, `escAttr` are read-only. Builders only modify the specific render function listed above per page.

---

## 1. Dashboard

### 1.1 Design summary

The Dashboard is the operator's morning cockpit: a dense, editorial layout that reads like a financial daily brief. The canonical treatment is PDF page 1 ("Welcome back, Daniel"), a two-column layout with a wide left content column (~64%) carrying the eyebrow, title, 4-up metric strip, and Active estimates table, and a narrower right rail (~36%) carrying Suppliers cards and an Activity feed. The serif title sits big and quiet against a deep `var(--v2-bg-app)` field; the only saturated color is `var(--v2-accent)` on the primary "New calculation" CTA. The metrics strip reuses the Calculator's four-cell hairline-divided card pattern (`spec.md §4`). Pages 2 and 3 of the PDF are noted as **alternate dashboard treatments** but are not built — only page 1 is canonical.

### 1.2 Layout structure

```
.dash-v2-page {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 380px;
  gap: 32px;
  padding: 24px 40px 64px;
  max-width: 1440px;
  margin: 0 auto;
}
```

At `<1100px`, collapse to a single column (right rail stacks below the table). At `<768px`, see mobile section §8.

### 1.3 Header zone

Single row, left + right cluster, identical structure to the Calculator header (`spec.md §3`).

**Left (stacked):**

1. **Eyebrow** (`.dash-v2-eyebrow`): `01 · TODAY · TUE MAY 12`
   - Small-caps mono token: `Fraunces`-no, **mono 400, 0.7rem, uppercase, letter-spacing 0.10em, color `var(--v2-text-tertiary)`**. The `·` separators sit at the same color with 8px gap on either side.
   - Bottom margin 8px.
2. **Title** (`.dash-v2-title`): `Welcome back, Daniel`
   - `Fraunces 500`, ~2.0rem, `var(--v2-text-primary)`, letter-spacing -0.005em. Bottom margin 6px.
3. **Subtitle** (`.dash-v2-subtitle`): `3 jobs in production · 2 bids awaiting reply · payroll runs Friday`
   - Sans 400, 0.88rem, `var(--v2-text-secondary)`. `·` separators in `var(--v2-text-tertiary)`.

**Right (single row, 16px gaps, vertically centered with title):**

1. **Secondary CTA** `+ New job` — pill button, height 36px, padding `0 16px`, radius `var(--v2-r-button)`, background `var(--v2-bg-surface-2)`, 1px border `var(--v2-border-hairline)`, text `var(--v2-text-primary)`, sans 500, 0.88rem.
2. **Primary CTA** `⨎ New calculation` — same dimensions, background `var(--v2-accent)`, text `#1a0e08`, sans 600, 0.88rem. The leading `⨎` (or similar measuring glyph) is set in `var(--v2-font-mono)` at 0.9em. Hover: `var(--v2-accent-hover)`. On mobile the two CTAs swap to a vertical stack below the title.

A 1px hairline divider runs the full content width below the header row with 20px space above and below.

### 1.4 Metric strip (4-up)

A single rounded card identical in structure to the Calculator's metrics strip (`spec.md §4`): `var(--v2-bg-surface)`, 1px border `var(--v2-border-hairline)`, radius `var(--v2-r-inner)`, four equal-width cells separated by 1px vertical hairlines.

Each cell uses the same two-row structure (small-caps label top, big number + sub-trend below). Cell content **verbatim**:

| Cell | Label (top, small-caps mono) | Value (mono 500 ~1.6rem tabular) | Unit suffix (mono 0.65rem) | Sub-trend (sans 0.78rem, `var(--v2-text-secondary)`) |
|---|---|---|---|---|
| 1 | `IN PRODUCTION` | `3` | `jobs` | `$167.2k total contract value` |
| 2 | `AWAITING REPLY` | `2` | `bids` | `Oldest sent 6 days ago` |
| 3 | `MATERIALS MTD` | `24.1` | `k` | `↓ Down 8% vs Apr` — arrow `↓` in `var(--v2-text-secondary)` |
| 4 | `AVG MARGIN` | `31.4` | `%` | `↑ Target 28%` — arrow `↑` in `var(--v2-accent)` to signal positive |

Cell padding `16px 20px`. Sub-trend line top margin 8px. Cell content vertically aligned to top, not centered (unlike Calculator metrics which center).

20px gap below the strip.

### 1.5 Active estimates table (left column)

Section heading row above the table, separate from the table card itself:

- **Eyebrow** `02 · RECENT JOBS` — small-caps mono token, `var(--v2-text-tertiary)`.
- **Title** `Active estimates` — sans 600, 1.0rem, `var(--v2-text-primary)`. (NOTE: this title uses sans, not serif — it's a section header, not a page title.)
- Right side: `SHOWING 5 OF 24` (small-caps mono, `var(--v2-text-tertiary)`) followed by `All →` text link (sans 500, 0.85rem, `var(--v2-text-secondary)` → `var(--v2-text-primary)` on hover).

Table card: `var(--v2-bg-surface)`, 1px border `var(--v2-border-hairline)`, radius `var(--v2-r-card)`, `table-layout: fixed`, overflow hidden.

**Column spec** (5 columns, fixed widths sum ≤ container):

| # | Header (small-caps mono `var(--v2-text-tertiary)`) | Width | Align | Body font |
|---|---|---|---|---|
| 1 | `JOB ·#` | 80px | left | mono 400, 0.85rem, `var(--v2-text-primary)` (e.g. `J-2419`) |
| 2 | `NAME / CLIENT` | flex / fill | left | Two lines: name sans 600 0.88rem `var(--v2-text-primary)` + sub-line client+addr sans 400 0.78rem `var(--v2-text-tertiary)` |
| 3 | `PHASE` | 150px | left | One or two phase chips from `spec.md §1.1` palette (use `.v2-chip.color-coat`, `.v2-chip.gray-coat`, `.v2-chip.lath`, `.v2-chip.painting`) |
| 4 | `SQ·FT  DUE` | 130px | right | sqft mono 500 0.95rem `var(--v2-text-primary)` then 8px gap then due-date mono 400 0.78rem `var(--v2-text-tertiary)` on the same line (date format `Jun 04`) |
| 5 | `TOTAL` | 90px | right | mono 500 0.95rem `var(--v2-text-primary)` (e.g. `$28.4k`) |

Column header row: padding `10px 20px`, bottom 1px hairline divider. Data row padding `16px 20px`, bottom 1px hairline (except last row, flush with card bottom). Row hover: `var(--v2-bg-surface-hover)`. Each row also gets a trailing `›` chevron icon (just before the right edge, `var(--v2-text-tertiary)`) indicating it's clickable to open the calculator with that job loaded.

**Verbatim row content (from PDF page 1):**

| Job | Name | Sub-line | Phase chip(s) | Sq·ft / Due | Total |
|---|---|---|---|---|---|
| J-2419 | Hernandez Residence | M. Hernandez · 4218 Briar Creek Dr | ● COLOR COAT | 3,840 / Jun 04 | $28.4k |
| J-2417 | Westridge Townhomes | BRG Construction · Unit 12–24, Westridge | ● GRAY COAT | 12,480 / Jun 11 | $88.2k |
| J-2415 | Oak Park Auto | D. Klein · 1601 W Industrial | ● LATH | 6,240 / Jun 14 | $41.6k |
| J-2413 | Glenmore Family Dental | Glenmore LLC · 88 Glenmore Ave Ste 2 | ● PAINTING | 2,150 / May 28 | $14.8k |
| J-2410 | Marina Cottages 3 & 4 | B. Tellez · Lot 14B Marina Pt | ● COLOR COAT | 5,360 / Jun 19 | $37.0k |

### 1.6 Right rail — Suppliers + Activity

The right rail is a single column with two stacked sections, each a card.

**Suppliers card** (`.dash-v2-suppliers`):
- Eyebrow `SUPPLIERS` — small-caps mono, `var(--v2-text-tertiary)`, bottom margin 16px.
- A vertical list of 4 supplier rows; each row separated by a 1px hairline divider. Row padding `16px 0`.
- Per-row layout:
  - Row 1 (flex space-between): supplier name (sans 600 0.95rem) on left; sync recency on right (sans 400 0.78rem `var(--v2-text-secondary)`, e.g. `2 days ago`, `Yesterday`, `5 days ago`, `Today`).
  - Row 2 (flex wrap, gap 6px): phase chips (`spec.md §1.1`), each chip with leading `●` dot.
  - Row 3 (flex space-between, sans 400 0.78rem `var(--v2-text-secondary)`): `142 items` on left; `$184.2k YTD` (mono 500, `var(--v2-text-primary)`) on right.

**Verbatim supplier rows:**

| Supplier | Sync | Phase chips | Item count | YTD spend |
|---|---|---|---|---|
| Pacific Supply | 2 days ago | ● GRAY COAT  ● COLOR COAT  ● ACCESSORIES | 142 items | $184.2k YTD |
| ABC Supply | Yesterday | ● LATH  ● DRYWALL  ● ACCESSORIES | 318 items | $92.5k YTD |
| LKL Associates | 5 days ago | ● LATH  ● COLOR COAT  ● DRYWALL | 88 items | $56.7k YTD |
| Sherwin Williams | Today | ● PAINTING | 96 items | $35.0k YTD |

Card outer: `var(--v2-bg-surface)`, 1px border `var(--v2-border-hairline)`, radius `var(--v2-r-card)`, padding `20px 24px`. 24px bottom margin before Activity card.

**Activity card** (`.dash-v2-activity`):
- Eyebrow `ACTIVITY` — small-caps mono, bottom margin 16px.
- Vertical list of 5 events. Each event is a row (flex, gap 12px): left timestamp (mono 400 0.78rem `var(--v2-text-tertiary)`, fixed-width 56px column-aligned), then event text (sans 400 0.85rem `var(--v2-text-primary)` for the verb + entity, with descriptor in `var(--v2-text-secondary)` after an em-dash). Row vertical padding 10px.

**Verbatim events:**

| Time | Event |
|---|---|
| 11:42 | **Bid sent** — Marina Cottages 3 & 4 |
| 09:15 | **Price update** — Stuc-O-Flex · 12 items |
| Mon | **Job won** — Glenmore Family Dental — $14,820 |
| Mon | **Catalog import** — Western Builders · 318 SKUs |
| Sun | **New customer** — B. Tellez · Marina Pt |

Bolded verbs/labels: `Bid sent`, `Job won`, `Catalog import`, `New customer` render in **sans 600**. `Price update` is bold too. The dollar amount `$14,820` is mono 500 `var(--v2-text-primary)`.

### 1.7 Phase chip references

Use the existing chip palette directly: `.v2-chip.color-coat`, `.v2-chip.gray-coat`, `.v2-chip.lath`, `.v2-chip.painting`, `.v2-chip.accessories`, `.v2-chip.drywall`. Each chip carries its `●` dot via the `::before` pseudo-element as declared in `spec.md §7`.

### 1.8 Mobile collapse rules

At `<1100px`, right rail wraps below table. At `<768px`:
- Eyebrow + title remain. Subtitle wraps. Right-cluster CTAs collapse to a single `+ New calculation` full-width pill below the subtitle; `+ New job` becomes a small text link beneath.
- Metric strip switches from 4-up to 2×2 grid; vertical AND horizontal 1px hairlines.
- Active estimates table: hide `PHASE` and `JOB·#` columns; merge `JOB·#` into the name sub-line as `J-2419 · M. Hernandez`. Move phase chip into name cell as line 3.
- Suppliers card: each row's phase chips wrap to a second line below the name. Item count + YTD spend remain on one row.

### 1.9 Interaction notes

- Clicking a row in **Active estimates** calls `showPage('calculator')` and loads that job (`loadJob(id)`).
- Clicking a **supplier card row** filters Pricing page to that supplier (and navigates there).
- Clicking an **activity row** routes to the relevant page (bid → Bids page with that bid, price update → Pricing with that SKU highlighted, job won → Saved Jobs with filter `Won`).
- `+ New calculation` resets `currentCalc` and navigates to `#calculatorPage`.
- `+ New job` opens the existing save-job modal pre-flagged "new from scratch".

### 1.10 1:1 vs. flexibilities

**Must be 1:1:** Eyebrow text exactly `01 · TODAY · TUE MAY 12` with date dynamic; title `Welcome back, Daniel` with name dynamic; 4 metric cells with the verbatim labels and units; 5-row table with the column headers and phase chip color exactly matching the chip palette; 4 supplier rows with chip palette exactly matching their listed phases; 5-event activity feed.

**Flex:** Exact supplier sync recency text formatting (`2 days ago` vs. `2d ago`); the chevron icon glyph; activity row icon dots (optional); sub-trend arrows for cells 3 and 4 may use any small-cap arrow glyph.

### 1.11 Alternate dashboard treatments (note only — DO NOT BUILD)

- **PDF Page 2** ("Welcome back, Daniel." with priority-job hero card + pipeline strip): one large hero card with progress bar showing Lath / Gray Coat / Color Coat / Final phases as colored progress segments; right column displays large `$28,450` customer-price block. Use as inspiration for a future "Priority job" pinned section but not built in v1.
- **PDF Page 3** ("Job site schedule" + "Supplier ledger"): weekday selector strip (M T W T F S S) above scheduled site visits; right column shows "Most used" supplier with 12-week sparkline + price alerts. Reserve `.dash-v2-schedule` and `.dash-v2-ledger` namespaces for v2.

---

## 2. Pricing

### 2.1 Design summary

Pricing is a desk-clerk material catalog: a left sidebar lists suppliers (the primary navigation axis) and category filters, while the main column shows the active supplier's catalog as a dense, sortable table. The active supplier title (`Material catalog` for **Stuc-O-Flex**) sits in the same editorial header pattern as Calculator. Pastel phase chips on each row classify SKUs by phase; a 30-day sparkline-or-delta sits in the rightmost column. Layout reads like a Bloomberg terminal: lots of mono digits, hairline dividers, no decoration.

### 2.2 Layout structure

```
.price-v2-page {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  gap: 32px;
  padding: 24px 40px 64px;
  max-width: 1440px;
  margin: 0 auto;
}
```

At `<900px`, the sidebar collapses into a horizontal scrollable supplier-pill row at the top, with filter checkboxes moving into a dropdown. At `<768px`, see mobile §8.

### 2.3 Left sidebar (`.price-v2-sidebar`)

Sticky-positioned (`position: sticky; top: 80px;`). Two sections stacked vertically.

**Section A — Suppliers (`.price-v2-suppliers`):**

- Eyebrow `SUPPLIERS · 6` — small-caps mono, `var(--v2-text-tertiary)`, bottom margin 12px.
- Vertical list of 6 supplier entries. Each entry is a clickable `<button>` (`.price-v2-supplier-item`) with:
  - Row 1 (flex space-between): supplier name (sans 600 0.92rem) on left; YTD spend (mono 500 0.85rem `var(--v2-text-primary)`) on right.
  - Row 2 (sans 400 0.78rem `var(--v2-text-tertiary)`): `142 items`.
- Active supplier row has background `var(--v2-bg-surface-2)`, left border 2px solid `var(--v2-accent)`, name color `var(--v2-text-primary)`. Inactive rows have transparent background.
- Padding per row: `12px 14px`. Row gap 2px. Border-radius `var(--v2-r-input)`.

**Verbatim supplier list (active row marked **):**

| Supplier | Items | YTD spend |
|---|---|---|
| **Stuc-O-Flex** | 142 items | $184.2k |
| Western Builders | 318 items | $92.5k |
| Coronado Stone | 88 items | $56.7k |
| Dunn-Edwards | 96 items | $34.9k |
| Foster Lumber | 41 items | $22.1k |
| AAA Concrete | 33 items | $18.4k |

Below the list: `+ Add supplier` text link, sans 500 0.85rem, `var(--v2-text-secondary)` → `var(--v2-text-primary)` hover. Top margin 8px. Bottom margin 24px.

**Section B — Filter (`.price-v2-filter`):**

- Eyebrow `FILTER` — small-caps mono, `var(--v2-text-tertiary)`, bottom margin 12px.
- Vertical list of 7 checkboxes. Each row layout: `<input type="checkbox">` (custom-styled, see below) + label (sans 400 0.88rem `var(--v2-text-primary)`) + count (mono 400 0.85rem `var(--v2-text-tertiary)`, pushed right via `margin-left: auto`).
- Custom checkbox: 14px square, 1px border `var(--v2-border-hairline)`, radius 3px, background `var(--v2-bg-surface-2)`. Checked: background `var(--v2-accent)`, white `✓` glyph.
- Row padding `8px 0`. The `All categories` row sits at the top and is checked by default.

**Verbatim filter rows (with counts from PDF):**

| Filter | Count |
|---|---|
| All categories ✓ | 142 |
| Mortar & Mud | 38 |
| Coatings | 44 |
| Aggregate | 22 |
| Lath & Wire | 18 |
| Paper & Wrap | 9 |
| Fastener | 11 |

### 2.4 Header zone (main column)

Same structure as Calculator header (`spec.md §3`), left + right cluster.

**Left:**
1. **Eyebrow** `03 · PRICING · STUC-O-FLEX` — small-caps mono, `var(--v2-text-tertiary)`. The supplier slug at the end is dynamic.
2. **Title** `Material catalog` — `Fraunces 500`, ~2.0rem.
3. **Subtitle** `142 SKUs · Last sync 10:42 today · Price history tracked` — sans 400, 0.88rem, `var(--v2-text-secondary)`.

**Right (16px gaps):**
1. `Import CSV` text link — sans 500 0.85rem, `var(--v2-text-secondary)`.
2. `Export` text link — same style.
3. `+ New item` primary CTA pill — 36px height, `var(--v2-accent)` background, text `#1a0e08`, sans 600 0.88rem.

1px hairline divider beneath the header row, 20px above and below.

### 2.5 Toolbar row

A single horizontal row above the table, no card wrapper, flex space-between:

**Left:** Search input (`.price-v2-search`), width 320px, height 32px, background `var(--v2-bg-surface-2)`, 1px border `var(--v2-border-hairline)`, radius `var(--v2-r-button)`. Leading 🔍 icon (`var(--v2-text-tertiary)`). Placeholder `Search SKU, name, unit…` in `var(--v2-text-tertiary)`.

**Right (gap 16px):**
1. `SORT` label (small-caps mono `var(--v2-text-tertiary)`) + dropdown (`.price-v2-sort-select`) — height 32px, mono 400 0.85rem, background `var(--v2-bg-surface-2)`, 1px border `var(--v2-border-hairline)`, radius `var(--v2-r-button)`, options: `name ↓`, `name ↑`, `price ↓`, `price ↑`, `30D ↓`, `30D ↑`. Trailing caret.
2. `VIEW` label + a two-button segmented toggle: `dense` (active) / `comfortable`. Active state: background `var(--v2-bg-surface-2)`, text `var(--v2-text-primary)`. Inactive: transparent, `var(--v2-text-tertiary)`.

20px gap below the toolbar before the table.

### 2.6 Catalog table (`.price-v2-table`)

Same card outer treatment as Active estimates table: `var(--v2-bg-surface)`, 1px border `var(--v2-border-hairline)`, radius `var(--v2-r-card)`, `table-layout: fixed`.

**Column spec:**

| # | Header (small-caps mono) | Width | Align | Body font |
|---|---|---|---|---|
| 1 | (drag handle) | 32px | center | `☰` glyph in `var(--v2-text-tertiary)`, cursor: grab |
| 2 | `SKU` | 100px | left | mono 400 0.85rem `var(--v2-text-primary)` |
| 3 | `NAME` | flex / fill | left | sans 600 0.88rem `var(--v2-text-primary)` |
| 4 | `UNIT · COVERAGE` | 150px | left | Two lines: unit mono 400 0.85rem `var(--v2-text-primary)` (e.g. `bag · 94 lb`) + coverage mono 400 0.78rem `var(--v2-text-tertiary)` (e.g. `12 sq·ft/bag`) |
| 5 | `CATEGORY` | 140px | left | One phase chip (use chip palette by mapping category to chip class) |
| 6 | `PRICE` | 90px | right | mono 500 0.95rem `var(--v2-text-primary)` (e.g. `$18.95`) |
| 7 | `30D` | 80px | right | Trend pill: arrow + percent. Up: `↑ +2.1%` in `var(--v2-status-dot-green)`. Down: `↓ -3.2%` in `var(--v2-status-dot-amber)`. Flat: em-dash `—` in `var(--v2-text-tertiary)`. Mono 400 0.78rem. |

Column-header row padding `10px 20px`, bottom 1px hairline. Data row padding `14px 20px`. Row hover: `var(--v2-bg-surface-hover)`.

**Verbatim sample rows (from PDF page 5):**

| SKU | Name | Unit · Coverage | Category | Price | 30D |
|---|---|---|---|---|---|
| CEM-IIA | Portland Cement Type II | bag · 94 lb / 12 sq·ft/bag | ● GRAY COAT | $18.95 | ↑ +2.1% |
| CEM-IIB | Portland Cement Type II/V | bag · 94 lb / 12 sq·ft/bag | ● GRAY COAT | $19.40 | ↑ +2.1% |
| OC-STD | One-Coat Stucco · Standard | bag · 80 lb / 24 sq·ft/bag | ● COLOR COAT | $21.60 | — |
| OC-ALM | One-Coat Stucco · Almond | bag · 80 lb / 24 sq·ft/bag | ● COLOR COAT | $22.80 | ↑ +1.4% |
| OC-SND | One-Coat Stucco · Sandstone | bag · 80 lb / 24 sq·ft/bag | ● COLOR COAT | $22.80 | ↑ +1.4% |
| SND-PL | Plaster Sand · Graded | ton / 90 sq·ft/ton | ● AGGREGATE | $64.50 | ↓ -3.2% |
| SND-MS | Masonry Sand · Fine | ton / 90 sq·ft/ton | ● AGGREGATE | $58.20 | ↓ -3.2% |
| LIM-HY | Hydrated Lime · Type S | bag · 50 lb / 90 sq·ft/bag | ● GRAY COAT | $16.40 | ↑ +0.8% |
| FBR-PP | Polypropylene Fiber Mesh | bag · 1 lb / per cu yd | ● GRAY COAT | $11.20 | — |
| BND-AC | Acrylic Bonding Agent | gallon / 300 sq·ft/gal | ● COLOR COAT | $38.50 | ↑ +4.0% |

(Add 2 more rows to reach 12 visible.)

### 2.7 Footer row

Below the table, single horizontal row (`.price-v2-footer`), padding `16px 0`, flex space-between, sans 400 0.78rem.

**Left:** `Showing 12 of 142 · 0 selected` — `var(--v2-text-secondary)`. The number "0 selected" updates as rows are checked (future affordance — leave the structure).

**Right:** `Catalog total value: $8.4k · Avg margin: 2.1% supplier` — `var(--v2-text-secondary)` with the dollar value in mono 500 `var(--v2-text-primary)`.

### 2.8 Mobile collapse rules

At `<900px`: sidebar collapses to a horizontal scrollable supplier-pill row at the top (existing `.supplier-pills` pattern reused but restyled). Filter checkboxes move into a `Filter ⌄` dropdown next to Search. At `<768px`: hide columns `UNIT · COVERAGE` and `30D`; show 4 columns (SKU / NAME+chip / PRICE / trend). The drag handle hides.

### 2.9 Interaction notes

- Click supplier row → re-renders main column for that supplier.
- Filter checkboxes are additive within the table; each click triggers `renderMaterialTable()`.
- Sort dropdown changes the active sort field; clicking the same field again toggles direction.
- Drag handle on a row supports row reordering (existing `dragStart`/`dropRow` handlers in `app.js`).
- Click on SKU/Name cell opens an inline edit row (existing `editMaterial` handler).
- `+ New item` opens the `addMaterialModal` (existing).
- 30D trend cell: clicking opens a price-history popover (use existing `priceHist` data on each material).

### 2.10 1:1 vs. flexibilities

**Must be 1:1:** Two-column layout (240px sidebar + flex main), supplier list ordered exactly as listed with the active row visually distinct, filter checkbox list ordered with `All categories` first, table columns in the exact order and widths above, the 30D trend column rendered as arrow+percent with green/red/dash, the eyebrow text `03 · PRICING · STUC-O-FLEX`.

**Flex:** Custom checkbox icon style; sparkline alternative to arrow+percent (acceptable to render a tiny inline sparkline svg if data is available); exact glyph for drag handle; sticky sidebar offset.

---

## 3. Orders

### 3.1 Design summary

The Orders page is a **printable order sheet** rendered to screen with a right-rail control panel. The left column looks like an actual paper purchase order: company letterhead at the top, order number top-right, deliver-to block + filter-by chips, and grouped line-items by phase, each phase section showing supplier + PO number + subtotal. The right rail carries the order status badge, phase filters, group-by toggle, and the print/email/export actions. The orange `Print order →` CTA dominates the right rail. The order paper card uses a slightly elevated `var(--v2-bg-surface)` and feels deliberately document-like, while the right rail is flatter.

### 3.2 Layout structure

```
.order-v2-page {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 32px;
  padding: 24px 40px 64px;
  max-width: 1440px;
  margin: 0 auto;
}
```

At `<1024px`, rail wraps below paper. At print media query, hide rail entirely (`@media print { .order-v2-rail { display: none } }`).

### 3.3 Order paper card (`.order-v2-paper`)

Single rounded card: `var(--v2-bg-surface)`, 1px border `var(--v2-border-hairline)`, radius `var(--v2-r-card)`, padding `32px 36px`.

**Letterhead row** (flex space-between, bottom 1px hairline divider, padding-bottom 18px, margin-bottom 24px):

- **Left (stacked):**
  1. Brand mark (the same `.v2-brand-mark` from topnav) + company name `Mendoza Stucco & Stone` in sans 600 1.0rem.
  2. Sub-line `2204 Foothill Rd · Pasadena CA 91103 · C-35 Lic. 1042918` in sans 400 0.78rem `var(--v2-text-tertiary)`.
- **Right (stacked, right-aligned):**
  1. Eyebrow `MATERIAL ORDER` — small-caps mono `var(--v2-text-tertiary)`.
  2. Order number `O-2419` — mono 500 1.4rem `var(--v2-text-primary)`, letter-spacing 0.02em.
  3. Sub-line `Print 2026-05-12 · Deliver Jun 03` — mono 400 0.78rem `var(--v2-text-tertiary)`.

**Deliver-to + Filter row** (flex, two columns, gap 32px, bottom 1px hairline divider with padding-bottom 20px and margin-bottom 24px):

- **Deliver to block** (left):
  - Eyebrow `DELIVER TO` — small-caps mono.
  - Line 1: `Hernandez Residence · J-2419` — sans 600 0.95rem `var(--v2-text-primary)`. Job slug in mono `var(--v2-text-tertiary)`.
  - Line 2: `4218 Briar Creek Dr, Pasadena CA 91103` — sans 400 0.85rem `var(--v2-text-secondary)`.
  - Line 3: `Contact: R. Mendoza · (626) 555-0184` — sans 400 0.85rem `var(--v2-text-secondary)`.
- **Filter by block** (right):
  - Eyebrow `FILTER BY` — small-caps mono.
  - Row of phase chips: `● LATH  ● GRAY COAT  ● ACCESSORIES`. Each chip is the standard chip from `spec.md §1.1`. Two states: active (full color) and inactive (reduced 0.4 opacity). On the PDF all three shown are active.
  - Sub-line below chips: `12 line items · 3 phases · 2 suppliers` — sans 400 0.78rem `var(--v2-text-tertiary)`.

### 3.4 Phase line-item groups

Each phase section is a stacked block separated from the next by 28px vertical margin.

**Group header row** (flex space-between, padding-bottom 12px, bottom 1px hairline divider, margin-bottom 8px):

- **Left cluster** (gap 12px): phase chip (`● LATH`), then supplier name in sans 500 0.88rem `var(--v2-text-primary)` (`Pacific Supply`), then PO number in mono 400 0.78rem `var(--v2-text-tertiary)` (`PO-2419-A`).
- **Right:** phase subtotal in `Fraunces 500` ~1.2rem `var(--v2-text-primary)`, tabular numerals (e.g. `$1,394.24`).

**Items table** under each group:

| Col | Header | Width | Align | Body |
|---|---|---|---|---|
| 1 | `SKU` | 110px | left | mono 400 0.85rem `var(--v2-text-primary)` (e.g. `200004953`) |
| 2 | `ITEM` | flex | left | sans 400 0.88rem `var(--v2-text-primary)` |
| 3 | `QTY  UNIT` | 110px | right | qty in mono 500 0.95rem then 6px gap then unit in sans 400 0.78rem `var(--v2-text-tertiary)` (e.g. `14 roll`) |
| 4 | `EACH` | 90px | right | mono 400 0.85rem `var(--v2-text-secondary)` (e.g. `$44.00`) |

Column header row uses small-caps mono `var(--v2-text-tertiary)`, padding `8px 0`, bottom 1px hairline. Data row padding `10px 0`, no bottom border (a phase group reads as a single block).

**Verbatim line items (Lath group, Pacific Supply PO-2419-A — total $1,394.24):**

| SKU | Item | Qty Unit | Each |
|---|---|---|---|
| 200004953 | Stucco Netting 20ga Self-Furred 36×150 | 14 roll | $44.00 |
| 200007102 | Stucco Wire 17ga Self-Furred 36×150 | 6 roll | $74.00 |
| 200007110 | Metal Lath 1.75 lb Galv · 2 sqyd/pc | 32 piece | $5.00 |
| 200007293 | Bostitch 1" Staples · 10M | 4 box | $30.72 |
| 200005003 | CornerAid Straight 10' | 24 piece | $2.14 |

**Verbatim line items (Gray Coat group, Pacific Supply PO-2419-B — total $9,677.10):**

| SKU | Item | Qty Unit | Each |
|---|---|---|---|
| 200012105 | Portland Cement Type II · 94 lb | 320 bag | $18.95 |
| 200012220 | Plaster Sand · Graded | 43 ton | $64.50 |
| 200012414 | Hydrated Lime · Type S · 50 lb | 43 bag | $16.40 |
| 200012516 | PP Fiber Mesh · 1 lb | 12 bag | $11.20 |

(Color Coat / Accessories groups follow the same structure with their items.)

### 3.5 Right rail (`.order-v2-rail`)

Single column, three stacked sections.

**Section A — Order header:**
- Eyebrow `04 · ORDER` — small-caps mono `var(--v2-text-tertiary)`.
- Order number `O-2419` — mono 500 1.4rem `var(--v2-text-primary)`. Margin-bottom 8px.
- Status pill `● Open` — pill, `var(--v2-bg-surface-2)`, 1px border `var(--v2-border-hairline)`, padding `4px 10px 4px 8px`, sans 500 0.75rem; the dot is `var(--v2-status-dot-green)`.

24px bottom margin.

**Section B — Filter rows:**
- Eyebrow `FILTER ROWS` — small-caps mono.
- 4 rows, each with a custom checkbox (same style as Pricing filter checkbox), label (sans 400 0.88rem `var(--v2-text-primary)`), and count (mono 400 0.85rem `var(--v2-text-tertiary)` pushed right):

| Filter | Count |
|---|---|
| Lath ✓ | 5 |
| Gray Coat ✓ | 4 |
| Accessories ✓ | 3 |
| Color Coat ☐ | 0 |

Row padding `8px 0`. 24px bottom margin.

**Section C — Group by:**
- Eyebrow `GROUP BY` — small-caps mono.
- Three radio-like rows (single-select), same styling as checkboxes but indicating mutual exclusion (filled dot when active):

| Group | State |
|---|---|
| Supplier | ● (active) |
| Phase | ○ |
| Delivery date | ○ |

32px bottom margin.

**Section D — CTAs (sticky to bottom of viewport on tall pages):**
1. `Print order →` — primary CTA full-width pill, height 44px, `var(--v2-accent)`, text `#1a0e08`, sans 600 0.95rem, trailing `→`.
2. `Email to supplier` — secondary full-width pill, height 44px, `var(--v2-bg-surface-2)`, 1px border `var(--v2-border-hairline)`, text `var(--v2-text-primary)`, sans 500 0.95rem. 8px top margin.
3. `Export CSV` — tertiary text link, full-width centered, sans 500 0.85rem `var(--v2-text-secondary)`. 8px top margin.

### 3.6 Mobile collapse rules

At `<1024px`, right rail wraps below paper. At `<768px`: collapse paper letterhead from two-column to stacked (company on top, order number below). Item tables hide the `EACH` column (move into a second line under the item name as `$44.00 each`). Right rail Filter & Group sections collapse into a `Filters` accordion. CTAs become a fixed bottom action bar.

### 3.7 Interaction notes

- Filter checkboxes filter line-items in real time (re-render line-item groups).
- Group-by radio re-groups: by Supplier (the default, supplier name is the group axis), by Phase (phase is the axis), by Delivery date (dates are the axis with format `Jun 03`).
- `Print order →` calls the existing `printOrder` handler.
- `Email to supplier` opens a mailto: pre-filled with the order paper as body (or eventually an in-app email composer).
- Editing a qty inline (existing `order-qty-input` pattern) re-totals the phase subtotal and the global subtotal.

### 3.8 1:1 vs. flexibilities

**Must be 1:1:** Letterhead structure (logo + company / order# + deliver date), eyebrow text `04 · ORDER`, order number `O-2419`, deliver-to + filter-by side-by-side blocks, phase group header (chip + supplier + PO# + subtotal), 4-column items table, right rail eyebrows `04 · ORDER` / `FILTER ROWS` / `GROUP BY` and the three CTAs in order.

**Flex:** Whether deliver-date is shown in letterhead or rail header; specific PO-number suffix scheme (`-A`, `-B` is a convention but may be `-001`); whether the rail's status pill is positioned above or below the order number.

---

## 4. Bids

### 4.1 Design summary

Bids is the customer-facing proposal: a printable letterhead document with project block, scope-of-work line items by phase, financial subtotals, and a right rail that controls bid metadata, margin check, toggle-able line-item details, and send-via actions. The "Send via Email PDF" primary CTA dominates the right rail in orange. The bid paper is similar in structure to the order paper but reads more like a sales document (scope-of-work prose, sq·ft × rate = amount), not a SKU manifest.

### 4.2 Layout structure

```
.bid-v2-page {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 32px;
  padding: 24px 40px 64px;
  max-width: 1440px;
  margin: 0 auto;
}
```

At `<1024px`, right rail wraps below. At `<768px`, see mobile.

### 4.3 Bid paper card (`.bid-v2-paper`)

Same outer treatment as the order paper: `var(--v2-bg-surface)`, 1px border `var(--v2-border-hairline)`, radius `var(--v2-r-card)`, padding `32px 36px`.

**Letterhead row** (flex space-between, bottom 1px hairline divider, padding-bottom 18px, margin-bottom 24px):

- **Left (stacked):**
  1. Brand mark + company name `Mendoza Stucco & Stone` in sans 600 1.05rem.
  2. Line 1: `2204 Foothill Rd, Suite C · Pasadena CA 91103` — sans 400 0.85rem `var(--v2-text-secondary)`.
  3. Line 2: `C-35 Lic. 1042918 · (626) 555-0184 · billing@mendozastucco.com` — sans 400 0.78rem `var(--v2-text-tertiary)`.
- **Right (stacked, right-aligned):**
  1. Eyebrow `PROPOSAL` — small-caps mono.
  2. Proposal number `B-2419` — mono 500 1.4rem `var(--v2-text-primary)`.
  3. Sub-line `Issued 2026-05-12 · Valid 30 days` — mono 400 0.78rem `var(--v2-text-tertiary)`.

**Prepared for + Project row** (flex, two columns gap 32px, bottom 1px hairline, padding-bottom 20px, margin-bottom 24px):

- **Prepared for:**
  - Eyebrow `PREPARED FOR` — small-caps mono.
  - Line 1: `Manuel & Sofia Hernandez` — sans 600 0.95rem `var(--v2-text-primary)`.
  - Line 2: `4218 Briar Creek Drive` — sans 400 0.85rem `var(--v2-text-secondary)`.
  - Line 3: `Pasadena, CA 91103` — sans 400 0.85rem `var(--v2-text-secondary)`.
- **Project:**
  - Eyebrow `PROJECT` — small-caps mono.
  - Line 1: `Exterior stucco re-coat` — sans 600 0.95rem.
  - Line 2: `3,840 sq·ft wall area · 3 elevations` — sans 400 0.85rem `var(--v2-text-secondary)`.
  - Line 3: `Estimated start 2026-06-04 · 11 working days` — sans 400 0.78rem `var(--v2-text-tertiary)`.

### 4.4 Scope-of-work line items

A 4-column table; each row is one phase with its scope text. Outer no card — sits directly on the bid paper.

**Column header row** (padding `10px 0`, bottom 1px hairline, font small-caps mono `var(--v2-text-tertiary)`):

| Col | Header | Width | Align |
|---|---|---|---|
| 1 | `PHASE` | 130px | left |
| 2 | `SCOPE OF WORK` | flex | left |
| 3 | `SQ·FT` | 80px | right |
| 4 | `RATE` | 80px | right |
| 5 | `AMOUNT` | 110px | right |

**Data rows** (padding `18px 0`, vertical alignment top, bottom 1px hairline between rows):

- **Phase cell:** one phase chip aligned to top, full chip styling from `spec.md §7`.
- **Scope-of-work cell:** sans 400 0.88rem `var(--v2-text-primary)` text, multi-line, max 3 lines visible (`line-clamp: 3`).
- **Sq·ft cell:** mono 500 0.95rem `var(--v2-text-primary)` (e.g. `3,840`).
- **Rate cell:** mono 400 0.85rem `var(--v2-text-secondary)` (e.g. `$4.80`).
- **Amount cell:** `Fraunces 500` ~1.05rem `var(--v2-text-primary)` tabular (e.g. `$18,432`).

**Verbatim phase rows:**

| Phase chip | Scope of work | Sq·ft | Rate | Amount |
|---|---|---|---|---|
| ● LATH | Strip and dispose of existing lath; install 60-min Grade D paper, 2.5lb galv K-lath fastened 6" o.c. with 7/8" galv staples; corner bead at all outside corners and openings. | 3,840 | $4.80 | $18,432 |
| ● BROWN COAT | 3/8" scratch & brown coat using Type II portland with graded plaster sand and PP fiber. Wood-float finish, ready for color coat at 14 days. | 3,840 | $5.20 | $19,968 |
| ● COLOR COAT | One-coat stucco in Almond Cream, hand-applied, sand finish. Acrylic bonding primer prior to application; touch-ups included. | 3,840 | $4.10 | $15,744 |
| ● PREP & CLEANUP | Masking, scaffold, daily cleanup, final wash-down and dumpster. All debris hauled off site. | — | — | $4,200 |

Note: `BROWN COAT` reuses `.v2-chip.gray-coat` palette (same pale-pink hue per `spec.md §1.1`). `PREP & CLEANUP` reuses `.v2-chip.accessories` (peach).

### 4.5 Financial subtotal block

Sits directly below the line-item table, right-aligned (the left side stays blank — bid totals visually anchor to the right column under AMOUNT). Three stacked rows + final total.

Each row is `display: flex; justify-content: flex-end; gap: 32px;` with the label on the left of the cluster and the amount on the right.

- **Subtotal row:**
  - Left: `Subtotal` sans 500 0.95rem `var(--v2-text-primary)`; sub-line `4 phases` sans 400 0.78rem `var(--v2-text-tertiary)`.
  - Right: `$58,344` mono 500 1.0rem.
- **CA sales tax row:**
  - Left: `CA sales tax` sans 500 0.95rem; sub-line `8.25% · materials` sans 400 0.78rem `var(--v2-text-tertiary)`.
  - Right: `$4,813.38` mono 500 1.0rem.
- **CC processing fee row:**
  - Left: `CC processing fee` sans 500 0.95rem; sub-line `3.1% · optional` sans 400 0.78rem `var(--v2-text-tertiary)`.
  - Right: `$1,831.56` mono 500 1.0rem.

Each row vertical padding 10px, 1px hairline below.

**Total row:**
- Left: `Total` sans 600 1.0rem.
- Right: `$64,988.94` (or the actual final number) — `Fraunces 500` ~1.5rem `var(--v2-accent)`, tabular numerals. The total reuses the customer-price accent color treatment from `spec.md §6.2`.
- Top padding 14px, no bottom border, top 1px border `var(--v2-border-strong)`.

### 4.6 Right rail (`.bid-v2-rail`)

Single column, five stacked sections.

**Section A — Bid header:**
- Eyebrow `04 · BID` — small-caps mono.
- Bid number `B-2419` — mono 500 1.4rem.
- Status pills row (flex gap 6px): `● Draft` and `● Stucco`. Both chips use the standard pill style (`spec.md §6` for Draft style — the dot is `var(--v2-status-dot-amber)` for Draft); `● Stucco` uses `.v2-chip.color-coat` for the green hue. 24px bottom margin.

**Section B — Margin check:**
- Eyebrow `MARGIN CHECK` — small-caps mono.
- Big number row: `31.4` (`Fraunces 500` ~2rem `var(--v2-accent)`) + `%` (mono 500 1rem `var(--v2-text-secondary)`, baseline-aligned).
- Sub-line `vs 28% target` — sans 400 0.78rem `var(--v2-text-secondary)`. 24px bottom margin.

**Section C — Toggle in proposal:**
- Eyebrow `TOGGLE IN PROPOSAL` — small-caps mono.
- 5 checkbox rows (same checkbox style as Pricing/Orders):

| Checkbox | State |
|---|---|
| Show line breakdown | ✓ |
| Itemize sales tax | ✓ |
| Show material list | ☐ |
| CC processing fee | ✓ |
| Per-sqft pricing | ☐ |

Row padding `8px 0`. 24px bottom margin.

**Section D — Send via:**
- Eyebrow `SEND VIA` — small-caps mono.
- 3 stacked action rows:
  1. `Email PDF ⤴` — primary full-width pill, height 40px, `var(--v2-accent)`, text `#1a0e08`, sans 600 0.92rem, trailing send icon `⤴`.
  2. `Print` — secondary full-width pill, height 40px, `var(--v2-bg-surface-2)` + 1px border, sans 500 0.92rem.
  3. `Copy public link` — tertiary text link, full-width centered, sans 500 0.85rem `var(--v2-text-secondary)`. 24px bottom margin.

**Section E — Saved timestamp:**
- Sans 400 0.78rem `var(--v2-text-tertiary)`: `Saved 11:42 · Linked to job J-2419`. Job slug in mono.

### 4.7 Mobile collapse rules

At `<1024px`, right rail wraps below paper. At `<768px`: letterhead stacks; phase + scope cells merge so chip + amount are on row 1 and scope text is on row 2; the sq·ft and rate columns collapse into a single `3,840 × $4.80` sub-line under the scope text. Right rail toggles become an accordion.

### 4.8 Interaction notes

- Toggle checkboxes in rail re-render the bid paper live: hide/show financial rows, show/hide material list section, etc.
- `Email PDF` opens a send modal (out of scope here).
- `Copy public link` generates a shareable view-only URL and toasts confirmation.
- Margin check: if margin < target the number color flips from `var(--v2-accent)` to `var(--v2-status-dot-amber)` (the design specs them with the same hex but treat as semantic).
- Editing a phase rate inline updates Amount and recalculates Total / Margin live.

### 4.9 1:1 vs. flexibilities

**Must be 1:1:** Letterhead row structure, eyebrow `04 · BID`, B-2419 number, "Welcome back" → no — "Prepared for + Project" two-column block, scope-of-work 5-column table with chip in col 1, financial subtotal stack ending with a `Fraunces` orange Total, right rail eyebrows `MARGIN CHECK` / `TOGGLE IN PROPOSAL` / `SEND VIA`, 5 toggle checkboxes in exact order with the marked default states.

**Flex:** Whether Margin number color flips on under-target or always renders accent; exact send-icon glyph; whether Total renders with cents or rounded.

---

## 5. Saved Jobs

### 5.1 Design summary

Saved Jobs is the library / archive: a flat single-column page with a header, search + filter-tabs row, and a long table of all jobs (active, won, sent, drafts, templates). Each row is a fast-scan entry: job code, name + client, phase chips, sq·ft + date, status pill, total. The footer carries aggregate stats. No right rail. The page reads like an email inbox or a CRM list.

### 5.2 Layout structure

```
.jobs-v2-page {
  padding: 24px 40px 64px;
  max-width: 1280px;
  margin: 0 auto;
}
```

Single column; no sidebar. At `<768px`, see mobile.

### 5.3 Header zone

**Left (stacked):**
1. Eyebrow `06 · SAVED JOBS` — small-caps mono `var(--v2-text-tertiary)`.
2. Title `Library` — `Fraunces 500` ~2.0rem.
3. Subtitle `32 jobs · 6 templates · search, filter, duplicate` — sans 400 0.88rem `var(--v2-text-secondary)`. The `·` separators in `var(--v2-text-tertiary)`.

**Right (16px gap):**
1. `Templates` text link — sans 500 0.85rem `var(--v2-text-secondary)` → `var(--v2-text-primary)` hover.
2. `+ New job` primary CTA pill — 36px height, `var(--v2-accent)`, text `#1a0e08`, sans 600 0.88rem.

1px hairline divider beneath, 20px above/below.

### 5.4 Search + filter tabs row

Single horizontal row, flex space-between, 24px bottom margin.

**Left:** Search input `.jobs-v2-search`, width 400px, height 32px, same styling as Pricing search. Placeholder `Search by job, client, address…`.

**Right (gap 0, segmented):** Filter tabs `.jobs-v2-tabs` — a single pill-shaped container holding 6 buttons in a horizontal row. Container background `var(--v2-bg-surface-2)`, 1px border `var(--v2-border-hairline)`, radius `var(--v2-r-pill)`, padding 3px. Each tab: padding `6px 14px`, sans 500 0.82rem, radius `var(--v2-r-pill)`. Active tab: background `var(--v2-bg-surface)` (slightly darker than its container — appears inset), text `var(--v2-text-primary)`. Inactive: transparent background, `var(--v2-text-secondary)`. Tabs in order: `All` (active by default) `Active` `Won` `Sent` `Drafts` `Templates`.

### 5.5 Jobs table (`.jobs-v2-table`)

Same card treatment as Active estimates: `var(--v2-bg-surface)`, 1px border `var(--v2-border-hairline)`, radius `var(--v2-r-card)`, `table-layout: fixed`.

**Column spec:**

| # | Header (small-caps mono `var(--v2-text-tertiary)`) | Width | Align | Body |
|---|---|---|---|---|
| 1 | `JOB ·#` | 80px | left | mono 400 0.85rem `var(--v2-text-primary)` (e.g. `J-2419`, `TPL-01` for templates) |
| 2 | `NAME / CLIENT` | flex | left | Two lines: name sans 600 0.88rem + client sans 400 0.78rem `var(--v2-text-tertiary)` |
| 3 | `PHASES` | 230px | left | One or more phase chips (wrapping allowed, gap 4px) |
| 4 | `SQ·FT  DATE` | 140px | right | sqft mono 500 + date mono 400 0.78rem (`2026-05-12` ISO-ish). For templates the sqft is em-dash `—`. |
| 5 | `STATUS` | 100px | left | Status pill (colored by state — see palette below) |
| 6 | `TOTAL` | 90px | right | mono 500 0.95rem `var(--v2-text-primary)` (e.g. `$28.4k`). For templates the total is em-dash `—`. |

Column header row padding `10px 20px`, bottom 1px hairline. Data row padding `16px 20px`, bottom 1px hairline (except last row).

**Status pill palette:**

| Status | Dot color | Pill background | Pill text |
|---|---|---|---|
| Draft | `var(--v2-status-dot-amber)` | `var(--v2-badge-surface-neutral)` | `var(--v2-text-primary)` |
| Active | `var(--v2-status-dot-green)` | `var(--v2-badge-surface-neutral)` | `var(--v2-text-primary)` |
| Won | `var(--v2-status-dot-green)` | `var(--v2-badge-surface-neutral)` | `var(--v2-text-primary)` |
| Sent | `#a0c4e4` (pale slate blue dot) | `var(--v2-badge-surface-neutral)` | `var(--v2-text-primary)` |
| Lost | `#8a4a3d` (muted brick) | `var(--v2-badge-surface-neutral)` | `var(--v2-text-secondary)` |

**Verbatim rows (from PDF page 8):**

| Job | Name / client | Phases | Sq·ft / Date | Status | Total |
|---|---|---|---|---|---|
| J-2419 | Hernandez Residence / M. Hernandez | ● LATH  ● GRAY COAT  ● COLOR COAT | 3,840 / 2026-05-12 | ● Draft | $28.4k |
| J-2417 | Westridge Townhomes / BRG Construction | ● GRAY COAT  ● COLOR COAT  ● ACCESSORIES | 12,480 / 2026-05-09 | ● Active | $88.2k |
| J-2415 | Oak Park Auto / D. Klein | ● LATH  ● GRAY COAT  ● ACCESSORIES | 6,240 / 2026-05-07 | ● Active | $41.6k |
| J-2413 | Glenmore Family Dental / Glenmore LLC | ● PAINTING | 2,150 / 2026-04-28 | ● Won | $14.8k |
| J-2410 | Marina Cottages 3 & 4 / B. Tellez | ● COLOR COAT  ● ACCESSORIES | 5,360 / 2026-04-22 | ● Sent | $37.0k |
| J-2406 | Westwood Café Patio / A. Park | ● STONE  ● GRAY COAT | 980 / 2026-04-14 | ● Lost | $12.5k |
| TPL-01 | Single-story stucco / Template | ● LATH  ● GRAY COAT  ● COLOR COAT | — / 2026-03-02 | ● Draft | — |
| TPL-02 | Repaint exterior / Template | ● PAINTING | — / 2026-02-18 | ● Draft | — |

Note: `STONE` chip uses `.v2-chip.aggregate` palette (warm taupe) since stone-veneer doesn't have its own dedicated chip in `spec.md §1.1`. (Builder may map "Stone" to `.v2-chip.aggregate` or create a dedicated `.v2-chip.stone` if desired — see flexibilities below.)

### 5.6 Footer

Below the table, single horizontal row (`.jobs-v2-footer`), padding `16px 0`, flex space-between, sans 400 0.78rem `var(--v2-text-secondary)`.

**Left:** `Showing 8 of 38 · YTD value $612.4k` — dollar amount in mono 500 `var(--v2-text-primary)`.

**Right:** `Avg margin 30.8% · Win rate 64%` — percentages in mono 500 `var(--v2-text-primary)`.

### 5.7 Mobile collapse rules

At `<768px`: hide `PHASES` and `STATUS` columns; merge phase chips into name cell as line 3 (wrap, gap 4px); merge status pill into name cell after the client sub-line. Result is 4 visible columns (JOB·# / NAME+meta / SQ·FT+DATE / TOTAL).

### 5.8 Interaction notes

- Filter tab click sets a status filter and re-renders (existing handler infrastructure in `renderSavedJobs`).
- Row click loads the job into calculator (`loadJob`).
- Each row has hover-revealed action buttons at the right edge: `Load` / `Duplicate` / `Delete` — keep the existing buttons but render them inline only on hover; in default state show just the chevron `›` at the right edge.
- `+ New job` resets calculator and navigates.
- `Templates` link filters the tab to `Templates`.

### 5.9 1:1 vs. flexibilities

**Must be 1:1:** Header eyebrow `06 · SAVED JOBS`, title `Library`, subtitle `32 jobs · 6 templates · search, filter, duplicate`, 6 filter tabs in exact order, 6-column table, status pill colors keyed to state, footer aggregate stats text format.

**Flex:** Stone chip palette choice; date format (`2026-05-12` ISO vs. `May 12`); hover-action buttons may be replaced by a row-level kebab menu `⋯`.

---

## 6. Admin

### 6.1 Design summary

Admin is the operator console: a fully utilitarian page with a 5-up metric strip, a generate-license-keys form, and two side-by-side tables (License keys + Users). No right rail. The page reads like a stripped-down SaaS admin panel — flat, dense, technical. The "Generate keys →" primary CTA sits in the header right.

### 6.2 Layout structure

```
.admin-v2-page {
  padding: 24px 40px 64px;
  max-width: 1440px;
  margin: 0 auto;
}
```

Single column at any width; the two tables become a 2-column grid only on `>=1100px`. At `<768px`, see mobile.

### 6.3 Header zone

**Left (stacked):**
1. Eyebrow `07 · ADMIN · OPERATOR CONSOLE` — small-caps mono.
2. Title `License & user management` — `Fraunces 500` ~2.0rem.
3. Subtitle `EstiCount is your SaaS — manage trial keys, lifetime licenses, and active accounts.` — sans 400 0.88rem `var(--v2-text-secondary)`.

**Right (16px gap):**
1. `View as user` text link — sans 500 0.85rem `var(--v2-text-secondary)` → `var(--v2-text-primary)` hover. (Wires to existing `toggleAdminView` handler.)
2. `Generate keys →` primary CTA pill — 36px height, `var(--v2-accent)`, text `#1a0e08`, sans 600 0.88rem, trailing `→`. (Scrolls to and focuses the generate-keys form.)

1px hairline divider below, 20px above/below.

### 6.4 Metric strip (5-up)

Identical card pattern to Dashboard/Calculator metrics strips but with 5 cells and 1px vertical hairlines between them.

Each cell layout:
- Row 1: small-caps mono label `var(--v2-text-tertiary)`.
- Row 2: `Fraunces 500` ~2rem `var(--v2-text-primary)` for the main number; for fractional cells (`Active users 4/5`) the `/5` denominator renders in mono 500 1.0rem `var(--v2-text-secondary)` baseline-aligned.
- Row 3: sub-line sans 400 0.78rem `var(--v2-text-secondary)`.

**Verbatim cells:**

| Cell | Label | Big number | Denom / unit | Sub-line |
|---|---|---|---|---|
| 1 | `ACTIVE USERS` | `4` | ` / 5` | `1 trial` |
| 2 | `LIFETIME` | `2` | — | `no expiry` |
| 3 | `MONTHLY` | `1` | — | `renews 06-08` |
| 4 | `KEYS UNUSED` | `2` | ` / 6` | `0 trial expired` |
| 5 | `MRR` | `$348` | — | `↑ +12% MoM` — arrow `↑` in `var(--v2-accent)` |

Cell padding `16px 20px`. 28px bottom margin.

### 6.5 Generate license keys form (`.admin-v2-genform`)

Single card: `var(--v2-bg-surface)`, 1px border `var(--v2-border-hairline)`, radius `var(--v2-r-card)`, padding `24px`.

Card header row:
- Eyebrow `GENERATE LICENSE KEYS` — small-caps mono. (No subtitle.)

Body row (`display: grid; grid-template-columns: 200px 120px 120px 1fr auto; gap: 16px; align-items: end;`):

| Field | Width | Type | Verbatim default value |
|---|---|---|---|
| `TYPE` | 200px | Dropdown | `Trial · 7 days` (other options: `Monthly · 30 days`, `Yearly · 365 days`, `Lifetime`) |
| `MAX USES` | 120px | Number input | `1` |
| `QUANTITY` | 120px | Number input | `5` |
| `PREFIX` | 1fr | Read-only display | `EC-TRI-XXXXXX…` — dynamic based on Type. Mono 400 0.85rem `var(--v2-text-tertiary)`. |
| (action) | auto | Button | `Generate` primary, 36px height, `var(--v2-accent)` background |

Each field: small-caps mono label `var(--v2-text-tertiary)` on top, input below. Input style: height 36px, `var(--v2-bg-input)`, 1px border `var(--v2-border-hairline)`, radius `var(--v2-r-input)`, mono 500 0.95rem `var(--v2-text-primary)` for number inputs, sans 500 0.95rem for the dropdown.

Below the row, a single line of helper text:
`5 keys · 7d each · single-use · downloadable as CSV` — sans 400 0.78rem `var(--v2-text-tertiary)`. This text is **dynamic**: it reflects the current form state (count, type duration, max-uses pluralization).

24px bottom margin.

### 6.6 Tables row

Two side-by-side cards (`display: grid; grid-template-columns: 1fr 1fr; gap: 24px;`).

#### 6.6.1 License keys table (`.admin-v2-keys`)

Card outer: same treatment as other tables.

Card header:
- Eyebrow `LICENSE KEYS · 6` — small-caps mono. Count is dynamic.
- Right of eyebrow: `Click to copy` — sans 400 0.78rem `var(--v2-text-tertiary)`.

**Column spec:**

| Col | Header | Width | Align | Body |
|---|---|---|---|---|
| 1 | `KEY` | flex | left | mono 400 0.82rem `var(--v2-text-primary)`, letter-spacing 0.02em (e.g. `EC-LIF-7D2E91F408A6B3CC`) |
| 2 | `TYPE` | 80px | left | Type label colored by type — lifetime: `var(--v2-status-dot-green)`, monthly: `var(--v2-accent)`, trial: `var(--v2-text-secondary)` — sans 500 0.78rem |
| 3 | `DUR` | 50px | left | mono 400 0.82rem `var(--v2-text-secondary)` (e.g. `∞`, `30d`, `7d`) |
| 4 | `USES` | 50px | left | mono 400 0.82rem `var(--v2-text-secondary)` (e.g. `1/1`, `0/1`) |
| 5 | `BY` | 100px | left | sans 400 0.85rem `var(--v2-text-secondary)` (e.g. `Daniel C.`, `Unused`) |

Column header row padding `10px 16px`, bottom 1px hairline. Data row padding `12px 16px`, bottom 1px hairline. Row hover: `var(--v2-bg-surface-hover)`, cursor: copy. On click, copy the full key string to clipboard and flash a `✓ Copied` toast.

**Verbatim rows (from PDF page 9):**

| Key | Type | Dur | Uses | By |
|---|---|---|---|---|
| EC-LIF-7D2E91F408A6B3CC | lifetime | ∞ | 1/1 | Daniel C. |
| EC-LIF-1A0E55C7BB3F18D2 | lifetime | ∞ | 1/1 | Marco V. |
| EC-MON-A4F2D90C71BE335E | monthly | 30d | 1/1 | Lucia R. |
| EC-TRI-A0C7DC6F47B9E1AE | trial | 7d | 1/1 | Sam B. |
| EC-TRI-B6D49E1F0C28A37D | trial | 7d | 0/1 | Unused |
| EC-TRI-3F1A88E7D24B0F95 | trial | 7d | 0/1 | Unused |

#### 6.6.2 Users table (`.admin-v2-users`)

Card outer: same treatment.

Card header:
- Eyebrow `USERS · 5` — small-caps mono. Count is dynamic.

**Column spec:**

| Col | Header | Width | Align | Body |
|---|---|---|---|---|
| 1 | (avatar + name + email) | flex | left | 28px circular avatar (`var(--v2-bg-surface-2)` background, 1px border `var(--v2-border-hairline)`, initials in sans 600 0.7rem `var(--v2-text-primary)`) + two-line name (sans 600 0.88rem) + email (sans 400 0.78rem `var(--v2-text-tertiary)`) |
| 2 | `ROLE / LICENSE` | 160px | left | Two lines: role sans 500 0.82rem (`admin` → `var(--v2-accent)`, `estimator` / `foreman` → `var(--v2-text-secondary)`, `user` → `var(--v2-text-tertiary)`) + license sans 400 0.78rem `var(--v2-text-tertiary)` (`lifetime`, `monthly`, `trial`, `expired` — `expired` in `var(--v2-status-dot-amber)`) |
| 3 | `STATUS` | 32px | center | Single colored dot — `var(--v2-status-dot-green)` for active, `var(--v2-text-muted)` for inactive |

Column header row uses small-caps mono `var(--v2-text-tertiary)`, padding `10px 16px`. Data rows padding `12px 16px`, bottom 1px hairline.

**Verbatim rows:**

| Avatar | Name | Email | Role | License | Status |
|---|---|---|---|---|---|
| DC | Daniel Castillo | dancastlebiz@gmail.com | admin | lifetime | ● green |
| MV | Marco Vega | mvega@mendozastucco.com | estimator | lifetime | ● green |
| LR | Lucia Reyes | lreyes@mendozastucco.com | foreman | monthly | ● green |
| SB | Sam Bell | sambell@gmail.com | user | trial | ● green |
| JD | J. Doe | jdoe@example.com | user | expired | ● muted |

### 6.7 Mobile collapse rules

At `<1100px`, the two tables stack vertically. At `<768px`: metric strip becomes 2-column grid (last row has a single cell spanning both columns); generate-keys form fields stack vertically; tables hide the `BY` column (Keys) and `STATUS` column (Users — the green dot moves into the avatar cell as a small bottom-right badge).

### 6.8 Interaction notes

- **License keys row click:** copies full key to clipboard, toast `✓ Copied`.
- **User row click:** opens user-detail modal (out of scope visually).
- **Generate button:** existing `generateKeys` handler. Resulting keys append to top of the Keys table with a brief highlight animation.
- **Helper text** below form auto-updates on each input change.
- **`View as user`** link toggles admin mode off (existing `toggleAdminView`).

### 6.9 1:1 vs. flexibilities

**Must be 1:1:** Eyebrow text `07 · ADMIN · OPERATOR CONSOLE`, title `License & user management`, 5 metric cells in exact order with the verbatim labels, generate-keys form with 4 fields in order (Type / Max uses / Quantity / Prefix) + Generate button, two side-by-side tables Keys (5 cols) and Users (3 cols), license type color coding.

**Flex:** Exact prefix string format; whether status is a dot or a text pill; tables may have a tertiary action column (delete, revoke) — keep affordance for it.

---

## 7. Sign-in / Activate

### 7.1 Design summary

The Sign-in page is full-screen (not under the topnav). It uses a 50/50 two-column layout: a left "editorial dark" column with the EstiCount brand mark, a serif marketing headline with a single orange-accented phrase, supporting copy, and a 3-up stats strip; a right form column with the actual sign-in form, a divider, and a license-key activation panel. The page is the only place where the marketing voice surfaces — everywhere else the app is utilitarian. Both columns share `var(--v2-bg-app)` but the left column gets a very subtle grid-texture overlay (a faint 1px line every 20px in `var(--v2-border-hairline)` at low opacity) to evoke architectural blueprint paper.

### 7.2 Layout structure

```
.login-v2-screen {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
  background: var(--v2-bg-app);
}
.login-v2-left { padding: 56px 64px; position: relative; }
.login-v2-right { padding: 56px 64px; display: flex; flex-direction: column; }
```

At `<900px`, left column hides entirely; right column expands to 100% with `max-width: 480px; margin: 0 auto;`. At `<768px`, see mobile.

### 7.3 Left column (`.login-v2-left`)

**Top-left corner:** Brand mark + wordmark (the same `.v2-brand` + `.v2-brand-mark` + `.v2-brand-word` + `.v2-brand-pill` cluster from the topnav — `spec.md §2`).

**Middle (vertically centered in remaining space):**
1. Eyebrow `MATERIAL ESTIMATING · V4` — small-caps mono `var(--v2-text-tertiary)`. 12px bottom margin.
2. Editorial heading — three lines, `Fraunces 500` size ~3rem, line-height 1.1, `var(--v2-text-primary)`:
   - Line 1: `Bid faster.`
   - Line 2: `Order tighter.`
   - Line 3: `Build margin.` **with the entire phrase in `var(--v2-accent)`** — both words orange.
3. 24px bottom margin.
4. Supporting paragraph — sans 400 0.95rem `var(--v2-text-secondary)`, max-width 36ch, line-height 1.55:
   `The estimating tool stucco, stone, drywall & paint contractors actually keep open all day. Catalog → calculator → bid → order → profit.`
5. 40px bottom margin.
6. 3-up stats strip (`display: grid; grid-template-columns: repeat(3, auto); gap: 48px;`). Each stat is two-line:
   - Big number `Fraunces 500` ~2rem `var(--v2-text-primary)`.
   - Eyebrow + sub-line below: eyebrow `AVG BID TIME` etc. (small-caps mono `var(--v2-text-tertiary)`), sub-line `down from 3h` etc. (sans 400 0.78rem `var(--v2-text-secondary)`).

**Verbatim stats:**

| Number | Eyebrow | Sub-line |
|---|---|---|
| `38m` | AVG BID TIME | down from 3h |
| `2.4×` | JOBS / MONTH | per estimator |
| `$612k` | YTD BID | across 38 jobs |

**Bottom-left (absolute-positioned 24px from bottom):** Footer text in sans 400 0.78rem `var(--v2-text-tertiary)`:
`© 2026 EstiCount · Mendoza Industries`. Right side of footer (right-aligned within left column): `Lic C-35 · 1042918` in mono 400 0.78rem `var(--v2-text-tertiary)`.

### 7.4 Right column (`.login-v2-right`)

**Top-right corner:** Sans 400 0.85rem `var(--v2-text-secondary)`: `New here?` followed by `Create account →` text link in `var(--v2-text-primary)` (sans 500). Right-aligned.

**Middle (vertically centered):**

1. Eyebrow `01 · SIGN IN` — small-caps mono `var(--v2-text-tertiary)`. 12px bottom margin.
2. Title `Welcome back.` — `Fraunces 500` ~1.8rem `var(--v2-text-primary)`. 6px bottom margin.
3. Subtitle `Sign in to your EstiCount workspace.` — sans 400 0.95rem `var(--v2-text-secondary)`. 28px bottom margin.

**Sign-in form:**

A vertical stack with 16px row gaps.

- **Email field:**
  - Label `EMAIL` — small-caps mono `var(--v2-text-tertiary)`, 6px bottom margin.
  - Input full-width, height 44px, `var(--v2-bg-surface-2)`, 1px border `var(--v2-border-hairline)`, radius `var(--v2-r-input)`, padding `0 14px`, sans 400 0.95rem `var(--v2-text-primary)`. Placeholder `var(--v2-text-tertiary)`. On focus: border `var(--v2-accent)`.
  - Default value shown in PDF: `dancastlebiz@gmail.com` (the dynamic last-used email).
- **Password field:**
  - Label row (flex space-between): `PASSWORD` (small-caps mono left) + `FORGOT?` (text link right, sans 500 0.78rem `var(--v2-text-tertiary)`, opens forgot flow).
  - Input as above, `type="password"`. Default value masked dots.
- **Remember row** (flex space-between, 12px top margin):
  - Left: custom checkbox + label `Stay signed in on this device` (sans 400 0.88rem `var(--v2-text-primary)`).
  - Right: `30 days` (sans 400 0.78rem `var(--v2-text-tertiary)`).
- **Primary CTA `Sign in →`** — full-width pill, height 44px, `var(--v2-accent)`, text `#1a0e08`, sans 600 0.95rem, trailing `→`. Hover: `var(--v2-accent-hover)`.

24px bottom margin.

**OR divider:**

`display: flex; align-items: center; gap: 16px;`. A 1px line (`var(--v2-border-hairline)`) on each side and a centered `OR` text in small-caps mono `var(--v2-text-tertiary)` 0.7rem. 24px bottom margin.

**Activate with license key panel (`.login-v2-activate`):**

1. Eyebrow `ACTIVATE WITH LICENSE KEY` — small-caps mono `var(--v2-text-tertiary)`. 8px bottom margin.
2. Row (`display: flex; gap: 8px;`):
   - Input full-width, same styling as sign-in inputs, placeholder `EC-XXX-XXXXXXXXXXXXXXXX` in mono `var(--v2-text-tertiary)`. Input value styled as mono 500 0.95rem when entered, `text-transform: uppercase`.
   - `Activate` secondary button — height 44px, padding `0 18px`, `var(--v2-bg-surface-2)`, 1px border `var(--v2-border-hairline)`, sans 500 0.92rem `var(--v2-text-primary)`. On valid key: button background flips to `var(--v2-accent)`, text `#1a0e08`.
3. Helper text below — sans 400 0.78rem `var(--v2-text-tertiary)`, 8px top margin:
   `Trial keys give 7 days · monthly keys renew · lifetime keys never expire.`

**Bottom-right (absolute-positioned 24px from bottom of right column):** Two-cell row, left + right:
- Left: `Need help?` + `support@esticount.app` (the email in `var(--v2-accent)`, sans 500). Together sans 400 0.85rem.
- Right: `v4.2.0` in mono 400 0.78rem `var(--v2-text-tertiary)`.

### 7.5 Mobile collapse rules

At `<900px`: hide left column completely; right column expands full-width with `max-width: 480px; margin: 0 auto; padding: 32px 24px;`. The "New here?" top link moves above the eyebrow as a centered line.

At `<768px`: bottom-right footer stacks vertically (Need help on top, version below).

### 7.6 Interaction notes

- `Sign in →` calls existing `doLogin` handler (which fires on Enter on the password field too).
- `Create account →` opens the existing register block (already markup in `index.html` lines 30–40).
- `FORGOT?` opens the existing forgot-password block (lines 41–50).
- `Activate` posts the entered license key to `activateLicense` handler (already wired). On success the page navigates to `dashboardPage`.
- Empty-state for the editorial column: the left column hides at narrow widths but reappears at `>=900px` — do not animate the transition.

### 7.7 1:1 vs. flexibilities

**Must be 1:1:** 50/50 two-column split, editorial heading with the **third phrase only** in accent orange, three stats strip with verbatim numbers and labels, right column eyebrow `01 · SIGN IN`, title `Welcome back.`, subtitle `Sign in to your EstiCount workspace.`, "Stay signed in on this device · 30 days" row, primary CTA `Sign in →`, `OR` divider, license-key panel with `ACTIVATE WITH LICENSE KEY` eyebrow + helper text, top-right `New here? Create account →`, bottom-right `Need help? support@esticount.app` + `v4.2.0`.

**Flex:** Exact placeholder format for license input; the faint grid-paper texture on the left column (decorative — optional); whether the version string is `v4.2.0` (dynamic from build).

---

## 8. Mobile (informational only — no full page build)

### 8.1 Design summary

The mobile pattern is established by PDF page 11. It demonstrates two things: (1) a **persistent bottom tab bar** at all viewport widths `<768px`, and (2) the **two-column → single-column collapse** rule for every page. The mobile content card example shows the Calculator collapsed onto a phone-width form: a job header strip, a horizontal scrollable phase selector, then a measurements block with edit links.

### 8.2 Bottom tab bar (`.mob-v2-tabbar`)

A fixed-position bar at the bottom of the viewport, only rendered at `<768px`:

```
.mob-v2-tabbar {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  height: 56px;
  background: var(--v2-bg-surface);
  border-top: 1px solid var(--v2-border-hairline);
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  z-index: 100;
}
```

Each tab is a `<button>` (`.mob-v2-tab`) with two stacked rows:
- Icon (24×24, line-style) in `var(--v2-text-tertiary)` (inactive) or `var(--v2-text-primary)` (active). The icons are abstract glyphs:
  - **Home** — `◐` (half-disc)
  - **Calc** — `∑` (summation)
  - **Orders** — `✓` (check)
  - **Bids** — `§` (section sign)
  - **More** — `⋯` (kebab)
- Label below icon — mono 400 0.62rem `var(--v2-text-tertiary)`, uppercase, letter-spacing 0.06em. Active state: `var(--v2-text-primary)`.

Active tab gets a 2px solid `var(--v2-accent)` underline at the top of the tab, flush against the border-top of the bar (visually it's an accent line that crosses the top hairline).

Tab order: `Home · Calc · Orders · Bids · More`. The `More` tab opens a slide-up sheet containing the remaining nav items (Pricing, Saved Jobs, Admin if applicable, Account, Sign out).

### 8.3 Two-column → single-column collapse rule

Universal rule for every page: at `<768px`, any layout that uses `grid-template-columns: minmax(0, 1fr) <fixed-width>` collapses to `grid-template-columns: 1fr` with the right rail wrapping below the main content. Within the right rail, sticky positioning is disabled.

Specific page rules are detailed in each page's "Mobile collapse rules" subsection above. Universal mobile additions:

- Add `padding-bottom: 72px` to `<main>` so the fixed tab bar doesn't overlap content.
- Reduce `padding: 24px 40px` → `padding: 20px 16px` for `.dash-v2-page`, `.price-v2-page`, etc.
- Reduce `Display L` (~2rem titles) by 15% (~1.7rem).
- Hide the topnav's `Primary nav` link list (Dashboard / Calculator / Pricing / Orders / Bids / Saved Jobs / Admin) — the bottom tab bar replaces it. Topnav at mobile width keeps only brand + search (collapsed to a single 🔍 icon button that expands on tap) + avatar.

### 8.4 Mobile phase selector pattern (Calculator mobile, from PDF page 11)

At mobile width, the Calculator phase cards collapse but the phase selector becomes a horizontal scrollable strip at the top:

`<div class="mob-v2-phase-strip">`
- Lath (inactive — text only, sans 500 0.88rem)
- Gray Coat (active — pill `var(--v2-bg-surface-2)` background, 1px border `var(--v2-border-hairline)`, radius `var(--v2-r-pill)`, padding `6px 14px`)
- Color Coat (inactive)
- `+ Add` (inactive, dashed border)

This strip is `display: flex; gap: 8px; overflow-x: auto;` and only the active phase's body renders below.

### 8.5 1:1 vs. flexibilities

**Must be 1:1:** Bottom tab bar visible at `<768px` on every page with the 5 tabs in order Home / Calc / Orders / Bids / More; active tab gets the orange top-underline; mobile phase selector pattern as above for Calculator.

**Flex:** Exact icon glyphs (use SVG line icons if available rather than the unicode placeholders above); whether the More tab opens a sheet or a full new page; whether the topnav remains visible at mobile width or hides entirely behind the tab bar.

---

## 9. Cross-page consistency contract

These rules must hold across every page above (and the existing Calculator):

1. **Page outer:** `max-width: 1440px; margin: 0 auto; padding: 24px 40px 64px;` (except Login which is 100vh full-bleed).
2. **Header zone:** every page has the same eyebrow → title → subtitle stack on the left, right-side action cluster, and 1px hairline divider below (20px above and below).
3. **Eyebrow numbering:** `01 · TODAY` (Dashboard), `02 · CALCULATOR` (Calculator), `03 · PRICING` (Pricing), `04 · ORDER` (Orders), `05 · BID` (Bids — note: shown as `04 · BID` in the rail on PDF page 7 but as `05` in the page indicator on the topnav, see below), `06 · SAVED JOBS` (Saved Jobs), `07 · ADMIN · OPERATOR CONSOLE` (Admin), `10 · SIGN IN / ACTIVATE` (Sign-in), `11 · MOBILE` (Mobile pattern).
4. **Topnav `.v2-topnav-indicator`:** updates on every page to reflect the page number + slug shown in the eyebrow (the page indicator text takes the same number as the eyebrow's leading "NN ·"). Examples: `01 · DASHBOARD`, `03 · PRICING · STUC-O-FLEX`, `06 · ORDER SHEET`, `07 · BID`, `08 · SAVED JOBS`, `09 · ADMIN`, `10 · SIGN IN / ACTIVATE`.
5. **Topnav `.v2-nav-link.active`:** moves to match the current page (`Dashboard`, `Calculator`, `Pricing`, `Orders`, `Bids`, `Saved Jobs`, `Admin`).
6. **Phase chips:** use the exact palette from `spec.md §1.1` / §7. Never invent new chip colors except for the optional `.v2-chip.stone` if Saved Jobs builder needs a stone-veneer chip.
7. **Status pills:** `● Draft` / `● Active` / `● Open` / `● Won` / `● Sent` / `● Lost` reuse the same pill structure (`var(--v2-badge-surface-neutral)` background, 1px border, dot + label) — only the dot color changes per state. Defined in `spec.md §1.1` (Draft = amber dot) and extended in §5.5 above.
8. **Tables:** all tables use the same outer card treatment (`var(--v2-bg-surface)`, 1px border, radius `var(--v2-r-card)`, overflow hidden); same column-header row pattern (small-caps mono labels, 1px hairline below); same row hover state `var(--v2-bg-surface-hover)`; same row divider pattern.
9. **CTAs:** primary = `var(--v2-accent)` with text `#1a0e08`, sans 600; secondary = `var(--v2-bg-surface-2)` with 1px border + `var(--v2-text-primary)` text, sans 500; tertiary = text link, `var(--v2-text-secondary)` → `var(--v2-text-primary)` hover. Heights: 36px in header right-clusters, 40px in rails, 44px for full-width primary actions.
10. **Tabular numerals:** every mono numeric cell uses `font-variant-numeric: tabular-nums` (already declared globally for `.calc-v2-*` — extend the declaration to `.dash-v2-*`, `.price-v2-*`, `.order-v2-*`, `.bid-v2-*`, `.jobs-v2-*`, `.admin-v2-*`).
11. **Editorial accent rule:** the only page-level use of `var(--v2-accent)` as text color (vs. background) is on **big serif display numbers** that represent the canonical "value" of the page: Calculator's CUSTOMER PRICE + PROFIT, Bids' Total + Margin, Dashboard's positive sub-trend arrow, Sign-in's "Build margin." headline phrase. Do not over-use.

---

End of pages-spec.
