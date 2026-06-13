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
    PAINT_SMOOTH_SF_PER_GAL: 400, // smooth drywall
    PAINT_TEXTURED_SF_PER_GAL: 250, // textured / stucco
    ELASTOMERIC_SF_PER_GAL: 100, // high-build elastomeric (assumption, tunable; product coverage overrides)
    MUD_GAL_PER_SF: 0.05, // 3-coat tape + texture
    SCREW_SF_PER_SCREW: 1.3, // blended walls + ceilings (fallback when area isn't split)
    SCREW_SF_WALL: 1.5, // 16" o.c. field
    SCREW_SF_CEILING: 1.0, // 12" o.c. field
    STAPLE_SF_PER_STAPLE: 0.5, // lath/netting fastening ~6-7" o.c. (assumption, tunable)
    TAPE_LF_PER_SF: 0.37,
    CEMENT_BAG_CF: 1.0, // one 94 lb bag = 1 cf loose dry
    SHRINKAGE: 1.25, // dry-to-wet compaction
    CEMENT_DRY_FRACTION: 0.25, // 1 part cement : 3 parts sand
    SAND_DRY_FRACTION: 0.75,
    LIME_PER_CEMENT: 0.5, // Type S adds hydrated lime up to ~1/2 the cement volume
    CF_PER_CY: 27,
    STONE_CORNER_SF_PER_LF: 0.6, // flat coverage absorbed by each lf of corner stone
    MORTAR_LB_PER_SF: 1.25,
    MORTAR_BAG_LB: 80,
    GRAY_COAT_DEFAULT_THICKNESS_IN: 0.75, // 3/8" scratch + 3/8" brown
  };

  // Application method waste (how a coating goes on the wall). Drives the stucco
  // coating phases; other phases use PHASE_WASTE defaults.
  const WASTE = { spray: 1.05, trowel: 1.12 };
  function wasteFactor(method) {
    return WASTE[method] || WASTE.trowel;
  }

  // Built-in per-phase waste. Gray/Color coat defer to the application method.
  const PHASE_WASTE = {
    Lath: 0.1,
    Drywall: 0.1,
    Painting: 0.05,
    Stone: 0.1,
    Accessories: 0.1,
  };
  function phaseWasteFactor(phase, method) {
    if (phase === 'Gray Coat' || phase === 'Color Coat') return wasteFactor(method);
    // Paint loss tracks application: spray overspray wastes more than brush/roll.
    if (phase === 'Painting') return method === 'spray' ? 1.15 : 1.05;
    return 1 + (PHASE_WASTE[phase] != null ? PHASE_WASTE[phase] : 0.1);
  }

  // Roles each phase actually consumes. A material is auto-quantified only when
  // its role is on its phase's list; everything else (floats, masks, duct tape,
  // misc) is treated as an optional extra the user can still add by hand.
  const PHASE_ROLES = {
    Lath: ['paper', 'wire', 'lath', 'staple', 'nail', 'trim', 'basecoat'],
    'Gray Coat': ['basecoat', 'cement', 'sand', 'lime', 'fiber'],
    'Color Coat': ['colorcoat', 'pigment'],
    Drywall: ['sheet', 'mud', 'tape', 'screw', 'cornerbead', 'sanding'],
    Painting: ['paint', 'primer'],
    Stone: ['stone_flat', 'stone_corner', 'mortar'],
  };
  function roleAllowedForPhase(role, phase) {
    const set = PHASE_ROLES[phase];
    return !!role && !!set && set.indexOf(role) !== -1;
  }

  function isElastomeric(name) {
    return /elastomeric|elasto/i.test(String(name || ''));
  }
  function paintYield(opts) {
    opts = opts || {};
    if (opts.elastomeric) return C.ELASTOMERIC_SF_PER_GAL;
    return opts.surface === 'textured' ? C.PAINT_TEXTURED_SF_PER_GAL : C.PAINT_SMOOTH_SF_PER_GAL;
  }

  // Coverage de-rate by surface texture, relative to a smooth (manufacturer-rated)
  // baseline. From manufacturer spec sheets + painting-industry data: rough stucco
  // soaks up far more coating than smooth drywall. A product's per-coat coverage is
  // multiplied by this. Elastomerics are exempt (applied at a fixed high build).
  const TEXTURE_DERATE = { smooth: 1.0, light: 0.63, medium: 0.5, heavy: 0.38 };
  function textureDerate(level) {
    return TEXTURE_DERATE[level] != null ? TEXTURE_DERATE[level] : 1.0;
  }

  // Classify a product into a calc role from its name (+ drywall-sheet hint).
  // Returns a role key the formulas/allowlist understand, or null for items with
  // no standard role (which fall back to coverage or are dropped as extras).
  function materialRole(m) {
    const name = String((m && m.name) || '').toLowerCase();
    const has = (...words) => words.some((w) => name.includes(w));

    // Painting-phase items are coatings: paint unless a standalone primer/sealer,
    // and never the masking sundries filed alongside them. Brand and line names
    // (Behr Premium Plus, Glidden, Evershield) rarely contain the word "paint",
    // so classify by phase here instead of by keyword.
    if (m && m.category === 'Painting') {
      if (
        has(
          'tape',
          'plastic',
          'poly',
          'visqueen',
          'sheeting',
          'film',
          'drop cloth',
          'rosin',
          'masking',
          'paper',
          'canvas',
          'mask'
        )
      )
        return null;
      // Paint-and-primer in one is paint; a standalone primer/sealer/filler is primer.
      if (!has('paint') && has('primer', 'sealer', 'undercoat', 'block filler', 'pva'))
        return 'primer';
      return 'paint';
    }

    // Tools / consumables / sheeting that share keywords with real roles.
    if (has('caulk')) return null;
    if (has('poly', 'visqueen', 'plastic', 'sheeting')) return null;
    if (has('duct tape')) return null;
    if (has('float', 'hawk', 'darby', 'margin trowel')) return null;
    if (has('mask', 'respirator', 'n95')) return null;
    if (has('roofing nail')) return null;
    if (has('eps', 'foam sheet', 'foam board', 't&g foam')) return null; // job-specific insulation

    if (has('mortar')) return 'mortar';
    if (has('corner stone', 'stone corner', 'corner veneer')) return 'stone_corner';
    if (has('stone veneer', 'flat stone', 'stone flat', 'veneer flat')) return 'stone_flat';
    if (has('color vial', 'pigment', 'colorant')) return 'pigment';
    if (has('primer')) return 'primer';
    if (has('elastomeric', 'elasto', 'paint', 'enamel', 'coating')) return 'paint';
    if (has('latex') && !has('caulk')) return 'paint';
    if (has('screw')) return 'screw';
    if (has('staple', 'tacker')) return 'staple';
    if (has('furring nail')) return 'nail';
    if (has('shadow bead', 'z bead', 'cornerbead', 'corner bead', 'tape-on')) return 'cornerbead';
    if (has('sanding', 'sandpaper', 'sanding disc', 'sanding pad', 'sanding sponge'))
      return 'sanding';
    if (has('mesh tape', 'joint tape', 'paper tape', 'wallboard tape', 'drywall tape'))
      return 'tape';
    if (
      has(
        'joint compound',
        'all purpose',
        'all-purpose',
        'taping',
        'topping',
        'mud',
        'tnt',
        'fast set',
        'red dot',
        'hamilton'
      )
    )
      return 'mud';
    if (m && m.isDrywallSheet) return 'sheet';
    if (
      has('drywall', 'sheetrock', 'gypsum', 'type x', 'soffit board', 'tile backer', 'densshield')
    )
      return 'sheet';
    if (
      has(
        'fine sand',
        'medium sand',
        'perfect swirl',
        'swirl',
        'marblewall',
        'versatex',
        'senerflex',
        'color coat',
        'finish coat',
        'freestyle',
        'mojave',
        'sandblast',
        'stuccoat',
        'lace'
      )
    )
      return 'colorcoat';
    // K-Lath is a wire-lath brand; match it before base coat so a name like
    // "K-Lath 1-Kote" is read as wire, not misread as a coating by "1-kote".
    if (has('k-lath', 'klath')) return 'wire';
    if (has('fiber mesh', 'fibermesh', 'fiberglass mesh')) return 'fiber';
    if (
      has(
        'diamondwall',
        'dry bond',
        '1-kote',
        'one kote',
        '1 kote',
        'base coat',
        'basecoat',
        'genesis',
        'hangtite',
        'scratch coat'
      )
    )
      return 'basecoat';
    if (has('plastic cement', 'portland', 'plaster cement')) return 'cement';
    if (has('lime')) return 'lime';
    if (has('plaster sand', 'masonry sand', 'sand')) return 'sand';
    if (has('diamond mesh', 'metal lath', 'expanded metal', '3.4 lath', 'flat lath')) return 'lath';
    if (
      has(
        'casing',
        'j metal',
        'j-mold',
        'j mold',
        'weep',
        'corner aid',
        'corneraid',
        'cornerite',
        'bullnose',
        'stock aid',
        'short flange',
        'short-flange',
        '#66'
      )
    )
      return 'trim';
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
  // Stone returns adjusted areas; screws/paint that depend on per-area or
  // per-product detail are computed in the caller, this is the generic path.
  function computePhase(phase, area, opts) {
    opts = opts || {};
    const out = {};
    switch (phase) {
      case 'Lath':
        out.paper = { qty: ceil(area / C.PAPER_2PLY_SF_PER_ROLL), unit: 'roll' };
        out.wire = { qty: ceil(area / C.WIRE_NETTING_SF_PER_ROLL), unit: 'roll' };
        out.staple = { qty: ceil(area / C.STAPLE_SF_PER_STAPLE), unit: 'staple' };
        break;
      case 'Gray Coat': {
        const thickness = opts.grayThicknessIn || C.GRAY_COAT_DEFAULT_THICKNESS_IN;
        const wetCf = area * (thickness / 12);
        const dryCf = wetCf * C.SHRINKAGE;
        const cementCf = dryCf * C.CEMENT_DRY_FRACTION;
        out.cement = { qty: ceil(cementCf / C.CEMENT_BAG_CF), unit: 'bag' };
        out.lime = { qty: ceil((cementCf * C.LIME_PER_CEMENT) / C.CEMENT_BAG_CF), unit: 'bag' };
        out.sand = {
          qty: round((dryCf * C.SAND_DRY_FRACTION) / C.CF_PER_CY, 2),
          unit: 'cubic yard',
        };
        break;
      }
      case 'Color Coat':
        out.colorcoat = { qty: ceil(area / C.COLOR_COAT_SF_PER_BAG), unit: 'bag' };
        break;
      case 'Drywall': {
        const sheetSqft = opts.sheetSqft === 32 ? 32 : 48;
        out.sheet = { qty: ceil(area / sheetSqft), unit: 'sheet' };
        out.mud = { qty: round(area * C.MUD_GAL_PER_SF, 1), unit: 'gallon' };
        out.screw = { qty: ceil(area / C.SCREW_SF_PER_SCREW), unit: 'screw' };
        out.tape = { qty: ceil(area * C.TAPE_LF_PER_SF), unit: 'linear ft' };
        break;
      }
      case 'Painting': {
        const coats = opts.coats > 0 ? opts.coats : 1;
        const yld = paintYield({ elastomeric: opts.elastomeric, surface: opts.surface });
        out.paint = { qty: ceil((area / yld) * coats), unit: 'gallon' };
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

  // Read a package size out of a product name. Returns { value, unit } where unit
  // is gal | ft | count | lb, or null. A box of rolls ("24 rolls/box") with a
  // per-roll length is multiplied out so a box isn't mistaken for one roll.
  function parsePackage(name) {
    const s = String(name || '').toLowerCase();
    let m;
    if ((m = s.match(/(\d+(?:\.\d+)?)\s*gal/))) return { value: +m[1], unit: 'gal' };
    const rollsBox = s.match(/(\d+)\s*rolls?\s*\/\s*box/);
    const lenForBox = s.match(/(\d+)\s*'/);
    if (rollsBox && lenForBox) return { value: +rollsBox[1] * +lenForBox[1], unit: 'ft' };
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
      case 'lime':
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
      case 'staple':
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
        return null; // lath / trim / basecoat / fiber / cornerbead / sanding / nail / pigment -> coverage
    }
  }

  return {
    CONSTANTS: C,
    WASTE,
    PHASE_WASTE,
    PHASE_ROLES,
    wasteFactor,
    phaseWasteFactor,
    roleAllowedForPhase,
    isElastomeric,
    paintYield,
    textureDerate,
    materialRole,
    computePhase,
    parsePackage,
    packagesForRole,
  };
});
