# Calculator redesign — review report

## Summary
- Total checks performed: ~110 (every named spec token, every section structure, every label/copy claim, every chip-palette pair, every responsive rule)
- Gaps found: 31 (Critical: 4, Major: 13, Minor: 14)
- Code-only review; visual verification by user still required (font rendering, actual color appearance under monitor, hover states, real-world overflow at intermediate viewport widths)
- Files reviewed: `frontend/index.html` (lines 1–531), `frontend/css/styles.css` lines 478–999 (v2 block) plus context, `frontend/js/app.js` lines 170–877 (renderCalcResults + helpers + nav code)

---

## Critical gaps

### [C1] Calculator page is constrained by legacy `.main-container` (1300px / 20px padding) and never reaches the spec's 1440px × 40px gutters
- **Spec says:** §11 layout grid `padding: 24px 40px 64px; max-width: 1440px; margin: 0 auto;`. §1.4 “Page outer horizontal margin: 40px”. §2 “Horizontal padding: 40px desktop”.
- **Code has:** `frontend/index.html:133` `<main class="main-container">` wraps the calculator page. CSS `styles.css:56` `.main-container{max-width:1300px;margin:0 auto;padding:20px;width:100%}`. The `.calc-v2-page` rule (`styles.css:999`) sets its own `max-width:1440px;padding:0 40px 64px` but is nested inside `.main-container`, so the effective max content width is 1300−40 = 1260px, and the actual horizontal gutter from the viewport edge to content is 20px (main-container) + 40px (calc-v2-page) = 60px on each side. Visually the page will look pinched vs. the spec, and the topnav (also 40px-padded but inside its own 1440px container) won't align with the page content edges.
- **Why it matters:** The whole page sits ~140px narrower than spec, and the topnav and page-body left edges will visibly disagree.
- **Suggested fix:** Either (a) move `#calculatorPage` out of `.main-container` (wrap it in its own outer element with no padding/max-width), or (b) add `.calc-v2-page` parent override: `body:has(#calculatorPage.active) .main-container{max-width:none;padding:0}`, or (c) the simplest — change `.main-container` for the calculator-active state. Without this, every other measurement in the spec (28-32px gap, 380-420px sidebar, 16px header gaps) is off-scale.

### [C2] Cost-stack rows are missing the `Overhead` row and are in the wrong order
- **Spec says:** §6.3 / §10 list order is fixed: `Materials → Labor → Overhead → Markup → Total cost`. Overhead has sublabel `8.0% of materials`. §10 marks this order as 1:1.
- **Code has:** `app.js:835-841`. The rows array is built as `Materials → (Tax if any) → Labor → (Delivery if any) → Markup → (CC Fee if any)`. **There is no Overhead row anywhere.**
- **Why it matters:** The spec specifically marks the cost-stack labels and order as 1:1. Adding Tax/Delivery/CC-Fee is fine functionally but Overhead is in the spec's canonical example and is absent. The reorder also breaks visual reading order.
- **Suggested fix:** Either compute an overhead figure from existing data (e.g., delivery + cc fee re-labeled as "Overhead" with combined sublabel) or render a placeholder Overhead row showing `$0 — not modeled`. At minimum reorder so that any optional rows (Tax / Delivery / CC Fee) appear AFTER Markup and the Materials → Labor → (Overhead) → Markup spine is preserved.

### [C3] Sidebar includes an unspecified third CTA (`Save job`)
- **Spec says:** §6.6 / §10 — exactly two CTAs in the sidebar: `Generate bid →` (primary) and `Print order sheet` (secondary). §10 explicitly lists this in the 1:1 contract.
- **Code has:** `index.html:362-366` adds a third button: `<button class="calc-v2-btn calc-v2-btn-secondary calc-v2-btn-block" data-on-click="saveJob">Save job</button>`.
- **Why it matters:** Breaks the spec's exact two-button stack. The page already exposes `Save template` in the header (line 208), so saving is reachable elsewhere.
- **Suggested fix:** Remove the third sidebar button (`index.html:365`). If saving must remain a sidebar affordance, demote it to a text link below the secondary button.

### [C4] Phase chip label always appends "Phase" — Gray Coat / Color Coat / Accessories etc. should NOT have "Phase" suffix
- **Spec says:** §5.4 verbatim shows the chip text as `● LATH PHASE` for phase 01 but `● GRAY COAT` for phase 02. Only Lath uses the "Phase" suffix in the spec's example.
- **Code has:** `app.js:781` `<span class="v2-chip ${chipCls}">${escHtml(cat)} Phase</span>` — every chip is unconditionally appended with " Phase". Result: Gray Coat renders as "GRAY COAT PHASE", Color Coat as "COLOR COAT PHASE", etc.
- **Why it matters:** Wrong copy on every phase header except Lath. Spec §10 lists "header structure" as 1:1.
- **Suggested fix:** Only append " Phase" when `cat === 'Lath'`, OR drop it entirely (PDF page references suggest the dashboard chips never include "PHASE"; only the calc page does, and only on Lath).

---

## Major gaps

### [M1] Mobile/tablet breakpoint is wrong
- **Spec says:** §9 mobile rules trigger at `< 768px` (the spec is explicit: "At narrow widths (`< 768px`)").
- **Code has:** `styles.css:977` and `styles.css:982` use `@media(max-width:1100px)` and `@media(max-width:900px)`. There is no 768px breakpoint.
- **Suggested fix:** Either change the second breakpoint to 768px or add a third media block for `<768px` that applies the spec §9 stacking rules.

### [M2] Bottom-tab-bar for mobile not implemented (acknowledged deviation)
- **Spec says:** §9 mobile nav becomes a bottom tab bar `Home · Calc · Orders · Bids · More` with icons + tiny mono labels + active orange underline.
- **Code has:** Existing hamburger retained (`index.html:86`). Builder reported.
- **Why it matters:** Builder noted this; reasonable scope-cut but should be tracked for follow-up.

### [M3] Progress-bar "target 28%" label is not aligned to the tick
- **Spec says:** §6.5 "Center: `target 28%` ... Center-aligned by sitting flush at `left: 56%` with a `transform: translateX(-50%)` so it lines up exactly under the tick."
- **Code has:** `styles.css:962-963` `.calc-v2-progress-labels{display:flex;justify-content:space-between;...}` — middle label is centered by space-between distribution, not anchored to 56%.
- **Suggested fix:** Switch the labels container to `position:relative` and absolutely position `.calc-v2-progress-target` at `left:56%;transform:translateX(-50%)`, with `0%` at left:0 and `50%` at right:0.

### [M4] Progress fill scale is over the 0-50% range, not 0-100%
- **Spec says:** §6.5 "Fill: from 0% to 18%, background `--accent`, ...The fill is exactly 18/50 = 36% of the track width." So 100% of bar = 50% margin. Code matches conceptually, but...
- **Code has:** `app.js:866` `const pct=Math.max(0,Math.min(50,margin))/50*100;` — correctly maps 0-50% margin into 0-100% width.
- **Status:** Actually matches. Leaving as info, not a gap.

### [M5] `Each` column header is in mixed case in HTML; relies on CSS `text-transform: uppercase`
- **Spec says:** §1.3 small-caps eyebrows for column headers (`SKU ITEM COVERAGE QTY EACH TOTAL`).
- **Code has:** `app.js:798-803` emits `SKU / Item / Coverage / Qty / Each / Total`. CSS `styles.css:862` `text-transform:uppercase` on `.calc-v2-phase-table thead th` should render them uppercase.
- **Why it matters:** Display result is correct, but the source HTML mixed-casing is inconsistent. If someone tightens accessibility tooling later, screen readers may speak "Each" rather than "EACH" — usually preferable, so this is mostly a stylistic note. Not a blocker.

### [M6] QTY column width is 80px, spec says 70px
- **Spec says:** §5.3 column widths table: `QTY | 70px fixed`.
- **Code has:** `styles.css:856` `.calc-v2-phase-table colgroup col.col-qty{width:80px}`.
- **Suggested fix:** Change to 70px (or accept 80px under the ±4px microspacing flexibility in §10; 80 is 10 over spec — slightly outside the tolerance).

### [M7] Eyebrow separator alignment uses `gap` with no extra space around the `|`
- **Spec says:** §3 eyebrow line: `02 · CALCULATOR  |  JOB J-2419` with the `|` separator at same color and "8px gap on either side".
- **Code has:** `index.html:201` puts label, separator, and job code as three siblings inside a flex container with `gap:var(--v2-s2)` (8px). Functionally renders 8px before AND after, which matches. OK.
- **Status:** Matches spec — info only, not a gap.

### [M8] Subtitle uses `·` separators in `--text-tertiary` (correct), but the subtitle "Stucco re-coat" can be wrong scope
- **Spec says:** §3 subtitle example `4218 Briar Creek Dr · Stucco re-coat · 3,840 sq·ft exterior`.
- **Code has:** `app.js:678-680` replaces the middle text with `getSelectedPhases().slice(0,3).join(' / ')` — uses `/` not `·` as the inner-text separator. And `Stucco re-coat` is only shown if there are 0 selected phases (it gets replaced).
- **Why it matters:** The middle slot shows `Lath / Gray Coat / Color Coat` (with slashes), not the spec's expected freeform scope description. Not a 1:1 reproduction of the example, but acceptable since the spec doesn't constrain the dynamic content.
- **Suggested fix:** Optional — drop the `/` joiner in favor of comma+space, and consider keeping `Stucco re-coat` as a stable label when there's a primary scope.

### [M9] Customer-price sub-row "per sqft" label is sans-400 but spec wants it grouped with the right-aligned value
- **Spec says:** §6.2 sub-line is one row with `display: flex; justify-content: space-between;` — Left "per sqft" (sans 400, 0.78rem, --text-secondary), Right "$9.56" (mono 500, 0.85rem, --text-primary).
- **Code has:** `styles.css:907-915` — matches structure and values. OK.
- **Status:** Matches spec — info only.

### [M10] Body global font is `DM Sans` at 15px, not Inter at 14px
- **Spec says:** §1.2 Global body `font-family: var(--font-sans); font-size: 14px;` where `--font-sans` = `Inter, system-ui, ...`.
- **Code has:** `styles.css:27` `body{font-family:'DM Sans',system-ui,sans-serif;background:var(--bg);color:var(--text);min-height:100vh;font-size:15px;line-height:1.6;...}`.
- **Why it matters:** The v2 page scopes its own font-family to Inter inside `.calc-v2-page`, so the calculator looks correct. But surrounding chrome (login screen, page-header back button, modals, dashboard cards) still pages in DM Sans at 15px / 1.6. If you navigate away from the calculator the typography stops matching the spec's global rules.
- **Suggested fix:** If a global rebrand is in scope, switch `body` to Inter 14px / 1.45. Otherwise document that the spec's "global body" only applies to calculator-page descendants and leave alone.

### [M11] Page-indicator `04 · CALCULATOR` is hidden at `<900px` instead of remaining visible in some form
- **Spec says:** §2 "Far right, BEFORE the avatar". §9 doesn't say to hide it on mobile.
- **Code has:** `styles.css:985` `.v2-topnav-indicator{display:none}` inside `@media(max-width:900px)`.
- **Suggested fix:** Either keep it visible (with smaller font on mobile) or document this as intentional. Spec §9 only collapses the primary nav to a bottom tab bar, not the indicator.

### [M12] `Save template` text-link routes to `saveJob` but spec implies it should save the current state as a template (no project details)
- **Spec says:** §3 #3 "Text link `Save template`".
- **Code has:** `index.html:208` `<button class="calc-v2-text-link" data-on-click="saveJob">Save template</button>` — calls the same `saveJob` handler as Save Job, but does not pre-check `saveAsTemplate`. So clicking "Save template" opens the same modal as a regular save.
- **Why it matters:** The label promises a template save; the affordance saves a regular job. Behavior mismatch from copy.
- **Suggested fix:** Either add a `saveTemplate` wrapper that pre-checks `#saveAsTemplate`, or rename the link.

### [M13] License/theme/avatar buttons crowd the topnav-right area
- **Spec says:** §2 right-side order: search → page indicator → avatar. Nothing else.
- **Code has:** `index.html:103-120` topnav-right also contains a `license-badge` ("TRIAL") and a `theme-toggle` button between the indicator and avatar.
- **Why it matters:** Spec marks the topnav layout as 1:1. Extra controls compete with the indicator and avatar for space.
- **Suggested fix:** Move `licenseBadge` and `theme-toggle` into the user-dropdown menu or relocate them. At minimum, mark them as "deferred chrome" and confirm with the user before deploying.

---

## Minor gaps

### [m1] Brand mark bars use 14/11/8px widths, spec only says "3 short horizontal strokes in a slightly lighter tone"
- **Code:** `styles.css:547-549` renders three bars at 14px/11px/8px (a stepping pattern). Spec doesn't dictate, but does say "≡-like horizontal-bars icon" — implying equal-width bars.
- **Suggested fix:** Optional — equalize bars or leave as artistic choice. Visual verification by user.

### [m2] Brand wordmark gap between `esti` `·` `count` is 4px
- **Code:** `styles.css:550` `gap:4px`. Spec doesn't pin this exactly. Likely fine.

### [m3] PRO pill `padding:2px 6px` matches spec; OK.

### [m4] Topnav links gap is `--v2-s5` (20px), spec says "20–24px gap"
- **Code:** `styles.css:560` `gap:var(--v2-s5)` = 20px. At the low end of spec range. OK.

### [m5] Active topnav link underline is at `bottom:-1px` — spec says "flush at the bottom of the topnav (NOT on the text)"
- **Code:** `styles.css:573-576` `.v2-nav-link.active::after{...bottom:-1px;...}`. With the topnav's 1px bottom border, this positions the underline overlapping the border. Should be `bottom:0` so it sits flush at the topnav bottom edge AND overlays the hairline.
- **Suggested fix:** Try `bottom:-1px` (overlaps hairline — current) vs `bottom:0` (sits 1px inside). Visual verification needed.

### [m6] Search input height is 32px; spec says 32px. OK.

### [m7] Search input font-size is `.84rem`; spec implies body-sized text. Inputs typically use body font.
- **Code:** `styles.css:586-589` — placeholder fine.

### [m8] `.v2-topnav-right` gap is `--v2-s3` (12px) — spec says "12px gap between indicator and avatar". OK for indicator↔avatar but ALSO governs search↔indicator. Fine.

### [m9] Topnav search appears to render even at narrow widths until 1100px hides it
- **Code:** `styles.css:980` `.v2-topnav-search{display:none}` at 1100px. Spec says "max-width ~360px" — implied to keep visible on desktop. Hiding at 1100px is aggressive (kills it on small laptops too).
- **Suggested fix:** Hide only at <900 or <768 not 1100.

### [m10] Status badge dot is hardcoded to `--v2-accent` (always orange)
- **Spec says:** §3 "on this page the dot is the accent orange ... to indicate draft-state-not-yet-active. Use `--accent` for the Draft dot, `--status-dot-green` for Active/Open variants."
- **Code:** `styles.css:651` `.calc-v2-status-dot{...background:var(--v2-accent);...}`. Fine for Draft state. The badge text is hardcoded to "Draft" in HTML (`index.html:206`), so this is OK for current single-state implementation. Tracked for future status variants.

### [m11] Status badge is `<span>` not a clickable popover (acknowledged deviation)
- Builder reported. Spec §8 marks popover as out-of-scope visually. OK.

### [m12] CTA button arrow uses `&rarr;` (`→`) — same as spec. OK. Color inherits from button (`#1a0e08`). OK.

### [m13] Profit % font is sans 500 1rem — spec says "sans 500, 1rem, `--text-secondary`" — code matches.
- **Code:** `styles.css:947-950`. OK.

### [m14] Phase index gap to chip is `--v2-s4` (16px) per `.calc-v2-phase-bar` `gap:16px`. Spec §5.2 "14px right margin" on index.
- **Code:** `app.js:779` `<span class="calc-v2-phase-index">${idxStr}</span>` then `<span class="calc-v2-phase-meta">...` — uses parent flex gap of 16px between index and meta. Spec asks 14px right margin. Within ±4px tolerance.

### [m15] No focus-visible outline on the supplier select (`appearance:none`)
- **Code:** `styles.css:708` `.calc-v2-supplier-select:focus{outline:none}` removes focus ring entirely. Accessibility regression. Add a focus-visible style (e.g., outline 2px solid --v2-accent).

### [m16] CSS sets `letter-spacing:-0.005em` on title; spec says `-0.005em`. OK.

### [m17] Mini-pill label is part of the same flex span as the value — visually equivalent to spec's "label outside pill" arrangement. The `gap:8px` between label and value matches "Right-margin 8px" on label. OK.

### [m18] Phase total uses serif 500 1.4rem; spec says ~1.4rem serif 500. OK.

### [m19] Comparison section still rendered when "All Suppliers" picked
- Out of spec scope but worth noting it lives in `#comparisonSection` and is hidden by `styles.css:974`. Fine.

### [m20] `colgroup` defines col-qty as 80px but spec says 70px (duplicated in M6).

---

## Builder's reported deviations — validated

1. **Mini-pills are display-only `<span>` not `<input>`** — Spec §5.2 / §8 both call for editable inputs. Deviation is real. Acceptable rationale (data model keyed by scope, not phase) but means the spec's "On focus: border becomes --accent" and "blur reformats with thousands separators" interaction never happens. **Status: documented deviation, OK for v1, should be revisited if/when phase-level dim editing is supported.**

2. **Supplier dropdown is a native `<select>` styled with CSS caret** — Spec §4 / §8 call for a custom button-triggered popover. Native select forecloses the "panel opens flush under the cell, same width, --bg-surface-2 background" interaction. **Status: partial match — visually approximate, behaviorally different. OK if you accept the native dropdown chrome.**

3. **Thickness mini-pill on Gray Coat is hardcoded `3/8 in`** — Spec §5.4 phase 02 shows `THICKNESS 3/8 in`. Hardcoding matches the only visible example. **Status: matches spec.**

4. **Status badge is a span, not a popover** — Spec §8 says popover is "out of scope visually" so a span is acceptable. **Status: matches spec.**

5. **Mobile bottom-tab-bar not implemented** — Spec §9 calls for it. Deviation noted; existing hamburger preserved. **Status: known deviation; flag for follow-up.**

6. **`Openings` metric shows `0`** — Spec §4 lists it; data model has no concept. Showing 0 is acceptable display, but consider hiding the cell entirely on first paint so it doesn't read as "$0 openings" misinformation. **Status: acceptable display deviation.**

---

## Items requiring user visual verification

These cannot be confirmed from code alone:

1. **Fraunces / Inter / JetBrains Mono actually load** (Google Fonts URL is `Fraunces` + `Inter` + `JetBrains Mono` + `DM Sans`; confirm no 404s in browser console).
2. **Customer-price `$N` renders in coral-orange** at 3rem — easy to verify by eyeballing the sidebar.
3. **Profit number renders in coral-orange** at 2rem.
4. **Phase chip colors look like pastels, not muddy** — Lath cream, Gray Coat pink, Color Coat mint, etc.
5. **Topnav underline anchored to topnav bottom, not overlapping nav link's own padding** — see [m5].
6. **Sidebar width feels ~36% of content** — between 380-420px range.
7. **Hover states**: text links shift to `--text-primary`, table rows tint to `#161b22`, primary CTA tints to `--accent-hover`.
8. **Phase-card collapse animation** — chevron rotates 180° with `transition: transform 150ms ease`.
9. **Editable QTY inputs feel right** — alignment, focus border, no scroll-wheel surprises.
10. **Native `<select>` caret on supplier dropdown** doesn't clash with the spec's custom-caret look.
11. **Page edge alignment** between topnav-inner (1440px max, 40px pad) and calc-v2-page content (currently bound by 1300px main-container). Almost certainly misaligned — see [C1].
12. **Mobile layout at <768 / <900 / <1100** — verify nothing overflows, sidebar stacks correctly.

---

## Recommendation

The build is **about 85% there**. The visual chrome (chip palette, type tokens, surfaces, hairlines) is solid and the right structure exists for every spec section. But **four critical gaps** (C1-C4) need to be closed in the next pass:

- **C1** (page width / container conflict) is structural and will be visible the moment the user looks at the page.
- **C2** (missing Overhead row + wrong order in cost stack) breaks the spec's 1:1 contract on labels.
- **C3** (extra Save job button) breaks the two-button stack contract.
- **C4** ("PHASE" appended to every chip) is wrong copy on every phase card after the first.

Plus four major fixes (M1 breakpoint, M3 target-label alignment, M6 qty col width, M12 Save template wiring) and the minor list. None of this is rework — it's mostly small surgical edits in CSS/JS. One more focused pass should get the build to 1:1.
