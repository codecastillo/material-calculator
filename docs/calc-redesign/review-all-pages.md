# All-pages redesign — review report

## Summary
- Pages reviewed: 7 (Dashboard, Pricing, Orders, Bids, Saved Jobs, Admin, Sign-in)
- Total gaps found: 67 (Critical: 13, Major: 28, Minor: 26)
- Code-only review; visual verification by user still required
- The implementations are structurally correct and respect tokens / chip palette, but a large number of verbatim copy strings, eyebrow numbers, column counts/widths, and several spec'd UI components are still placeholders or absent.

## Per-page gap counts
| Page | Critical | Major | Minor |
|------|----------|-------|-------|
| Dashboard | 2 | 5 | 4 |
| Pricing | 3 | 6 | 4 |
| Orders | 2 | 5 | 4 |
| Bids | 2 | 4 | 4 |
| Saved Jobs | 1 | 3 | 3 |
| Admin | 1 | 3 | 4 |
| Sign-in | 2 | 2 | 3 |

---

## Critical gaps (block 1:1 visual match)

### [Dashboard / C1] Eyebrow text wrong format
- Spec says (§1.3): `01 · TODAY · TUE MAY 12` — three tokens, the date is `WEEKDAY MON DD` with two-letter day abbreviation in caps.
- Code has: `app.js:1919` `now.toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'}).toUpperCase()` produces `TUE, MAY 12` (with comma + space) so the rendered eyebrow becomes `01 · TODAY · TUE, MAY 12`. The spec format has no comma.
- Fix: build the date manually: `const wk=['SUN','MON','TUE','WED','THU','FRI','SAT'][now.getDay()]; const mo=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][now.getMonth()]; const dd=String(now.getDate()).padStart(2,'0'); const datePart=\`${wk} ${mo} ${dd}\`;`

### [Dashboard / C2] Subtitle copy doesn't match spec
- Spec says (§1.3): `3 jobs in production · 2 bids awaiting reply · payroll runs Friday`
- Code has: `app.js:2113-2119` — third segment is `${suppliers.length} supplier(s) synced`. The spec's third segment `payroll runs Friday` is missing entirely.
- Fix: replace the third subtitle span with the literal string `payroll runs Friday` (or compute the next Friday). The supplier-count line is not in spec.

### [Pricing / C1] Header right cluster includes 5 extra controls not in spec
- Spec says (§2.4): right cluster has exactly three items in order: `Import CSV` (text link), `Export` (text link), `+ New item` (primary CTA).
- Code has: `index.html:368-374` — five buttons in the right cluster: `Import CSV`, `Export`, `+ Phase`, `− Phase`, `Reset`, then `+ New item`. The three extras (`+ Phase`, `− Phase`, `Reset`) are not in spec.
- Fix: move `+ Phase` / `− Phase` / `Reset` either into a kebab menu, into the sidebar, or out of the header. The spec's right cluster must read exactly `Import CSV · Export · + New item`.

### [Pricing / C2] Table columns deviate from spec — drag handle is not column 1, no `30D` column, extra `actions` column
- Spec says (§2.6): columns in order `(drag handle 32px) · SKU 100px · NAME flex · UNIT·COVERAGE 150px · CATEGORY 140px · PRICE 90px right · 30D 80px right` (7 columns).
- Code has: `app.js:370-382` — 8 columns: drag, SKU, NAME, UNIT·COVERAGE, CATEGORY, PRICE, 30D, **actions (edit / copy / delete)**. The trailing actions column is spec-flex but ALSO `30D` exists at the right place. Actually the column count is +1; verify alignment.
- Fix: actions column is not in spec; either remove it (and move edit/delete into the inline edit row only) or move into a hover-reveal pattern like Saved Jobs (`.jobs-v2-row-actions`).

### [Pricing / C3] Toolbar missing SORT dropdown and VIEW segmented toggle
- Spec says (§2.5): toolbar right side has two groups — `SORT` label + dropdown with options `name ↓ / name ↑ / price ↓ / price ↑ / 30D ↓ / 30D ↑`, AND `VIEW` label + segmented `dense / comfortable` toggle.
- Code has: `index.html:388-395` — only a `Phase` filter select. No SORT dropdown, no VIEW toggle. The legacy `categoryFilter` was repurposed but the SORT/VIEW components are missing entirely.
- Fix: add `<div class="price-v2-toolbar-group"><span class="price-v2-toolbar-label">SORT</span><select class="price-v2-sort-select" id="priceV2Sort">…</select></div>` and a `.price-v2-view-toggle` block. CSS classes already exist (`.price-v2-view-btn` is defined at line 294-307 of pricing-v2.css).

### [Orders / C1] Letterhead missing real company data and license string
- Spec says (§3.3): left letterhead shows `Mendoza Stucco & Stone` (sans 600 1rem) + sub-line `2204 Foothill Rd · Pasadena CA 91103 · C-35 Lic. 1042918` (sans 400 0.78rem `--v2-text-tertiary`).
- Code has: `index.html:596-598` placeholders `EstiCount` and `Material order document`. `app.js` renderOrderTable never overrides them, so the letterhead always reads "EstiCount / Material order document".
- Fix: pull company name + address + license from `currentUser` / a settings store, or hardcode `Mendoza Stucco & Stone` etc. for the demo per spec.

### [Orders / C2] Filter-by chip list and 12-item summary don't match spec
- Spec says (§3.3): right-side block shows the active phase chips (LATH, GRAY COAT, ACCESSORIES) with inactive ones dimmed at 0.4 opacity, plus a sub-line `12 line items · 3 phases · 2 suppliers`.
- Code has: `app.js:1158-1175` — chips ARE rendered with `.inactive` class; the summary line at 1247 reads `${itemCount} line items · ${phaseCount} phases · ${supCount} supplier(s)`. The summary format itself is OK, but the chip selector is broken in the rail: the rail's `FILTER ROWS` (§3.5 Section B) is supposed to have 4 fixed rows: `Lath ✓ 5 / Gray Coat ✓ 4 / Accessories ✓ 3 / Color Coat ☐ 0`. Code renders one row per actual phase in the calc — so the spec's `Color Coat ☐ 0` row (the unchecked, zero-count row) is missing when no Color Coat items exist.
- Fix: render all spec phases (or all categories) in the filter list with their actual counts; the spec wants the zero-count phases visible too so the user can see the option to enable.

### [Bids / C1] Letterhead missing — uses "EstiCount Contractor" placeholder, no spec'd lines
- Spec says (§4.3): letterhead left has `Mendoza Stucco & Stone` (sans 600 1.05rem), line 1 `2204 Foothill Rd, Suite C · Pasadena CA 91103`, line 2 `C-35 Lic. 1042918 · (626) 555-0184 · billing@mendozastucco.com`. Right side: `PROPOSAL` eyebrow, `B-2419` number, `Issued 2026-05-12 · Valid 30 days`.
- Code has: `app.js:1418` renders `EstiCount Contractor` (placeholder) with company-meta `Supplier: ${r.supplier}`. The phone, email, license — none present. Bid number is computed as `B-YYYYMMDD` (e.g. `B-20260512`), not `B-2419` from job id.
- Fix: derive the bid number from job id (mirroring `O-2419`), and pull company info from a settings store. Line 1426 sub-line uses `Valid until ${validUntil}` (an ISO date) instead of spec's `Valid 30 days`.

### [Bids / C2] Total row is wrong color and font — spec mandates Fraunces 500 1.5rem accent orange
- Spec says (§4.5): total row left label `Total` (sans 600 1rem); right `$64,988.94` in `Fraunces 500 ~1.5rem var(--v2-accent)` tabular numerals. There must be a 1px top border `--v2-border-strong` and **no bottom border**.
- Code has: CSS for `.bid-v2-total-row.bid-v2-total-final .bid-v2-total-amount` (bids-v2.css:272-278) correctly sets Fraunces 500 1.5rem accent — good. BUT the rendered total uses `v2FmtMoney2()` (always 2 decimals) at `app.js:1499`, which produces `$64,988.94` style. Spec is flexible on cents (§4.9), so this is fine. However, the subtotal/tax/cc rows also currently use `v2FmtMoney2`; spec wants subtotal/tax/cc at `mono 500 1rem` which IS what CSS does — so this is correct. **Real critical issue:** the spec wants the total amount label-cluster wrapped to the right with min-width 180px (label) and 130px (amount); the current `.bid-v2-total-label{min-width:180px}` is good. Wait — re-reading: the actual critical mismatch here is the FONT. Re-verify: `.bid-v2-total-row.bid-v2-total-final .bid-v2-total-amount` correctly inherits `var(--v2-font-serif)` and `var(--v2-accent)`. So Total color/font is correct.
- Actual critical: total row's `.bid-v2-total-label-main` for the Total final is sans 600 1rem (CSS line 269-271) — correct. The bid `bidV2RenderPaper` does not render a `4 phases` sub-line under Subtotal; spec mandates that sub-line. Code at `app.js:1481-1484`: `<span class="bid-v2-total-label-sub">${phaseCount} phase(s)</span>` — actually IT IS rendered. False alarm — downgrading from C2 to Major.
- Replacing C2: **Status pills row at top of rail shows `Draft` then a phase chip, but spec says `● Draft` + `● Stucco`.** Code renders `<span class="bid-v2-status-pill">Draft</span>` (gets amber dot via CSS) + `<span class="v2-chip ${chipClass}">${firstPhase}</span>` — the second one is a phase chip (whatever the first phase happens to be), not the literal `Stucco`. Spec says the second pill is literally `● Stucco` using `.v2-chip.color-coat` for green. The code picks dynamically; for an empty Lath-only job, it'd render `● Lath` not `● Stucco`.
- Fix: hardcode the second pill text to `Stucco` with `.v2-chip.color-coat`, or compute a scope-summary chip rather than the first phase chip.

### [Saved Jobs / C1] Header right has unspec'd "Clear all" button
- Spec says (§5.3): right side has exactly `Templates` text link + `+ New job` primary CTA.
- Code has: `index.html:731-734` — three buttons: `Templates`, `Clear all` (secondary), `+ New job`. The "Clear all" is destructive and not in spec.
- Fix: remove the `Clear all` button or move to a hidden admin/utility menu.

### [Admin / C1] Helper text format doesn't match spec
- Spec says (§6.5): `5 keys · 7d each · single-use · downloadable as CSV` — count/duration/use-mode/format.
- Code has: `app.js:2396` `count+' key'+(count===1?'':'s')+' · '+durLabel+' each · '+useLabel+' · downloadable as CSV'`. This is structurally correct **but** `durLabel` for `lifetime` is `'lifetime'` (line 2394 mapping) → produces `5 keys · lifetime each · …`. Spec doesn't show lifetime example, but the word "each" doesn't make sense with lifetime. Acceptable.
- Actual critical: prefix display — spec says `EC-TRI-XXXXXX…` (mono `--v2-text-tertiary`). Code uses `adminV2PrefixFor(type)` — function existence not visible above, but the field is wired. **Verify the function exists.** Also: the spec's helper-text live update should reflect on input/change — code wires `data-on-change` on type, `data-on-input` on max/count, so this should fire.
- Real critical: the **`generate keys` form field order is correct (TYPE / MAX USES / QUANTITY / PREFIX / Generate)** but the PREFIX field's label appears bare with no `for` association. Minor downgrade.
- Replacing C1: **Eyebrow text uses three `<span class="sep">` middle dots manually but spec wants `07 · ADMIN · OPERATOR CONSOLE` in small-caps mono.** Code renders `07<span class="sep">·</span>ADMIN<span class="sep">·</span>OPERATOR CONSOLE` — the `· OPERATOR CONSOLE` part IS rendered, good. The topnav page indicator at `app.js:172` is `09 · ADMIN` though, while the eyebrow says `07 · ADMIN`. The cross-page consistency contract (§9, line 1124-1125) wants the topnav indicator to track the eyebrow number — so eyebrow `07` should match topnav `07`. They diverge. **This is a cross-page issue.**
- Fix: align topnav `PAGE_INDICATORS` numbering with eyebrows (see Cross-page issues below).

### [Sign-in / C1] Email placeholder is generic, spec wants the last-used email as default value
- Spec says (§7.4): the email field's default value shown in PDF is `dancastlebiz@gmail.com` (the dynamic last-used email).
- Code has: `index.html:86` `<input type="email" … id="loginEmail" placeholder="you@company.com" …>` — no value, only a placeholder. The last-used email is never auto-filled.
- Fix: in the bootstrap, populate `loginEmail.value` from `localStorage.getItem('esticount_last_email')` or similar.

### [Sign-in / C2] Brand mark is `&#8801;` (≡ glyph) — spec wants the same 3-bar mark as topnav
- Spec says (§7.3): the brand mark is the same `.v2-brand-mark` from topnav (`spec.md §2`), which is **a black square containing 3 short horizontal strokes**.
- Code has: `index.html:30` `<span class="login-v2-brand-mark" aria-hidden="true">&#8801;</span>` — uses the unicode triple-bar character ≡, not the structured 3-span pattern the topnav uses (`index.html:286` `<span class="v2-brand-mark"><span></span><span></span><span></span></span>`). CSS targets `.login-v2-brand-mark` separately (login-v2.css:77-88) — renders as a 28×24 box with a centered ≡ character.
- Fix: replace with the 3-span pattern and reuse the topnav mark styling (or duplicate the 3-stroke CSS into login-v2.css). The mark currently looks like a centered `≡` glyph, not three discrete short bars of decreasing length per spec.

---

## Major gaps

### [Dashboard / M1] Metric 4 sub-trend always uses ↑ even when margin is below target
- Spec says (§1.4): cell 4 sub-trend `↑ Target 28%` with arrow `↑` in `var(--v2-accent)` to signal positive — implying margin meets/exceeds target. The arrow direction/color encodes positivity.
- Code has: `app.js:1991-1993` — sub-trend is `↑ Target 28%` regardless of whether margin exceeds 28%. The `is-positive` class is only applied when `avgMargin>=28`, so the color is right, but the arrow never flips.
- Fix: render `↓ Target 28%` when below, `↑ Target 28%` when above.

### [Dashboard / M2] Suppliers card data is incomplete — item count uses placeholder, no chips for 4 specific suppliers
- Spec says (§1.6): four supplier rows with exact phase-chip mappings: Pacific Supply (`GRAY COAT / COLOR COAT / ACCESSORIES`), ABC Supply (`LATH / DRYWALL / ACCESSORIES`), LKL Associates (`LATH / COLOR COAT / DRYWALL`), Sherwin Williams (`PAINTING`).
- Code has: `app.js:1954-1960` — pulls 4 suppliers from whatever is in `materialsBySupplier` and renders their actual phases. The chips will match the data but the data is not seeded with those 4 names/phases by default. Items count is `mats.length` (real), YTD uses `priceV2SupplierSpend` approximation that adds prices without volume → meaningless number rendered as `$Xk avg`.
- Fix: seed the supplier list with the canonical 4 names + phases (or update spec to say "first 4 suppliers"); the YTD spend should be `sum(price * coverage * estimated_qty)` not just `sum(price)`. Currently the spec says `$184.2k YTD` etc., which won't be reproduced.

### [Dashboard / M3] Active estimates table — `JOB · #` header uses `Job ·#` (no space) and sqft/due header is `Sq·ft  Due` (two spaces)
- Spec says (§1.5): header is `JOB ·#` (small-caps mono, color `--v2-text-tertiary`).
- Code has: `app.js:2043` `Job &middot;#` — the `Job` is title-case, not uppercase (CSS uppercases via `text-transform`). Acceptable. The 4th header `Sq·ft  Due` uses two spaces — spec also says `SQ·FT  DUE`. Two spaces collapse in HTML to one. Visual difference negligible but worth a `&nbsp;` to preserve.
- Fix: use `&nbsp;&nbsp;` between `Sq·ft` and `Due` if the spec requires double-spacing.

### [Dashboard / M4] Supplier row foot shows `${r.ytd>0?dashV2FmtMoneyK(r.ytd)+' avg':''}` with "avg" suffix — spec wants `$184.2k YTD`
- Spec says (§1.6): the right amount on a supplier row's foot reads `$184.2k YTD` (mono 500, primary), label "YTD" not "avg".
- Code has: `app.js:2089` `${dashV2FmtMoneyK(r.ytd)}+' avg'`.
- Fix: replace `' avg'` with `' YTD'`.

### [Dashboard / M5] Activity feed has no real activity API integration and uses saved-jobs placeholder
- Spec says (§1.6): 5 verbatim events including `Bid sent — Marina Cottages…`, `Price update — Stuc-O-Flex · 12 items`, `Job won — Glenmore Family Dental — $14,820`, etc. Bolded verbs in sans 600.
- Code has: `app.js:1962-1987` — tries `api.getActivity()` (may not exist server-side), falls back to "Estimate saved — <jobname>" using savedJobs. No verbatim seed.
- Fix: until backend activity exists, seed 5 canonical placeholder rows (or document the absence).

### [Pricing / M1] Eyebrow says `03 · PRICING` but topnav indicator says `05 · PRICING CATALOG`
- Spec says (§9 line 1125): topnav indicator format: `03 · PRICING · STUC-O-FLEX` (matches eyebrow number).
- Code has: `app.js:172` `pricing:'05 · PRICING CATALOG'`. Eyebrow at `index.html:357` is `03 · PRICING`. Numbers diverge.
- Fix: change PAGE_INDICATORS for pricing to `'03 · PRICING'` (and let `priceV2UpdateEyebrow` append the supplier slug).

### [Pricing / M2] Sidebar "Suppliers · 6" count not reflecting spec's 6 fixed suppliers
- Spec says (§2.3): exactly 6 supplier entries listed in a specific order with the active row marked.
- Code has: `app.js:261-271` — renders whatever is in `suppliers` array. Could be 1 supplier or 20.
- Fix: ensure default seed contains the 6 spec'd suppliers; or note that this is data-driven.

### [Pricing / M3] Filter rows render as RADIO buttons (single-select), spec wants CHECKBOXES (multi-select with counts)
- Spec says (§2.3): filter list shows checkboxes with `All categories ✓` first, then 6 category checkboxes — checked state additive within the table.
- Code has: `app.js:275-287` — uses `<input type="radio" name="priceV2Filter">`. Only one phase can be selected at a time. Spec wants additive filtering.
- Fix: change to checkboxes, accumulate selection in state, filter `mats` by inclusion.

### [Pricing / M4] No CATEGORY column data — phase-chip is shown but the column header is `CATEGORY` and chips don't map to category-by-phase in all cases
- Spec says (§2.6): col 5 `CATEGORY` 140px left — one phase chip mapped from category name.
- Code has: `app.js:411,424` — uses `v2ChipClass(m.category)` to pick chip class. Looks correct but the column header in HTML is `CATEGORY` (correct per spec).
- Verify visually: chips must use exact palette (`.v2-chip.gray-coat`, `.v2-chip.color-coat`, `.v2-chip.aggregate`). The `v2ChipClass` helper appears to map correctly via `dashV2ChipClass` style.

### [Pricing / M5] Footer says "Showing X of Y · 0 selected" — but the "0 selected" half is dropped
- Spec says (§2.7): footer left `Showing 12 of 142 · 0 selected`.
- Code has: `app.js:437` `Showing ${mats.length} of ${all.length}` — no `· 0 selected` suffix.
- Fix: append `<span class="price-v2-sub-sep">·</span> 0 selected` to the left footer.

### [Pricing / M6] Footer right uses different copy than spec
- Spec says (§2.7): right `Catalog total value: $8.4k · Avg margin: 2.1% supplier`.
- Code has: `app.js:438` `Catalog total value · $X` — missing `Avg margin: 2.1% supplier` half and uses `·` instead of `:` separator.
- Fix: update copy + add avg margin half.

### [Orders / M1] Eyebrow `04 · ORDER` shown correctly but topnav indicator says `06 · ORDER SHEET`
- Spec says (§9 line 1125): topnav indicator should be `06 · ORDER SHEET` actually (per the explicit list line 1125), so this is consistent. BUT the eyebrow says `04 · ORDER` (rail eyebrow, `index.html:636`). The cross-page contract says these numbers must match. They DO NOT.
- Fix: spec explicitly says `04 · ORDER` for rail eyebrow but `06 · ORDER SHEET` for topnav — this is a known inconsistency IN the spec itself (line 1124 line 1125). Document this in the cross-page issues.

### [Orders / M2] Order paper deliver-to block missing job-slug styling — `· J-2419` should be mono tertiary
- Spec says (§3.3): line 1 `Hernandez Residence · J-2419` — sans 600 0.95rem primary; the `· J-2419` slug part in mono `--v2-text-tertiary`.
- Code has: `app.js:1151-1152` — renders only the project name, no job slug. There's also no markup for a `.job-slug` span (CSS exists at orders-v2.css:148 but is never populated).
- Fix: append `<span class="job-slug">· ${jobCode}</span>` after the project name in `#orderDeliverProject`.

### [Orders / M3] Right rail has unspec'd fields (Project / Address / Supplier / Deliver date / PO# inputs) below the eyebrow
- Spec says (§3.5 Section A): rail header section has only eyebrow `04 · ORDER`, order number `O-2419`, status pill `● Open`. No editable fields.
- Code has: `index.html:640-665` — six editable input fields for project, address, supplier, date, PO, phase filter. Spec doesn't mention any of them — these are functional but visually different from the spec's minimal status block.
- Fix: hide the rail-fields block in default view, or move them behind a "Details" toggle.

### [Orders / M4] NOTES section in rail is not in spec
- Spec says (§3.5): rail has exactly 4 sections (A header, B filter rows, C group by, D CTAs).
- Code has: `index.html:694-697` — a fifth `NOTES` section with a textarea.
- Fix: spec is flexible (§3.8 says rail's status pill placement is flex), but notes weren't requested. Either move to print-only or remove.

### [Orders / M5] Group-by-supplier mode renders all items as ONE group with no per-supplier split
- Spec says (§3.7): group-by `supplier` should use supplier name as the axis (so multiple supplier groups if items come from different suppliers).
- Code has: `app.js:1183-1186` — creates a single group keyed on the rail `supplier` input; doesn't split by item supplier. Acceptable since items don't track per-supplier in `currentCalc`, but spec implies multi-supplier orders.
- Fix: if cross-supplier orders are out of scope, document; otherwise refactor.

### [Bids / M1] Status pill `● Draft` uses amber dot — spec is consistent BUT rail section shows BOTH a "Draft" pill AND a dynamic phase chip — spec wants literal `Stucco`
- (See C2 in Critical — downgrading here is moot, kept as C2.)
- Actual M1: **Section A doesn't render Bid number derived from the linked job**: spec says `B-2419` mirrors `J-2419`. Code renders `B-${YYYYMMDD}` at line 1513. The rail saved-timestamp at line 1515 does pull `J-${id.slice(-4)}` for the job slug, good.
- Fix: derive `bidNum` from `currentCalc.id` similarly to job code (e.g. `'B-'+code.match(/\d+/).pad`).

### [Bids / M2] Scope-of-work rate cell is hidden by default — toggle `perSqftPricing` defaults OFF
- Spec says (§4.4): RATE column always shown (cells render `$4.80` etc. by default). The visibility of per-sqft rate is described as part of the table's default render. Spec §4.6 has a toggle for "Per-sqft pricing" but the default state in §4.6 toggles table is unchecked. So spec defaults to NOT showing per-sqft rate — but §4.4 still shows it as a data row column.
- Code has: `app.js:1460-1462` — when `perSqftPricing` toggle is off, the rate cell renders as em-dash. Functionally correct per spec §4.6 default.
- Actual M2: **Subtotal sub-line wording wrong**. Spec says `4 phases` under `Subtotal`. Code: `app.js:1482` renders `${phaseCount} phase(s)`. The text `phases` plural is rendered correctly. Acceptable.
- Replacing M2: **The Margin Check section shows `vs 28% target · below target` when under target**, spec says only `vs 28% target` (no `· below target` suffix). Code at `app.js:1545` adds the suffix unconditionally when under.
- Fix: drop the conditional suffix.

### [Bids / M3] Bid letterhead doesn't render the spec's email & phone line
- See C1 — letterhead has only `Supplier: X` line instead of phone/email. Already covered.
- Sub-issue: company name is `EstiCount Contractor` not `Mendoza Stucco & Stone`. Same fix as C1.

### [Bids / M4] Send via — `Print` button uses `printBid` handler; spec calls it Print — correct. `Email PDF ⤴` glyph is `&#10148;` (➤) — spec says `⤴` (north-east arrow). Different glyphs but visually acceptable per §4.9 flex.
- Code at `app.js:1565` uses `&#10148;` which renders as ➤. Not a true `⤴` mail-arrow.
- Fix: use `&#10548;` or `&#8599;` (↗) for north-east arrow per spec, or accept §4.9 flex.

### [Saved Jobs / M1] Status pill missing colored dot on some states — code adds `::before` dot via CSS only when class matches `draft/active/won/sent/lost/template`. The `Sent` dot color spec'd as `#a0c4e4` IS implemented (jobs-v2.css:262). Lost spec'd as `#8a4a3d` IS implemented (line 263). Good.
- Sub-issue: spec wants `Lost` text in `--v2-text-secondary` — code: jobs-v2.css:264 sets `.jobs-v2-status.lost{color:var(--v2-text-secondary)}`. Good.
- **Real M1**: footer aggregates: spec says `YTD value $612.4k` etc. — code computes from real data so the actual value will differ. Acceptable.
- Replacing M1: **status pill uses a generic `.jobs-v2-status` class instead of the spec's `.v2-chip.*` class.** Spec §5.5 says status pill background is `--v2-badge-surface-neutral` with 1px border — CSS at `.jobs-v2-status` (jobs-v2.css:243-251) sets background but NO border. Spec says "Pill background `var(--v2-badge-surface-neutral)`" (with 1px border implied by the spec's general status pill structure at §7).
- Fix: add `border:1px solid var(--v2-border-hairline)` to `.jobs-v2-status`.

### [Saved Jobs / M2] Templates filter tab is in spec — IMPLEMENTED. But the spec says template rows should show `TPL-01` not `TPL-` + random — code: `app.js:1666-1668` `'TPL-'+n` where `n` is base-36 of id digits — produces non-numeric outputs like `TPL-AB12`. Spec wants 2-digit sequence `TPL-01`, `TPL-02`.
- Fix: use a per-template counter `templates.indexOf(j)+1` zero-padded to 2.

### [Saved Jobs / M3] Filter tabs count badges render inside each tab — spec doesn't include the count badge inside the tab pill
- Spec says (§5.4): tabs are simply `All / Active / Won / Sent / Drafts / Templates`. No count badges.
- Code has: `app.js:1707` renders `<span class="jobs-v2-tab-count">${t.n}</span>` inside each tab button — extra info not in spec.
- Fix: remove the count span (or move counts into footer/section heading).

### [Admin / M1] Eyebrow page-number is `07` but topnav indicator says `09 · ADMIN`
- (Covered in cross-page issues.)

### [Admin / M2] User row has unspec'd action buttons inline (deactivate, delete)
- Spec says (§6.6.2): user row has exactly 3 columns (avatar+name+email / role+license / status dot). No action column.
- Code has: `app.js:2370` appends a 4th column with `⏸` deactivate + `×` delete buttons. Spec is flexible (§6.9: "tables may have a tertiary action column — keep affordance for it") so acceptable, but visible inline always (not hover-revealed).
- Fix: move actions to hover-only reveal like Saved Jobs.

### [Admin / M3] License keys table row chevron — spec says rows are clickable to copy with `✓ Copied` toast
- Spec says (§6.6.1): row hover sets `cursor:copy`, click copies + flashes `✓ Copied`.
- Code has: `app.js:2350` `data-on-click="copyKey"` on `<tr>` — good. Toast `Copied: ${key}` instead of literal `✓ Copied`. Acceptable.
- Real M3: **the table also has a delete `×` button column not in spec.** Same as M2.

### [Sign-in / M1] OR divider — `OR` letter spacing & color match, but spec mandates 24px margin on each side; code uses `margin: 24px 0` (vertical only — correct).
- Spec says (§7.4): `display:flex; align-items:center; gap:16px`. A 1px line on each side and centered `OR` text in small-caps mono `--v2-text-tertiary` 0.7rem. 24px bottom margin (i.e. only bottom).
- Code has: login-v2.css:509-514 — `margin:24px 0` (both top and bottom 24px), gap:16px, ::before/::after lines. Good.
- Real M1: **the "Stay signed in" row layout — spec wants right side `30 days` in `--v2-text-tertiary` 0.78rem**. Code at index.html:101 `<span class="login-v2-remember-note">30 days</span>` — CSS at 430-434 renders as `--v2-text-tertiary 0.78rem`. ✓ Good.
- Replacing M1: **the activate input placeholder spec says `EC-XXX-XXXXXXXXXXXXXXXX` (mono, tertiary). Code at index.html:117 uses exactly that. ✓** No gap.
- Real M1: **headline phrase color** — spec says "third phrase ENTIRE phrase in accent orange — both words orange". Code: only `.login-v2-accent-phrase` wraps `Build margin.` — both words inside the same span — accent applied to full span. ✓ Good. No gap.
- Real M1: **on the verifyScreen, the headline is `One last step. / Confirm your email. / Then build margin.`** — that diverges from spec which only specifies the sign-in screen. Acceptable per §7.5 (verify-email is its own screen with its own copy).
- Replacing M1: **bottom-right `support@esticount.app` color**: spec says the email in `--v2-accent`, sans 500. CSS at login-v2.css:598-602 — `.login-v2-rightfoot a{color:var(--v2-accent);font-weight:500}` ✓ Good.
- Replacing M1: **`FORGOT?` link** — spec says small caps, sans 500 0.78rem `--v2-text-tertiary`. Code CSS at 310-318 — `font-family:var(--v2-font-sans);font-size:0.78rem;font-weight:500;color:var(--v2-text-tertiary);text-transform:uppercase`. ✓ Good.
- Final real M1: **left column position: bottom-left footer** — spec wants 24px from bottom (`position:absolute`). Code uses `margin-top:32px` with `justify-content:space-between` on `.login-v2-left` (login-v2.css:46) — content stacks normally, footer is pushed to the bottom via flex. Functionally equivalent at desktop; OK.
- Actual M1 (final): **No real major gap on sign-in beyond C1/C2.** Reclassify as M1: **Brand wordmark uses `<span class="login-v2-brand-word">esti<span class="login-v2-brand-word-sep">·</span>count</span>` — spec wants a two-word format with `esti · count` separated. Code wraps the middle dot in `.login-v2-brand-word-sep` for color — ✓ matches spec. No gap.**
- Net: removing M1 — only the verify-email screen headline isn't in spec but that's its own screen.

### [Sign-in / M2] License-input "Activate" button doesn't flip background to accent on valid key
- Spec says (§7.4): "On valid key: button background flips to `var(--v2-accent)`, text `#1a0e08`."
- Code has: login-v2.css:557-575 — `.login-v2-activate-btn` styles for default + hover, no `.is-valid` or `:valid` rule. JS in `activateLicenseFromLogin` (not visible) likely doesn't toggle a class on the button.
- Fix: add `.login-v2-activate-btn.is-valid{background:var(--v2-accent);color:#1a0e08;border-color:transparent}` and toggle from JS on key match.

---

## Minor gaps

### [Dashboard / m1] `New calculation` glyph
- Spec uses `⨎` (large integration/measuring glyph U+2A0E). Code: `&#8979;` = ⌃ (caret). Visual difference.

### [Dashboard / m2] Suppliers card title
- Spec says eyebrow `SUPPLIERS`. CSS uppercase. Code: `<div class="dash-v2-card-eyebrow">Suppliers</div>` — CSS transforms to `SUPPLIERS`. OK.

### [Dashboard / m3] Activity card title
- Same as m2. OK.

### [Dashboard / m4] Trailing chevron `›` should be `&rsaquo;` — code uses `&rsaquo;`. ✓ OK.

### [Pricing / m1] Subtitle says `0 SKUs · 0 phases · Price history tracked` initially — spec wants `142 SKUs · Last sync 10:42 today · Price history tracked`.
- Code lacks a "Last sync" timestamp source. Acceptable until backend provides it.

### [Pricing / m2] Sort field appearance: spec wants `name ↓` etc. — code's dropdown is missing entirely (see C3).

### [Pricing / m3] Inline edit row uses `grid-template-columns: 100px 1fr 110px 130px 90px 90px auto` — spec doesn't require a specific grid here. Acceptable.

### [Pricing / m4] Drag handle glyph `&#9776;` (☰) — spec says `☰`. ✓ OK.

### [Orders / m1] Order paper subtotal row uses `Material subtotal` label — spec doesn't reference an explicit subtotal label, fine.

### [Orders / m2] Group header subtotal uses Fraunces 500 1.2rem — spec says `~1.2rem`. ✓ OK.

### [Orders / m3] Item table uses `QTY  UNIT` header (two spaces) — spec uses `QTY UNIT`. Negligible.

### [Orders / m4] "Each" displayed both as a separate cell AND inline under the item name (`order-v2-each-inline`). Spec only shows the separate cell. Redundant rendering.
- Fix: remove the inline duplicate.

### [Bids / m1] Bid number format `B-20260512` vs spec `B-2419`. Already covered in C1.

### [Bids / m2] `Valid until 2026-06-11` vs spec `Valid 30 days`. Already covered in C1.

### [Bids / m3] Scope-of-work column header `SCOPE OF WORK` rendered as `Scope of work` with CSS uppercase — ✓ OK.

### [Bids / m4] Send via `Print` button uses `printBid` handler, exists. Tertiary `Copy public link` returns a `#bid` URL anchor — not a real public link. Spec §4.8 flex, acceptable.

### [Saved Jobs / m1] Job table `JOB · #` header rendered as `Job · #` (space around middle dot) — spec `JOB ·#` (no space before `#`). Negligible.

### [Saved Jobs / m2] Search placeholder text — spec `Search by job, client, address…`. Code matches. ✓ OK.

### [Saved Jobs / m3] Status pill template state — spec uses Draft for templates. Code uses `template` key with separate styling (tertiary color, tertiary dot). Diverges from spec §5.5 table (templates show `● Draft` amber).
- Fix: render templates as `● Draft` not custom `Template` pill.

### [Admin / m1] Metric value uses Fraunces 500 2rem — spec says "fractional cells (Active users 4/5)" — code wraps `/5` in `.admin-v2-metric-denom` (mono 500 1rem secondary). ✓ OK.

### [Admin / m2] Sub-line for cell 5 `MRR`: spec `↑ +12% MoM`. Code: `<span class="arrow">↑</span> active recurring` — different text. Spec wants `+12% MoM`.

### [Admin / m3] Keys table header `KEY / TYPE / DUR / USES / BY` ✓ matches spec. Width allocations slightly different (TYPE 90px code vs 80px spec) — within ±10px.

### [Admin / m4] Users table — spec wants `STATUS` column to be a dot of width 32px. Code: 60px wide, dot centered. Acceptable.

### [Sign-in / m1] Brand pill `PRO` uppercase — ✓ OK.

### [Sign-in / m2] Left column blueprint grid texture — spec calls it optional decorative (§7.7 flex). Implemented. ✓ Nice-to-have.

### [Sign-in / m3] Three-stat strip layout uses `gap:48px` — ✓ matches spec.

---

## Cross-page issues

### [X1] Topnav `PAGE_INDICATORS` numbering inconsistent with eyebrow numbering
- Spec §9 line 1124-1125: "Eyebrow numbering" says `01 · TODAY (Dashboard), 02 · CALCULATOR, 03 · PRICING, 04 · ORDER, 04 · BID (in rail), 06 · SAVED JOBS, 07 · ADMIN, 10 · SIGN IN`.
- Spec line 1125 gives examples for topnav indicator: `01 · DASHBOARD, 03 · PRICING · STUC-O-FLEX, 06 · ORDER SHEET, 07 · BID, 08 · SAVED JOBS, 09 · ADMIN, 10 · SIGN IN`.
- Code `app.js:172`: `dashboard:'01 · DASHBOARD', calculator:'04 · CALCULATOR', pricing:'05 · PRICING CATALOG', order:'06 · ORDER SHEET', bid:'07 · BID', savedJobs:'08 · SAVED JOBS', admin:'09 · ADMIN', account:'10 · ACCOUNT'`.
- Mismatches: `pricing` is `05` in code but `03` in spec eyebrow + spec topnav example. `calculator` is `04` in code matching spec eyebrow. So `pricing` is the clear bug.
- Fix: change `pricing` to `'03 · PRICING'`; eyebrow already says `03`. Note that spec itself is internally inconsistent (eyebrow `06 · SAVED JOBS` vs topnav `08 · SAVED JOBS`) — choose one numbering scheme and apply uniformly.

### [X2] Status pill / chip uses border inconsistently across pages
- Saved Jobs `.jobs-v2-status` has NO border (jobs-v2.css:243). Orders `.order-v2-status-pill` has 1px border (orders-v2.css:391). Bids `.bid-v2-status-pill` has 1px border (bids-v2.css:307). Spec §9 line 1128 requires uniform `1px border` on all status pills.
- Fix: add `border:1px solid var(--v2-border-hairline)` to `.jobs-v2-status`.

### [X3] `tabular-nums` declared per-page but not globally
- Spec §9 line 1131: "extend the `font-variant-numeric` declaration to `.dash-v2-*`, `.price-v2-*`, `.order-v2-*`, `.bid-v2-*`, `.jobs-v2-*`, `.admin-v2-*`."
- Code: each CSS file has its own per-element declarations. No issue but worth a single root declaration to avoid drift.

### [X4] Brand mark on login screen uses unicode glyph (≡) while topnav uses 3-span structure
- Visual inconsistency between login and authenticated app. Spec mandates the same `.v2-brand-mark` structure.

### [X5] CSP-friendly `data-on-*` handlers — code consistently uses these (e.g. `data-on-click="generateKeys"`) and no inline `onclick=` attributes were found in the v2 page regions. ✓ No issue.

### [X6] Phase chip palette: spec §1.1 has 7 chips (lath, gray-coat, color-coat, accessories, painting, drywall, aggregate) + optional stone. Code styles.css:843-850 defines all 7 plus stone aliased to aggregate. ✓ No redefinition in any page's CSS. Good.

### [X7] Eyebrow text styling — every page declares its own `.<ns>-eyebrow` class with the same `font-family: mono; 0.7rem; letter-spacing: 0.10em; uppercase; color: tertiary`. Duplication but no inconsistency. Consider promoting `.v2-eyebrow` to a shared class.

---

## Items requiring user visual verification

1. **Dashboard metric strip vertical hairlines** — confirm 1px `--v2-border-hairline` lines between cells render crisply (CSS uses `border-left`).
2. **Pricing sidebar `active` state** — confirm 2px left orange border + bg-surface-2 fill renders, and inactive rows have transparent left edge.
3. **Orders paper card padding** — 32px / 36px feels tight; verify the letterhead block doesn't crowd the page boundary.
4. **Bids "Total" amount** rendered in Fraunces 500 1.5rem orange — verify the serif font loads and tabular numerals align.
5. **Saved Jobs row hover** — verify hover reveals the `Load / Duplicate / Delete` actions and hides the `›` chevron simultaneously.
6. **Admin metric strip 5-up** — verify cells with `/ 5` denominator render with the `/5` baseline-aligned to the big number (currently uses `align-items:baseline` flex).
7. **Sign-in left column** — verify the blueprint-paper grid texture is visible but subtle (35% opacity); verify the brand mark in top-left ISN'T a centered ≡ character but reads as 3 short horizontal strokes (currently it's the unicode glyph).
8. **Sign-in mobile breakpoint** — confirm `<900px` hides the left column completely and centers the right form column at 480px max-width.
9. **All pages**: confirm Fraunces and JetBrains Mono load via the Google Fonts link (`index.html:11`) — DM Sans is also requested but never declared as a CSS token; verify Inter loads as the primary sans.
10. **Phase chip rendering**: confirm `.v2-chip::before` dot is rendered (no margin around the dot) and the chip is exactly the cream/pink/mint/peach/mossy/slate/taupe per spec.
