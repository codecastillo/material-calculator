# EstiCount — Calculator Page Design Spec

This spec describes the **Calculator page** (PDF page 4) of the EstiCount design refresh. It is exhaustive and self-sufficient: a build agent should be able to produce the HTML/CSS without ever seeing the PDF.

The Calculator inherits a global design language established across pages 1–3 (dashboards), 5 (pricing catalog), 6 (orders), 7 (bids), 9 (admin), 10 (sign-in), and 11 (mobile). Tokens below were observed across those pages and are applied 1:1 here.

---

## 1. Design tokens

### 1.1 Color palette

The app uses a **deep near-black** background with very subtle warm tint, slightly elevated card surfaces, a small set of warm-cream and pastel chips for phase categories, a saturated **coral-orange** accent for primary CTAs and active-link indicators, and a green dot for status. Hairlines are very low-contrast.

| Token | Hex (approx.) | Purpose |
|---|---|---|
| `--bg-app` | `#0d1014` | Page background. Slightly warm-tinted black. |
| `--bg-surface` | `#13171d` | Main card / panel background (calculator content area, summary sidebar). |
| `--bg-surface-2` | `#181d24` | Slightly elevated surface (metrics strip cells, phase header bar, table row hover). |
| `--bg-input` | `#1c2128` | Inline editable mini-pill input background (e.g., the `3,840 sq·ft` field on phase headers, the supplier dropdown). |
| `--border-hairline` | `#1f242c` | Card outline, table row dividers, metric-cell separators. ~1px. |
| `--border-strong` | `#262c35` | Card outline at the boundary of the summary sidebar; rarely used. |
| `--text-primary` | `#e6e8ec` | Body text, primary table content, titles. |
| `--text-secondary` | `#9aa0a9` | Subtitles, sublabels (`per sqft $9.56`, `10 items, 3 phases`), table cell unit suffixes. |
| `--text-tertiary` | `#6b7280` | Eyebrow small-caps labels (`02 · CALCULATOR | JOB J-2419`), column headers in tables (`SKU`, `ITEM`, `COVERAGE`...). |
| `--text-muted` | `#4a5260` | Disabled / very faded micro-text (progress bar `0%`, `50%` end labels). |
| `--accent` | `#e9774a` | Primary CTA pill ("Generate bid →"), active topnav underline, customer-price display number, profit display number, progress-bar fill, "Open calculator" link in dashboards. |
| `--accent-hover` | `#ef835a` | Hover state for accent. |
| `--accent-soft` | `#3a2417` | Translucent/soft tint of accent for the orange progress bar segment behind the fill. |
| `--status-dot-green` | `#5dcf8a` | The `●` dot inside Draft / Active / Open badges. |
| `--status-dot-amber` | `#e9774a` | The `●` dot inside "Draft" status badge (reuses accent hue). |
| `--badge-surface-neutral` | `#1f242c` | Background of neutral status pills like `● Draft`. |

#### Phase chip palette (CRITICAL — exact)

Each phase has a **soft pastel background** and a darker text + dot in the same hue. Backgrounds are slightly desaturated, text/dot is more saturated.

| Phase | Background | Text + Dot | Notes |
|---|---|---|---|
| **Lath** | `#efe2c2` (pale cream / butter) | `#7a5b1f` text, dot `#a07621` | Used as `● LATH PHASE` and `● LATH` in dashboards. |
| **Gray Coat** | `#f1d4dc` (pale pink / lilac-rose) | `#8a3f56` text, dot `#b04a66` | Sometimes labeled "Gray Coat" or "Brown Coat" — same palette. |
| **Color Coat** | `#cde8c8` (mint green) | `#3e6b3a` text, dot `#4f8a48` | |
| **Accessories** | `#f3cfb1` (peach) | `#8a4b22` text, dot `#a85d2b` | |
| **Painting** | `#bcd4a7` (mossy / olive green) | `#3f5a2c` text, dot `#557538` | Slightly darker / more saturated than Color Coat. |
| **Drywall** | `#cfd9e6` (pale slate-blue) | `#3e5269` text, dot `#536a86` | Seen on dashboard, include in palette. |
| **Aggregate** | `#d8d2c2` (warm taupe) | `#5a5236` text, dot `#7a6e48` | Seen on pricing catalog page. |

Each chip is a small pill: `padding: 3px 9px 3px 8px`, `border-radius: 999px`, `font-size: 0.66rem`, `letter-spacing: 0.06em`, `text-transform: uppercase`, `font-weight: 600`. The `●` dot is `0.5em` wide, prefixed with a thin space.

### 1.2 Typography stack

Three families are in use:

1. **Serif display** — transitional with slight modulation, used for big money numbers and the main page title. Best matches: **Fraunces** (variable) or **Newsreader**. Spec uses **Fraunces** with `font-optical-sizing: auto`, weights 400 and 500. Fallback: `Georgia, "Times New Roman", serif`.
2. **Sans-serif UI** — clean neo-grotesque. Best match: **Inter** (weights 400, 500, 600, 700). Fallback: `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`.
3. **Monospace** — used for SKUs, tabular dollar amounts inside the cost table, mini-pill input values (`3,840 sq·ft`), the page-indicator (`04 · CALCULATOR`), and small-caps eyebrows. Best match: **JetBrains Mono** or **IBM Plex Mono**, weights 400 and 500. Fallback: `ui-monospace, "SF Mono", Menlo, monospace`.

Suggested CSS variables:

```css
--font-serif: "Fraunces", Georgia, "Times New Roman", serif;
--font-sans:  "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
--font-mono:  "JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace;
```

Global `body`: `font-family: var(--font-sans); font-size: 14px; line-height: 1.45; color: var(--text-primary); background: var(--bg-app);`.

### 1.3 Type scale (every distinct size on page 4)

| Token | Size | Family / Weight | Tracking / Misc. | Usage |
|---|---|---|---|---|
| **Display XL** | `3.0rem` (48px) | serif 500 | `letter-spacing: -0.01em`, `line-height: 1.0` | `$32,679` customer-price headline in summary sidebar. |
| **Display L** | `2.0rem` (32px) | serif 500 | `letter-spacing: -0.01em`, `line-height: 1.05` | `$5,893` profit number; `Hernandez Residence` page title (~2rem, serif 500). |
| **Display M** | `1.4rem` (~22px) | serif 500 | `letter-spacing: -0.005em` | `$9,677` and `$3,347` phase totals on the right of each phase header bar; the dashboard's `$28,450` is at this scale on smaller cards. |
| **Number tabular L** | `1.6rem` (~26px) | mono 500 | tabular numerals | The big numbers in the metrics strip: `3,840`, `420`, `3,420`. |
| **Body L** | `0.95rem` (~15px) | sans 500 | — | Card section labels (`Materials`, `Labor`, `Overhead`...). |
| **Body** | `0.88rem` (14px) | sans 400 | — | Default body text, table item descriptions. |
| **Body strong** | `0.88rem` | sans 600 | — | Item names in table (`Grade D paper · 60-min`). |
| **Body small** | `0.78rem` (~12.5px) | sans 400 | — | Sublabels (`per sqft`, `10 items, 3 phases`, `64 hrs @ $128.75`). |
| **Mono numeric** | `0.85rem` (~13.5px) | mono 400 | tabular numerals | Table $ values, supplier names, SKUs. |
| **Mono numeric strong** | `0.85rem` | mono 500 | tabular numerals | Row totals (rightmost column, `$2749.90`). |
| **Mono pill value** | `0.78rem` | mono 500 | — | Inline mini-pill input value (`3,840`, `186`, `3/8`). |
| **Small-caps label** | `0.7rem` (~11px) | mono 400 | `letter-spacing: 0.10em`, `text-transform: uppercase` | Eyebrows: `02 · CALCULATOR | JOB J-2419`, column headers `SKU ITEM COVERAGE QTY EACH TOTAL`, metric-cell labels (`SUPPLIER`, `TOTAL WALL`, `OPENINGS`, `NET AREA`), section headers (`SUMMARY`, `CUSTOMER PRICE`, `PROFIT`), mini-pill labels (`WALL AREA`, `CORNER BEAD`, `THICKNESS`). |
| **Tiny mono** | `0.65rem` (~10.5px) | mono 400 | `letter-spacing: 0.08em`, uppercase | Far-right page indicator on topnav (`04 · CALCULATOR`), `⌘K`. |

### 1.4 Spacing rhythm

Base unit: **4px**, with most rhythm landing on multiples of 4 and 8.

| Token | Value | Usage |
|---|---|---|
| `--space-1` | 4px | Icon-to-label gap, dot-to-text in chips. |
| `--space-2` | 8px | Tight gaps between adjacent meta items, mini-pill internal padding. |
| `--space-3` | 12px | Default row-internal padding, gap between metric-cell label and value. |
| `--space-4` | 16px | Default card padding x-axis on tight cards, gap between phase header items. |
| `--space-5` | 20px | Table-row vertical padding, summary cost-row vertical gap. |
| `--space-6` | 24px | Main card inner padding, gap between page header and metrics strip. |
| `--space-8` | 32px | Gap between major content sections (header → metrics → phases). |
| `--space-10` | 40px | Topnav side padding, page outer horizontal margin. |

Topnav height: **56px**. Page wrapper top padding: 24px. Two-column layout gap (main content ↔ summary sidebar): **28–32px**.

### 1.5 Radii

| Token | Value | Usage |
|---|---|---|
| `--radius-card` | 10px | Phase section card outer, summary sidebar card. |
| `--radius-inner` | 8px | Metrics strip outer wrapper, table outer corners. |
| `--radius-button` | 8px | Primary CTA pill `Generate bid →`, secondary buttons `Duplicate`, `Print order sheet`. The accent CTA may render closer to 6–8px — keep 8px. |
| `--radius-input` | 6px | Mini-pill inline inputs (`3,840 sq·ft`), supplier dropdown. |
| `--radius-pill` | 999px | Phase chips, status badges (`● Draft`), the `PRO` brand pill. |

### 1.6 Hairlines / borders

`1px solid var(--border-hairline)` is used for:
- Outline of each phase card.
- Outline of the metrics strip.
- The horizontal divider between metric cells (vertical 1px line, full height, color `--border-hairline`).
- The thin separator under the topnav (1px below the row at y ≈ 56px).
- Row dividers in the SKU table.
- Card outline of the summary sidebar.
- The thin divider line beneath the page header strip (above the metrics strip — appears as a 1px line on PDF page 4 just below the title row).

No outer 2px borders. No drop shadows visible — see 1.7.

### 1.7 Shadows / elevation

No drop shadows. Elevation comes from a **slightly lighter surface color** (`--bg-surface-2` over `--bg-surface` over `--bg-app`). Optional very-soft glow on the orange CTA on hover (`box-shadow: 0 0 0 4px rgba(233,119,74,0.10)`), but this is a guess for hover; default state is flat.

---

## 2. Topnav (shared element)

Height **56px**, full-width, background `var(--bg-app)`, bottom border `1px solid var(--border-hairline)`. Horizontal padding: **40px** desktop, 20px mobile.

Layout (left → right):

1. **Brand mark + wordmark + pill**
   - A small **black square** (about 28×24, radius 4) containing a tiny "≡"-like horizontal-bars icon in a slightly lighter tone (looks like 3 short horizontal strokes). This is the EstiCount mark.
   - Wordmark `esti · count` rendered as **two words separated by a middle-dot**, in sans-serif weight 500, size ~1.05rem, color `--text-primary`. The `·` separator is `--text-secondary`.
   - A small **`PRO`** pill: `--text-secondary` text, `--bg-surface-2` background, 1px border `--border-hairline`, padding `2px 6px`, radius 4px, font-size `0.62rem`, letter-spacing `0.08em`, uppercase. Sits to the right of the wordmark with 8px gap.

2. **Primary nav** (after brand, with ~28px gap)
   - Inline list: `Dashboard | Calculator | Pricing | Orders | Bids | Saved Jobs | Admin`
   - 20–24px gap between items.
   - Font: sans 500, 0.88rem, color `--text-primary` for active, `--text-secondary` for inactive.
   - **Active state**: the link text is `--text-primary`, AND a 2px solid `--accent` underline sits flush at the bottom of the topnav (NOT on the text — it's anchored to the topnav bottom edge, immediately below the active link). On the Calculator page, the underline is under "Calculator".
   - No background fill, no rounded background on active.

3. **Search input** (right side, takes remaining space, max-width ~360px)
   - Pill-shaped or rounded-rect input: `--bg-surface-2` background, 1px border `--border-hairline`, radius 8px, height 32px.
   - Leading magnifying-glass icon (`⌘`-style or `🔍` outline) in `--text-tertiary`.
   - Placeholder text `Search jobs, SKUs…` in `--text-tertiary`.
   - Trailing `⌘K` keycap: small `--bg-input` chip with `--text-tertiary` text, ~10px font, radius 4px, padded `1px 5px`, 1px border `--border-hairline`.

4. **Page indicator (small-caps mono)**
   - Far right, BEFORE the avatar: text `04 · CALCULATOR` in tiny-mono style (0.65rem, mono, uppercase, `--text-tertiary`, letter-spacing 0.08em).
   - 12px gap between indicator and avatar.

5. **Avatar**
   - Circular 28px, `--bg-surface-2` background, 1px border `--border-hairline`, contains `DC` initials in sans 600, 0.7rem, `--text-primary`.

---

## 3. Page header (within calculator content)

The page content begins below the topnav with a horizontal padding of 40px and a top padding of 24px. The header strip is one row:

**Left side (stacked):**

1. **Eyebrow line**: `02 · CALCULATOR  |  JOB J-2419`
   - Small-caps mono token (0.7rem mono, uppercase, letter-spacing 0.10em).
   - Color: `--text-tertiary`. The `|` separator has same weight, 8px gap on either side.
   - Bottom margin 8px.

2. **Title**: `Hernandez Residence`
   - Serif 500, ~2.0rem, color `--text-primary`, letter-spacing -0.005em.
   - Bottom margin 6px.

3. **Subtitle**: `4218 Briar Creek Dr · Stucco re-coat · 3,840 sq·ft exterior`
   - Sans 400, 0.88rem, color `--text-secondary`.
   - `·` separators sit at `--text-tertiary` to soften.

**Right side (single row, vertically centered against title):**

A horizontal cluster of action elements with 16px gaps. Order:

1. **Status badge `● Draft`**
   - Pill, radius 999px, background `--bg-surface-2`, 1px border `--border-hairline`.
   - Padding 4px 10px 4px 8px.
   - Green status dot (`●`) at the start — but **on this page the dot is the accent orange** (`--accent`) to indicate draft-state-not-yet-active. Use `--accent` for the Draft dot, `--status-dot-green` for Active/Open variants.
   - Label text `Draft` in sans 500, 0.75rem, `--text-primary`.

2. **Text link `Duplicate`**
   - Sans 500, 0.85rem, color `--text-secondary`. Hover: `--text-primary`.

3. **Text link `Save template`**
   - Same style.

4. **Primary CTA `Generate bid →`**
   - Pill button, height 36px, padding `0 18px`, radius 8px.
   - Background `--accent`, text `#1a0e08` (very dark, near black on orange), sans 600, 0.88rem.
   - The arrow `→` is the same color, with 6px gap from label.
   - Hover: background `--accent-hover`.

Below the entire header row there is a **1px hairline divider** (`--border-hairline`) running full content width, with 20px space above and below.

---

## 4. Metrics strip

A single rounded card sitting just below the header divider. The card contains **four equal-width cells** with 1px vertical hairlines between them.

- Card: background `--bg-surface`, 1px border `--border-hairline`, radius `--radius-inner` (8px), height auto.
- Each cell: padding `16px 20px`. The cell is structured as two stacked rows:
  1. **Top row (label, small-caps)**:
     - Cell 1: `SUPPLIER` + a small chevron `⌄` (caret) to the right of the value (indicates dropdown). The whole cell is the dropdown affordance.
     - Cell 2: `TOTAL WALL`
     - Cell 3: `OPENINGS`
     - Cell 4: `NET AREA`
     - Style: small-caps label token (0.7rem, mono 400, uppercase, letter-spacing 0.10em, color `--text-tertiary`).
  2. **Bottom row (value)**:
     - Cell 1: `Pacific Supply ⌄` — sans 500, 1.05rem, `--text-primary`, caret is `--text-tertiary` and trails the text with 8px gap. The whole cell behaves as a `<button>` styled dropdown trigger. No border on the trigger itself — the cell container provides the visual frame.
     - Cells 2–4: large tabular mono number + a subscript unit:
       - Cell 2: `3,840` with `sq·ft` subscript.
       - Cell 3: `420` with `sq·ft` subscript.
       - Cell 4: `3,420` with `sq·ft` subscript.
       - Value: mono 500, ~1.6rem, `--text-primary`, tabular numerals.
       - Unit subscript: mono 400, 0.65rem, `--text-tertiary`, baseline offset slightly down, 6px left margin.
- Between cells: vertical 1px line of `--border-hairline`, full height (top to bottom edges of the card).

Below the metrics strip, leave a 20px gap before the first phase card.

---

## 5. Phase sections

Each phase is its own **rounded card** with header bar + table body. Cards stack with 12px vertical gap between them.

### 5.1 Phase card outer

- Background: `--bg-surface`.
- Border: 1px solid `--border-hairline`.
- Radius: `--radius-card` (10px).
- Overflow: hidden (so inner header bar corners clip cleanly).

### 5.2 Phase header bar

Header bar height ~64px. Background `--bg-surface-2` (slightly lighter than card body). Padding `14px 20px`. Internal layout is `display: flex; align-items: center; gap: 16px;`.

**Left cluster:**

1. **Index number** in mono: `01`, `02`, etc. Mono 500, 0.85rem, color `--text-tertiary`, with 14px right margin.
2. **Phase chip**: e.g., `● LATH PHASE` — using the chip styles from §1.1, sized small. Min-width: content.
3. **Item count**: `· 4 items` — sans 400, 0.85rem, color `--text-secondary`. The `·` is `--text-tertiary`.

**Right cluster** (pushed right with `margin-left: auto`, internal gap 16px, vertically centered):

1. **Parameter mini-pills** (one or two depending on phase):
   - Each mini-pill is a label + editable value pair:
     - **Label**: small-caps token (`WALL AREA`, `CORNER BEAD`, `THICKNESS`), mono 400, 0.7rem, uppercase, letter-spacing 0.10em, `--text-tertiary`. Right-margin 8px.
     - **Editable input**: inline `<input>` styled as a pill. Background `--bg-input`, 1px border `--border-hairline` (treat as transparent border that becomes `--text-tertiary` on focus and `--accent` on focus-visible), radius 6px, padding `4px 10px`, mono 500, 0.85rem, color `--text-primary`, tabular numerals. The input value displays the number together with its unit (`3,840 sq·ft`, `186 lin·ft`, `3/8 in`) — the unit sits inside the input as a static suffix in `--text-tertiary` with 4px left margin and is not editable; only the number is editable.
   - Multiple pills are separated by 16px.
2. **Phase total** (rightmost):
   - Serif 500, ~1.4rem, `--text-primary`, tabular numerals (Fraunces supports tabular figures with `font-variant-numeric: tabular-nums`).
   - Examples: `$3,347`, `$9,677`.

Header bar is clickable (toggles body collapse). On hover the bar lifts to a very subtle tint: `background: #1c2128`.

### 5.3 Phase table body

Below the header bar, **no spacer**, directly the table. Table sits on `--bg-surface`.

Columns and widths (proportions for desktop content width ~640–680px):

| Col | Label | Width | Align | Font |
|---|---|---|---|---|
| 1 | `SKU` | 90px fixed | left | mono 400, 0.85rem, `--text-primary` |
| 2 | `ITEM` | flex / fill | left | sans 600, 0.88rem for item name; sans 400, 0.78rem, `--text-tertiary` for the unit sub-line ("roll", "sheet", "box", "pc", "bag", "ton") |
| 3 | `COVERAGE` | 130px | left | mono 400, 0.82rem, `--text-secondary` (e.g., `432 sqft/roll`, `18 sqft/sheet`, `5,000/box`) |
| 4 | `QTY` | 70px | right | mono 500, 0.95rem, `--text-primary` (e.g., `9`, `214`, `4`) |
| 5 | `EACH` | 90px | right | mono 400, 0.85rem, `--text-secondary` (e.g., `$38.50`) |
| 6 | `TOTAL` | 110px | right | mono 500, 0.95rem, `--text-primary` (e.g., `$2749.90`) |

**Column headers row**: padding `10px 20px`, font is the small-caps label token (0.7rem, mono 400, uppercase, letter-spacing 0.10em, `--text-tertiary`). Bottom border 1px `--border-hairline`. Background stays `--bg-surface`.

**Data rows**: padding `14px 20px`, vertical alignment center. Each row has a bottom border `1px solid var(--border-hairline)` except the final row in the card (no border, sits flush with card bottom).

**ITEM column** is two lines:
- Line 1: item name e.g. `Grade D paper · 60-min` (sans 600, 0.88rem, `--text-primary`)
- Line 2: unit slug e.g. `roll` (sans 400, 0.78rem, `--text-tertiary`, top margin 2px)

**Hover** state for a data row: background `#161b22` (between surface and surface-2). Optional, but propose.

### 5.4 Per-phase content (page 4 verbatim)

For build agent reference, here is exactly what page 4 shows in the two visible phases (the page is scrolled to show parts of more — but only these are fully visible; assume more phases exist below similar in structure):

**Phase 01 — `● LATH PHASE` · 4 items · WALL AREA `3,840 sq·ft` · CORNER BEAD `186 lin·ft` — total `$3,347`**

| SKU | Item | (unit) | Coverage | Qty | Each | Total |
|---|---|---|---|---|---|---|
| PE-D60 | Grade D paper · 60-min | roll | 432 sqft/roll | 9 | $38.50 | $346.50 |
| KL-25 | K-Lath 2.5 lb · galv | sheet | 18 sqft/sheet | 214 | $12.85 | $2749.90 |
| STP-78 | Staples · 7/8" galv | box | 5,000/box | 4 | $24.20 | $96.80 |
| CB-08 | Corner bead · 8 ft galv | pc | 8 lf/pc | 24 | $6.40 | $153.60 |

**Phase 02 — `● GRAY COAT` · 4 items · WALL AREA `3,840 sq·ft` · THICKNESS `3/8 in` — total `$9,677`**

| SKU | Item | (unit) | Coverage | Qty | Each | Total |
|---|---|---|---|---|---|---|
| CEM-IIA | Portland Type II · 94 lb | bag | 12 sqft/bag | 320 | $18.95 | $6064.00 |
| SND-PL | Plaster sand · graded | ton | 90 sqft/ton | 43 | $64.50 | $2773.50 |
| FBR-PP | PP fiber mesh | bag | per cu yd | 12 | $11.20 | $134.40 |
| LIM-HY | Hydrated lime · Type S | bag | 90 sqft/bag | 43 | $16.40 | $705.20 |

The PDF continues below the fold; the existing app's per-phase data will likely supply additional phases (`Color Coat`, `Accessories`, `Painting`). Apply the same structure to each.

---

## 6. Summary sidebar (right column)

Fixed-width-ish column, **~36%** of the content area on desktop (approx. 380–420px). Sits at the same top y as the page header eyebrow. The sidebar is a single rounded card.

- Container: `--bg-surface`, 1px border `--border-hairline`, radius `--radius-card` (10px), padding `24px`.

Content order (top to bottom):

### 6.1 `SUMMARY` eyebrow
Small-caps label token, color `--text-tertiary`. Top of the card. Bottom margin 24px.

### 6.2 Customer-price block
- `CUSTOMER PRICE` — small-caps label token, `--text-tertiary`. Bottom margin 12px.
- Display number `$32,679` — **Display XL** (serif 500, 3rem, color `--accent` — yes, the customer-price number renders in the **coral-orange accent**, NOT plain text). This is the single biggest piece of type on the page. Letter-spacing -0.01em.
- Sub-line, one row with `display: flex; justify-content: space-between;`:
  - Left: `per sqft` (sans 400, 0.78rem, `--text-secondary`).
  - Right: `$9.56` (mono 500, 0.85rem, `--text-primary`).
- Bottom margin 28px.

### 6.3 Cost stack
A vertical list of four rows, each `display: flex; justify-content: space-between; align-items: baseline;`. Row vertical padding 12px. 1px hairline divider between rows (`--border-hairline`).

For each row:
- **Left column** (2 lines):
  - Line 1: label (sans 500, 0.95rem, `--text-primary`). E.g. `Materials`, `Labor`, `Overhead`, `Markup`.
  - Line 2: sublabel (sans 400, 0.78rem, `--text-secondary`). E.g. `10 items, 3 phases`, `64 hrs @ $128.75`, `8.0% of materials`, `22.0% on cost`.
- **Right column** (1 line):
  - Amount (mono 500, 0.95rem, `--text-primary`, tabular numerals).
  - Values from page 4: `$17,172.4`, `$8,240`, `$1,373.79`, `$5,892.96`.

After Markup row, a slightly stronger row for **Total cost**:
- `Total cost` label (sans 600, 0.95rem) on left, no sublabel.
- Amount `$26,786` on right (mono 600, 1rem).
- 16px vertical padding, no divider beneath.

Bottom margin 28px.

### 6.4 Profit block
- `PROFIT` — small-caps label token, `--text-tertiary`. Bottom margin 12px.
- Row, `display: flex; justify-content: space-between; align-items: baseline;`:
  - Left: `$5,893` — **Display L** (serif 500, 2rem, color `--accent`). Tabular figures.
  - Right: `18.0%` — sans 500, 1rem, `--text-secondary` (or `--text-primary`; on the PDF it reads as muted gray, ~`--text-secondary`). Slight top alignment with baseline of the dollar number.
- Bottom margin 12px.

### 6.5 Progress bar
A horizontal bar showing margin position 0% → 50%, with a target marker at 28% and the current value at 18%.

- Track: height 8px, background `--bg-input`, radius 4px, full width of card content.
- Fill: from 0% to 18%, background `--accent` (`#e9774a`), same radius left side. The fill is exactly 18/50 = 36% of the track width.
- Target marker at 28%: a 2px-wide vertical tick that spans the full height of the track, color `--text-primary` (or very light), 8px tall. Position: `left: 56%` (28/50).
- Below the bar, a row of three labels (`display: flex; justify-content: space-between;`):
  - Left: `0%` (mono 400, 0.7rem, `--text-tertiary`).
  - Center: `target 28%` (mono 400, 0.7rem, `--text-secondary`). Center-aligned by sitting flush at `left: 56%` with a `transform: translateX(-50%)` so it lines up exactly under the tick.
  - Right: `50%` (mono 400, 0.7rem, `--text-tertiary`).

Bottom margin 28px.

### 6.6 Sidebar CTAs

1. **Primary**: `Generate bid →` — full-width pill button, height 44px, radius 8px, background `--accent`, text `#1a0e08`, sans 600, 0.95rem. Trailing arrow.
2. **Secondary**: `Print order sheet` — full-width button, height 44px, radius 8px, background `--bg-surface-2`, 1px border `--border-hairline`, text `--text-primary`, sans 500, 0.95rem. 8px top margin from primary.

---

## 7. Phase chip palette (verbatim)

Reproduced here for emphasis. Each chip's text + dot is the saturated tone; the background is the soft tone.

```css
.chip.lath        { background: #efe2c2; color: #7a5b1f; }
.chip.lath::before        { background: #a07621; }   /* the ● dot */

.chip.gray-coat   { background: #f1d4dc; color: #8a3f56; }
.chip.gray-coat::before   { background: #b04a66; }

.chip.color-coat  { background: #cde8c8; color: #3e6b3a; }
.chip.color-coat::before  { background: #4f8a48; }

.chip.accessories { background: #f3cfb1; color: #8a4b22; }
.chip.accessories::before { background: #a85d2b; }

.chip.painting    { background: #bcd4a7; color: #3f5a2c; }
.chip.painting::before    { background: #557538; }

.chip.drywall     { background: #cfd9e6; color: #3e5269; }
.chip.drywall::before     { background: #536a86; }

.chip.aggregate   { background: #d8d2c2; color: #5a5236; }
.chip.aggregate::before   { background: #7a6e48; }
```

Chip base:
```css
.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 9px 3px 8px;
  border-radius: 999px;
  font-family: var(--font-sans);
  font-size: 0.66rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  line-height: 1;
  white-space: nowrap;
}
.chip::before {
  content: "";
  width: 0.5em;
  height: 0.5em;
  border-radius: 999px;
}
```

---

## 8. Interaction notes

- **Phase collapse**: clicking anywhere on the header bar (but NOT on the editable mini-pill inputs or the phase total) toggles a class on the card that hides the table body and rotates a chevron (the PDF does not depict a chevron, but add a small `⌃` chevron at the far right of the header bar, before the total, colored `--text-tertiary`, that rotates from up → down on collapsed state). Animate with `transition: transform 150ms ease`.
- **Supplier metric cell**: full cell is the dropdown trigger. Hover state: background fades to `--bg-input`. Caret `⌄` rotates 180° on open. The dropdown panel opens flush under the cell, same width, background `--bg-surface-2`, 1px border `--border-hairline`, radius 8px, padding 8px 0; each option is `padding: 8px 16px`, hover `--bg-input`.
- **Mini-pill inputs** (`3,840`, `186`, `3/8`): standard `<input type="text">` styled per §5.2. On focus: border becomes `--accent`, no outline ring. On blur, value is reformatted with thousands separators.
- **Status badge `● Draft`**: clickable popover/menu for status changes (open it on click, list options Draft / Active / Won / Lost — out of scope visually but reserve the affordance).
- **Hover states (general)**:
  - Text links (`Duplicate`, `Save template`): color shifts from `--text-secondary` to `--text-primary`, no underline.
  - Primary CTA: background `--accent` → `--accent-hover`.
  - Secondary buttons: background `--bg-surface-2` → `#1f242c`.
  - Table rows: background tint `#161b22`.
- **Keyboard**: `⌘K` opens search (consistent with topnav hint).
- **Tabular numerics**: all numeric mono cells use `font-variant-numeric: tabular-nums` to keep columns aligned.

---

## 9. Mobile behavior (reference page 11)

At narrow widths (`< 768px`):

- Topnav collapses to: brand mark + wordmark on the left, hamburger or avatar on the right. Primary nav becomes a bottom tab bar (`Home · Calc · Orders · Bids · More`) with icons + tiny mono labels and a 2px orange underline on the active tab.
- Page header: title remains, but right-side actions collapse — only the primary `Generate bid` CTA stays visible (full-width, moves below the header). The status badge moves under the title.
- Metrics strip: stacks to 2×2 grid (Supplier + Total Wall on row 1, Openings + Net Area on row 2). Hairlines become both vertical (between columns) and horizontal (between rows).
- Phase cards: header bar wraps. The chip + index + item count stay on row 1; the parameter mini-pills wrap to row 2; the phase total moves to row 1 right edge.
- Phase tables: SKU and Coverage columns hide. The COVERAGE value moves into the ITEM cell as a third line. Visible columns become ITEM (with embedded sub-lines), QTY (right), TOTAL (right). EACH and SKU collapse into a tap-to-expand row.
- Summary sidebar: stacks below the phase list as a full-width card.
- Pills like `Lath / Gray Coat / Color Coat / + Add` (as seen on page 11) appear as a horizontal scrollable phase selector at the top of the calculator on mobile.
- Body font-size remains 14px; large displays scale to ~2.4rem and 1.6rem.

---

## 10. 1:1 vs. flexibility

**Must be 1:1 with PDF page 4:**

- Type hierarchy and weights (serif for display money + title; sans for body; mono for SKUs, tabular numbers, mini-pill values, small-caps labels).
- Color palette: page background near-black, accent coral-orange, phase chip pastel palette (cream / pink / mint / peach / mossy / slate / taupe).
- Page layout: two-column with a roughly 64% / 36% split (main calculator content + summary sidebar).
- Header structure: eyebrow → title → subtitle → right-side cluster (Draft badge → Duplicate → Save template → Generate bid CTA).
- Metrics strip: four equal cells with internal vertical hairlines.
- Phase card structure: header bar (index + chip + count + mini-pills + total) + body table with columns SKU / ITEM / COVERAGE / QTY / EACH / TOTAL.
- Summary sidebar content order and labels: SUMMARY → CUSTOMER PRICE → (display) → per sqft → cost rows (Materials, Labor, Overhead, Markup) → Total cost → PROFIT → (display + %) → progress bar with target marker → Generate bid CTA → Print order sheet.
- All visible copy on page 4 (labels, button text, sublabels, units).
- Customer-price and Profit display numbers rendered in **accent orange**.
- The progress bar fill in accent orange with a distinct lighter tick at 28% target.

**Has flexibility (±):**

- Exact font choice — use Fraunces / Inter / JetBrains Mono if available; otherwise the closest free alternatives that preserve the serif-vs-sans-vs-mono distinction.
- Exact hex values may drift ±2-4 RGB units; match the *relationship* between tokens (accent saturation, surface elevation steps, hairline contrast).
- Micro-spacing within ±4px on padding values.
- Hover state intensities (not depicted in PDF).
- Chevron iconography for collapsible phase headers (PDF does not show; add subtly).
- Exact width of the summary sidebar between 360px and 440px.
- Whether row dividers in the cost stack use a hairline or are removed in favor of generous whitespace — both read clean.

---

## 11. Implementation hints for the build agent

- Use CSS custom properties for every token in §1.1 / §1.2 / §1.3 / §1.4 / §1.5 so the calculator inherits without hardcoded values.
- Use `font-feature-settings: 'tnum' 1, 'cv11' 1;` on mono and `'tnum' 1, 'ss01' 1;` on Fraunces to lock tabular figures.
- Layout grid for desktop:
  ```css
  .calc-page {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 400px;
    gap: 28px;
    padding: 24px 40px 64px;
    max-width: 1440px;
    margin: 0 auto;
  }
  ```
- The metrics strip is a single CSS grid: `grid-template-columns: repeat(4, 1fr);` with `> * + *` getting `border-left: 1px solid var(--border-hairline);`.
- Phase header bar uses `display: flex; align-items: center;` with `margin-left: auto` on the right cluster wrapper.
- Tables: use a real `<table>` for semantics and `table-layout: fixed` with explicit `<col>` widths so columns don't shift between phases.
- Mini-pill inputs: `width: auto; min-width: 80px; max-width: 110px;` and use `text-align: left` with the unit suffix as an absolutely-positioned `<span>` inside the wrapper, OR use a flex wrapper containing the input + span — the spec prefers the wrapper approach for accessibility.
- Buttons: declare a single `.btn` base with variants `.btn--primary` (accent) and `.btn--secondary` (surface-2) so the dashboards / orders / bids pages can reuse.

End of spec.
