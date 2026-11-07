// Dimension tables (mm) approximating ISO / DIN proportions. They drive the procedural
// models; swap or extend freely. Values in between table entries are interpolated.

// d: [coarse pitch, fine pitch, hex AF (s), hex head k, nut m, socket key s, socket CSK key]
const METRIC = {
  3: [0.5, 0.35, 5.5, 2, 2.4, 2.5, 2],
  4: [0.7, 0.5, 7, 2.8, 3.2, 3, 2.5],
  5: [0.8, 0.5, 8, 3.5, 4.7, 4, 3],
  6: [1, 0.75, 10, 4, 5.2, 5, 4],
  8: [1.25, 1, 13, 5.3, 6.8, 6, 5],
  10: [1.5, 1.25, 16, 6.4, 8.4, 8, 6],
  12: [1.75, 1.5, 18, 7.5, 10.8, 10, 8],
  14: [2, 1.5, 21, 8.8, 12.8, 12, 10],
  16: [2, 1.5, 24, 10, 14.8, 14, 10],
  20: [2.5, 1.5, 30, 12.5, 18, 17, 12],
}

const keys = Object.keys(METRIC).map(Number)
function row(d) {
  if (METRIC[d]) return METRIC[d]
  const hi = keys.find((k) => k >= d) ?? keys[keys.length - 1]
  const lo = [...keys].reverse().find((k) => k <= d) ?? keys[0]
  if (hi === lo) return METRIC[hi].map((v) => (v * d) / hi)
  const f = (d - lo) / (hi - lo)
  return METRIC[lo].map((v, i) => v + (METRIC[hi][i] - v) * f)
}

export const metricSizes = keys

export const pitchFor = (d, fine = false) => row(d)[fine ? 1 : 0]

export function boltDims(d) {
  const [Pc, , s, k, m, sk, skc] = row(d)
  return {
    P: Pc,
    hex: { s, k, dw: s * 0.92, wf: Math.max(0.2, d * 0.04) }, // ISO 4017 / 4014
    socket: { dk: d * 1.5, k: d, key: sk, t: d * 0.55 }, // ISO 4762
    pan: { dk: d * 2, k: d * 0.7 }, // ISO 7045
    csk: { dk: d * 2, key: skc, t: d * 0.4 }, // ISO 10642
    nut: { s, m },
    // fully threaded up to ~2d+10, otherwise thread length b = 2d + 6 (ISO 4014)
    threadLength: (L) => (L <= 2 * d + 10 ? L : 2 * d + 6),
  }
}

export const nutDims = (d) => {
  const [P, , s, , m] = row(d)
  return {
    P,
    hex: { s, m },
    nyloc: { s, h: m * 1.45, hexH: m * 0.86 },
    flange: { s, h: d * 1.05, dc: d * 2.2 },
    wing: { boss0: d * 1.0, boss1: d * 0.8, h: d * 1.1, span: d * 2.2, wingH: d * 2.1, t: d * 0.28 },
  }
}

export const washerDims = (d) => ({
  flat: { d1: d + 0.4, d2: d * 2, h: Math.max(0.5, d * 0.18) }, // ISO 7089
  spring: { d1: d + 0.2, s: d * 0.21, b: d * 0.29 }, // DIN 127 B
})

// Self-tapping screws (ISO 1478 ST sizes): d -> pitch
const ST = { 2.9: 1.1, 3.5: 1.3, 3.9: 1.3, 4.2: 1.4, 4.8: 1.6, 5.5: 1.8, 6.3: 1.8 }
export const tappingPitch = (d) => {
  const k = Object.keys(ST)
    .map(Number)
    .reduce((a, c) => (Math.abs(c - d) < Math.abs(a - d) ? c : a))
  return ST[k] * (d / k)
}

/** Default props per part type (mm). */
export const DEFAULTS = {
  bolt: { head: 'hex', diameter: 12, length: 30, finish: 'zinc' },
  nut: { head: 'hex', diameter: 12, finish: 'zinc' },
  washer: { head: 'flat', diameter: 12, finish: 'zinc' },
  screw: { head: 'pan', diameter: 4.2, length: 25, finish: 'zinc' },
  bracket: { head: 'angle', diameter: 20, length: 40, finish: 'yellowZinc' }, // diameter = width, length = long leg
  turned: { head: 'stepped', diameter: 16, length: 40, finish: 'brass' }, // diameter = largest Ø
  clip: { head: 'tree', diameter: 6, length: 18, finish: 'nylon' }, // diameter = stem Ø
  connector: { head: 'cam', diameter: 5, length: 34, finish: 'zinc' }, // diameter = bolt shank Ø
  cam: { head: 'cam', diameter: 5, finish: 'zinc' }, // cam lock alone (size scales with diameter)
  rivet: { head: 'round', diameter: 5, length: 14, finish: 'zinc' },
  maleFemale: { head: 'button', diameter: 6, length: 24, finish: 'zinc' }, // length = barrel
  stud: { head: 'collar', diameter: 10, length: 60, finish: 'zinc' }, // length = overall
  cotterPin: { head: 'split', diameter: 3, length: 28, finish: 'zinc' }, // diameter = wire Ø
  leveller: { head: 'hex', diameter: 8, length: 28, finish: 'zinc' }, // diameter = stud Ø
  insert: { head: 'threaded', diameter: 6, length: 13, finish: 'zinc' }, // diameter = inner thread / pin Ø
  castor: { head: 'plate', diameter: 50, finish: 'zinc' }, // diameter = wheel Ø
}
