// Engineering quantity model for the calculator. Pure functions only (no DOM),
// so they can be unit-tested in Node and reused by the browser. The math follows
// real product coverage and code-mandated installation overlaps rather than a
// flat coverage number, so orders come out close to what a job actually consumes.
//
// UMD shim: exports for Node tests and attaches to window for classic scripts.
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof root !== 'undefined') root.Engineering = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Fixed net yields and constants. Net yields already account for code laps
  // (paper, wire) or manufacturer bag coverage (color coat).
  const C = {
    PAPER_2PLY_SF_PER_ROLL: 292.85, // 40"x97.5' gross 325sf, minus 2" side / 6" end laps
    WIRE_NETTING_SF_PER_ROLL: 431.56, // 3'x150' gross 450sf, minus 1" side / 2" end laps
    COLOR_COAT_SF_PER_BAG: 140, // 80 lb pre-blend at 1/8"
    PRIMER_SF_PER_GAL: 350,
    PAINT_SMOOTH_SF_PER_GAL: 400,
    PAINT_TEXTURED_SF_PER_GAL: 250,
    MUD_GAL_PER_SF: 0.05, // 3-coat tape + texture
    SCREW_SF_PER_SCREW: 1.3, // 12" o.c. walls + ceilings
    TAPE_LF_PER_SF: 0.37,
    CEMENT_BAG_CF: 1.0, // one 94 lb bag = 1 cf loose dry
    SHRINKAGE: 1.25, // dry-to-wet compaction
    CEMENT_DRY_FRACTION: 0.25, // 1 part cement : 3 parts sand
    SAND_DRY_FRACTION: 0.75,
    CF_PER_CY: 27,
    STONE_CORNER_SF_PER_LF: 0.6, // flat coverage absorbed by each lf of corner stone
    MORTAR_LB_PER_SF: 1.25,
    MORTAR_BAG_LB: 80,
    GRAY_COAT_DEFAULT_THICKNESS_IN: 0.75, // 3/8" scratch + 3/8" brown
  };

  const WASTE = { spray: 1.05, trowel: 1.12 };
  function wasteFactor(method) {
    return WASTE[method] || WASTE.trowel;
  }

  // Classify a product into a calc role from its name (+ unit/calc hints). Returns
  // a role key the formulas understand, or null when the product should fall back
  // to plain coverage math.
  function materialRole(m) {
    const name = String((m && m.name) || '').toLowerCase();
    const has = (...words) => words.some((w) => name.includes(w));

    // Accessories that share keywords with real roles but have no formula here.
    if (has('caulk')) return null;
    if (has('poly', 'visqueen', 'plastic', 'sheeting')) return null; // poly sheeting, not paint
    if (has('duct tape')) return null;

    if (has('mortar')) return 'mortar';
    if (has('corner stone', 'stone corner', 'corner veneer')) return 'stone_corner';
    if (has('stone veneer', 'flat stone', 'stone flat', 'veneer flat')) return 'stone_flat';
    if (has('primer')) return 'primer';
    if (has('paint', 'latex', 'enamel')) return 'paint';
    if (has('screw')) return 'screw';
    if (has('mesh tape', 'joint tape', 'paper tape', 'wallboard tape', 'drywall tape'))
      return 'tape';
    if (has('joint compound', 'all purpose', 'all-purpose', 'taping', 'topping', 'mud', 'tnt'))
      return 'mud';
    if (
      has('drywall', 'sheetrock', 'gypsum', 'type x', 'soffit board', 'tile backer', 'densshield')
    )
      return 'sheet';
    if (has('color coat', 'finish coat', 'marblewall', 'dryvit', 'senerflex', 'versatex'))
      return 'colorcoat';
    if (has('plastic cement', 'portland', 'plaster cement')) return 'cement';
    if (has('plaster sand', 'masonry sand', 'sand')) return 'sand';
    if (has('building paper', 'craft paper', 'kraft', '2-ply', '2 ply', 'weather barrier'))
      return 'paper';
    if (has('wire', 'netting', 'k-lath', 'klath')) return 'wire';
    return null;
  }

  function ceil(n) {
    return Math.ceil(n - 1e-9); // guard against float noise just under an integer
  }
  function round(n, places) {
    const f = Math.pow(10, places || 0);
    return Math.round(n * f) / f;
  }

  // Compute per-role target quantities for one phase. `area` is the net wall area
  // already multiplied by the chosen waste factor. Returns { role: { qty, unit } }.
  // Stone returns adjusted areas (flat sqft, corner lf) that downstream coverage
  // converts into purchasable units; everything else returns final counts.
  function computePhase(phase, area, opts) {
    opts = opts || {};
    const out = {};
    switch (phase) {
      case 'Lath':
        out.paper = { qty: ceil(area / C.PAPER_2PLY_SF_PER_ROLL), unit: 'roll' };
        out.wire = { qty: ceil(area / C.WIRE_NETTING_SF_PER_ROLL), unit: 'roll' };
        break;
      case 'Gray Coat': {
        const thickness = opts.grayThicknessIn || C.GRAY_COAT_DEFAULT_THICKNESS_IN;
        const wetCf = area * (thickness / 12);
        const dryCf = wetCf * C.SHRINKAGE;
        out.cement = { qty: ceil((dryCf * C.CEMENT_DRY_FRACTION) / C.CEMENT_BAG_CF), unit: 'bag' };
        const sandCf = dryCf * C.SAND_DRY_FRACTION;
        out.sand = { qty: round(sandCf / C.CF_PER_CY, 2), unit: 'cubic yard' };
        break;
      }
      case 'Color Coat':
        out.colorcoat = { qty: ceil(area / C.COLOR_COAT_SF_PER_BAG), unit: 'bag' };
        break;
      case 'Drywall': {
        const sheetSqft = opts.sheetSqft === 48 ? 48 : opts.sheetSqft === 32 ? 32 : 48;
        out.sheet = { qty: ceil(area / sheetSqft), unit: 'sheet' };
        out.mud = { qty: round(area * C.MUD_GAL_PER_SF, 1), unit: 'gallon' };
        out.screw = { qty: ceil(area / C.SCREW_SF_PER_SCREW), unit: 'screw' };
        out.tape = { qty: ceil(area * C.TAPE_LF_PER_SF), unit: 'linear ft' };
        break;
      }
      case 'Painting': {
        const coats = opts.coats > 0 ? opts.coats : 1;
        const yield_ =
          opts.surface === 'textured' ? C.PAINT_TEXTURED_SF_PER_GAL : C.PAINT_SMOOTH_SF_PER_GAL;
        out.paint = { qty: ceil((area / yield_) * coats), unit: 'gallon' };
        out.primer = { qty: ceil(area / C.PRIMER_SF_PER_GAL), unit: 'gallon' };
        break;
      }
      case 'Stone': {
        const cornerLf = opts.cornerLinearFt || 0;
        out.stone_corner = { qty: ceil(cornerLf), unit: 'linear ft', area: cornerLf };
        const adjustedFlat = Math.max(0, area - cornerLf * C.STONE_CORNER_SF_PER_LF);
        out.stone_flat = { qty: ceil(adjustedFlat), unit: 'sqft', area: adjustedFlat };
        out.mortar = { qty: ceil((area * C.MORTAR_LB_PER_SF) / C.MORTAR_BAG_LB), unit: 'bag' };
        break;
      }
      default:
        break;
    }
    return out;
  }

  // Read a package size out of a product name (or unit). Returns { value, unit }
  // where unit is one of gal | ft | count | lb, or null when nothing is found.
  // Used to convert a role's net need (gallons, screws, linear ft) into the
  // product's real container (pail, box, roll). A stored package on the material
  // takes precedence over this.
  function parsePackage(name) {
    const s = String(name || '').toLowerCase();
    let m;
    if ((m = s.match(/(\d+(?:\.\d+)?)\s*gal/))) return { value: +m[1], unit: 'gal' };
    if ((m = s.match(/(\d+)\s*pc\s*\/\s*box/))) return { value: +m[1], unit: 'count' };
    if ((m = s.match(/(\d+(?:\.\d+)?)\s*m\b/))) return { value: +m[1] * 1000, unit: 'count' }; // 8M = 8000
    if ((m = s.match(/x\s*(\d+)\s*yd/))) return { value: +m[1] * 3, unit: 'ft' }; // 60yd -> 180 ft
    if ((m = s.match(/(\d+)\s*'/))) return { value: +m[1], unit: 'ft' }; // 500'
    if ((m = s.match(/(\d+(?:\.\d+)?)\s*(?:#|lbs?)/))) return { value: +m[1], unit: 'lb' };
    return null;
  }

  // Convert a role's net need (er, from computePhase) into the number of the
  // product's purchase units. Returns null when the conversion isn't safe, so the
  // caller falls back to the product's own coverage math (no wrong counts).
  function packagesForRole(role, er, m) {
    if (!er) return null;
    const stored = m && m.packageValue > 0 ? { value: m.packageValue, unit: m.packageUnit } : null;
    const pkg = stored || parsePackage(m && m.name);
    const okPkg = (u) => pkg && pkg.unit === u && pkg.value > 0;
    switch (role) {
      case 'paper':
      case 'wire':
      case 'sheet':
      case 'cement':
      case 'mortar':
        return er.qty; // formula already yields the purchase unit (roll/sheet/bag)
      case 'colorcoat':
      case 'stone_flat':
        return null; // use the product's own sqft coverage
      case 'mud':
      case 'paint':
      case 'primer':
        return okPkg('gal') ? ceil(er.qty / pkg.value) : null;
      case 'screw':
        return okPkg('count') ? ceil(er.qty / pkg.value) : null;
      case 'tape': {
        const lf = er.area != null ? er.area : er.qty;
        return okPkg('ft') ? ceil(lf / pkg.value) : null;
      }
      case 'stone_corner': {
        const lf = er.area != null ? er.area : er.qty;
        return okPkg('ft') ? ceil(lf / pkg.value) : ceil(lf);
      }
      case 'sand':
        return /ton/i.test((m && m.unit) || '') ? ceil(er.qty * 1.35) : ceil(er.qty);
      default:
        return null;
    }
  }

  return {
    CONSTANTS: C,
    WASTE,
    wasteFactor,
    materialRole,
    computePhase,
    parsePackage,
    packagesForRole,
  };
});
