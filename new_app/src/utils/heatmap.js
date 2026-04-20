import { elements } from '../data/elements';

const PROPERTIES = ['electronegativity', 'density', 'melting', 'boiling', 'discovered'];

function computeRanges() {
  const ranges = {};
  for (const prop of PROPERTIES) {
    let min = Infinity;
    let max = -Infinity;
    for (const el of elements) {
      const val = el[prop];
      if (val != null) {
        if (val < min) min = val;
        if (val > max) max = val;
      }
    }
    ranges[prop] = { min, max };
  }
  return ranges;
}

export const PROPERTY_RANGES = computeRanges();

/**
 * Interpolates between three color stops based on a normalized value (0-1).
 * low (0) = #3d8ef0 (cool blue)
 * mid (0.5) = #2eb89a (teal)
 * high (1) = #c8a44e (warm amber)
 */
function interpolateColor(t) {
  const stops = [
    { r: 0x3d, g: 0x8e, b: 0xf0 }, // blue
    { r: 0x2e, g: 0xb8, b: 0x9a }, // teal
    { r: 0xc8, g: 0xa4, b: 0x4e }, // amber
  ];

  let idx, frac;
  if (t <= 0.5) {
    idx = 0;
    frac = t / 0.5;
  } else {
    idx = 1;
    frac = (t - 0.5) / 0.5;
  }

  const from = stops[idx];
  const to = stops[idx + 1];
  const r = Math.round(from.r + (to.r - from.r) * frac);
  const g = Math.round(from.g + (to.g - from.g) * frac);
  const b = Math.round(from.b + (to.b - from.b) * frac);

  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Returns a CSS color string for the given element and property.
 * Grey if the value is null/undefined, otherwise a gradient from blue to teal to amber.
 */
export function getHeatmapColor(element, property) {
  if (!property || !element) return '#2a2c3a';

  const val = element[property];
  if (val == null) return '#2a2c3a';

  const range = PROPERTY_RANGES[property];
  if (!range || range.min === range.max) return '#2a2c3a';

  const t = (val - range.min) / (range.max - range.min);
  const clamped = Math.max(0, Math.min(1, t));
  return interpolateColor(clamped);
}
