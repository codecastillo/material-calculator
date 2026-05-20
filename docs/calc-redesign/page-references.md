# Page references — where each token / pattern was observed

This map lets the build agent know which PDF page(s) confirmed each piece of the spec.

## Tokens / patterns and their source pages

| Token / pattern | Primary PDF page | Confirming pages |
|---|---|---|
| Page background, surface, hairline | 4 | 1, 2, 3, 5, 6, 7, 9 |
| Accent orange (`#e9774a`) — CTA, active topnav underline, customer-price display | 4 | 1, 2 (`New calculation` CTA, `Open calculator` link, "Build margin." gradient on 10), 7 (`Email PDF` CTA), 9 (`Generate keys`), 10 (`Sign in`, `Build margin.`) |
| Serif display font for big money | 4 (`$32,679`, `$5,893`, `Hernandez Residence`) | 2 (`$28,450`), 10 (`Bid faster. Order tighter. Build margin.` hero), 7 (proposal numerics tend to mono — confirm) |
| Sans (Inter-like) for UI | 4 | All pages |
| Monospace for SKUs, tabular money, mini-pill values, page indicator | 4 | 5 (SKU column on pricing catalog), 6 (line-item table on order), 9 (`EC-LIF-7D2E91F408A6B3CC` license keys, mono throughout) |
| Small-caps mono eyebrow labels (`02 · CALCULATOR | JOB J-2419`, `01 TODAY · TUE MAY 12`) | 4 | 1 (`01 TODAY`, `02 RECENT JOBS`), 2 (`PRIORITY JOB · J-2419`), 3 (`01 TODAY · TUE MAY 12`, `02 SUPPLY`), 5 (`03 · PRICING`), 6 (`04 · ORDER`), 7 (`04 · BID`), 9 (`07 ADMIN`), 10 (`10 · SIGN IN / ACTIVATE`), 11 (`11 · MOBILE`) |
| Topnav structure (brand + nav + search + ⌘K + page indicator + avatar) | 4 | 1, 2, 3, 5, 6, 7, 9 (every desktop page has it) |
| Active topnav link = 2px orange underline anchored to nav bottom, no background | 4 | 1, 2, 3, 5, 6, 7, 9 |
| `PRO` pill next to wordmark | 4 | 1, 2, 3, 5, 6, 7, 9, 10 |
| `⌘K` keycap inside search | 4 | 1, 2, 3, 5, 6, 7, 9 |
| Page indicator `04 · CALCULATOR` style on far right of topnav | 4 | 1 (`01 · DASHBOARD — LEDGER`), 2 (`02 · DASHBOARD — SPOTLIGHT`), 3 (`03 · DASHBOARD — OPERATIONS`), 5 (`05 · PRICING CATALOG`), 6 (`06 · ORDER SHEET`), 7 (`07 · BID`), 9 (`09 · ADMIN`), 10 (`10 · SIGN IN / ACTIVATE`), 11 (`11 · MOBILE`) |
| Avatar `DC` initials, circular 28px | 4 | All desktop pages |
| Phase chip palette — Lath cream | 4 | 1 (`● LATH` chips next to job rows), 5 (catalog category column), 6 (Lath order section header), 11 (`Lath` pill on mobile selector) |
| Phase chip palette — Gray Coat pink | 4 | 1 (`GRAY COAT` chips), 6, 11 |
| Phase chip palette — Color Coat mint | 4 | 1 (`COLOR COAT` chips), 7, 11 (`Color Coat` pill) |
| Phase chip palette — Accessories peach | 4 (implied / present on dashboards too) | 1 (`ACCESSORIES`) |
| Phase chip palette — Painting moss-green | 1 (`PAINTING` chip on Sherwin Williams card) | — |
| Phase chip palette — Drywall slate-blue | 1 (`DRYWALL` chip on ABC Supply card), 5 | — |
| Phase chip palette — Aggregate taupe | 5 (catalog) | — |
| `● Draft` status badge (neutral pill with status dot) | 4 | 7 (`● DRAFT`, `● STUCCO`), 6 (`● OPEN`), 1 (`● 67%` style progress / `● ACTIVE`), 2 (`● COLOR COAT`, `● ACTIVE`) |
| Green status dot color | 1 (`● $167.2k total contract value`, `● ACTIVE` rows) | 2, 6 |
| Mini-pill inline editable input on phase header | 4 (`3,840 sq·ft`, `186 lin·ft`, `3/8 in`) | 11 (`Wall area 3,840 sq·ft` block on mobile, `Thickness 3/8 in`) |
| Metrics strip (label + tabular value with subscript unit) | 4 | 2 (Cost stack on Spotlight uses same `$7.41 / sq·ft · 31.4% margin` patterns), 3 (Supplier ledger summary `$184.2k YTD`) |
| Cost stack rows (label + sublabel left, amount right) | 4 | 2 (Materials/Labor/Overhead/Markup card on dashboard 02 — identical layout) |
| Display money in accent orange (`$32,679`, `$5,893`) | 4 | 2 (the `$28,450` customer price is rendered in the SAME orange-on-dark treatment) |
| Progress bar with target marker | 4 (0% → target 28% → 50%, current 18%) | 2 (`Progress · 67%` segmented bar on Hernandez card — different style but same metaphor) |
| Primary CTA pill style (accent bg, dark text, arrow) | 4 (`Generate bid →`) | 1 (`New calculation` CTA), 2 (`Open calculator →`), 9 (`Generate keys →`), 10 (`Sign in →`), 7 (`Email PDF`) |
| Secondary button (surface, hairline border) | 4 (`Duplicate`, `Save template`, `Print order sheet`) | 1 (`New job`), 5 (`Import CSV`, `Export`, `New item`), 6 (`Email to supplier`, `Export CSV`), 7 (`Print`, `Copy public link`), 10 (`Activate`) |
| Table column-header treatment (small-caps mono, hairline below) | 4 | 5 (pricing catalog `SKU NAME UNIT · COVERAGE CATEGORY PRICE 30D`), 6 (order line-items `SKU ITEM QTY UNIT EACH`), 9 (`KEY TYPE DUR USES BY`) |
| Mobile bottom tab bar with orange underline on active | 11 | — |
| Mobile phase selector pills (`Lath / Gray Coat / Color Coat / + Add`) | 11 | — |
| Mobile inline measurement card with `edit` link | 11 (`Wall area 3,840 sq·ft`, `Thickness 3/8 in`) | — |

## Reading order if questions arise

1. Always check **page 4** first — it's the canonical source.
2. For shared elements (topnav, badge palette, CTA style), check **page 2** (Spotlight dashboard) — it shares the most surface and component DNA with the calculator.
3. For table styling, **page 6** (order sheet) is the closest analog to the phase tables.
4. For mobile, **page 11** is the only source.
5. For sign-in / brand voice, **page 10**.
