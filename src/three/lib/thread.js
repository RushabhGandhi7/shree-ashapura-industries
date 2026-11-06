// Real helical threads.
//
// The mesh is a single ribbon wound along the helix: one strip is one pitch wide
// (profile parameter v in [0, 1]) and runs continuously in angle across every turn.
// That means there is no angular seam, crests and roots follow the helix exactly
// (crisp profile with few triangles), and every turn's edge meets the next turn's edge
// on the same helical line.
//
// Phase: a surface point at angle theta and profile position v has
//   y = theta / TAU * P + v * P,  so  v = y / P - theta / TAU.
// Rotating a part by alpha and lifting it by alpha / TAU * P leaves the surface unchanged,
// which is what makes screwing look physically right. External and internal threads use
// the same phase, so they mate.
//
// Ends are handled by clamping y into [y0, y1] together with a radial clamp (tip chamfer,
// runout into the shank, countersink) that makes the clamped vertices collapse onto an
// exact circle. That circle is then shared with the neighbouring cap/shank, so there are
// no cracks.
import { TAU, smoothstep } from './builder.js'

const SLOPE = Math.tan(Math.PI / 3) // flank rise per unit of v for a 60° (ISO) thread

// crest / root flat widths and fillet sizes, as fractions of the pitch.
export const PROFILES = {
  iso: { crest: 0.125, root: 0.2, kr: 0.07, kc: 0.035 }, // machine threads (ISO 68-1-like)
  tapping: { crest: 0.03, root: 0.5, kr: 0.08, kc: 0.02 }, // self-tapping, sharp crest
  wood: { crest: 0.02, root: 0.44, kr: 0.08, kc: 0.015 }, // coarse wood / chipboard thread
}

// Quadratic smooth min/max: C1-continuous rounded corners, analytic and cheap.
const smin = (a, b, k) => {
  const h = Math.max(k - Math.abs(a - b), 0) / k
  return Math.min(a, b) - h * h * k * 0.25
}
const smax = (a, b, k) => -smin(-a, -b, k)

const profileCache = new Map()
export function makeProfile(name = 'iso') {
  if (profileCache.has(name)) return profileCache.get(name)
  const { crest, root, kr, kc } = PROFILES[name]
  const fa = (1 - crest - root) / 2 // axial length of one flank
  const H0 = fa * SLOPE // thread depth in pitch units (≈ 0.6 P for ISO)
  const w1 = root / 2
  const w2 = root / 2 + fa
  /** Depth above the root, in pitch units, for profile position v (periodic). */
  const depth = (v) => {
    const f = v - Math.floor(v)
    const w = f <= 0.5 ? f : 1 - f
    return smin(H0, smax(0, (w - w1) * SLOPE, kr), kc)
  }
  const samples = (detail) => {
    const base =
      detail === 'low'
        ? [0, w1, w2, 0.5]
        : [0, w1 - (0.6 * kr) / SLOPE, w1 + (0.6 * kr) / SLOPE, w2 - (0.6 * kc) / SLOPE, w2 + (0.6 * kc) / SLOPE, 0.5]
    const half = [...new Set(base.filter((x) => x >= 0 && x <= 0.5).map((x) => +x.toFixed(5)))].sort((a, b) => a - b)
    const full = [...half]
    for (let i = half.length - 2; i >= 1; i--) full.push(1 - half[i])
    return full // v in [0, 1); caller appends 1
  }
  const prof = { H0, depth, samples }
  profileCache.set(name, prof)
  return prof
}

/**
 * Build a thread surface into builder `b`.
 * @param {object} o
 *  major       nominal (major) radius
 *  pitch       P
 *  y0, y1      axial extent; external threads: y0 = tip, y1 = runout end
 *  segments    vertices per turn (must equal the neighbouring lathe's segment count)
 *  profile     'iso' | 'tapping' | 'wood'
 *  internal    true for tapped holes / nuts (normals face the axis)
 *  shankR      external: radius the thread runs out into at y1
 *  fadeLen     external: runout length
 *  taper(y)    external: radius scale (pointed screws)
 *  tipR        external: 45° tip chamfer down to this radius at y0
 *  csTop/csBot internal: countersink radius at y1 / y0 (cuts the first thread)
 * @returns {{ minor: number, H0: number }}
 */
export function threadSurface(b, o) {
  const {
    major,
    pitch: P,
    y0,
    y1,
    segments: N,
    profile = 'iso',
    detail = 'high',
    internal = false,
    clearance = 0.008,
    shankR,
    fadeLen = P,
    taper,
    tipR,
    csTop,
    csBot,
    csSlope = 1.73,
  } = o
  const prof = makeProfile(profile)
  const minor = major - prof.H0 * P
  const rD1 = major - 0.541 * P // internal minor (truncated crest), ISO D1 / 2

  const radius = (v, y) => {
    let r = minor + prof.depth(v) * P
    if (!internal) {
      if (shankR != null) r = shankR + (r - shankR) * smoothstep(y1, y1 - fadeLen, y)
      if (taper) r *= taper(y)
      if (tipR != null) r = Math.min(r, tipR + (y - y0))
    } else {
      r = Math.max(r + clearance, rD1)
      if (csTop != null) r = Math.max(r, csTop - (y1 - y) * csSlope)
      if (csBot != null) r = Math.max(r, csBot - (y - y0) * csSlope)
    }
    return r
  }
  const pos = (th, v) => {
    let y = (th / TAU) * P + v * P
    if (y < y0) y = y0
    else if (y > y1) y = y1
    const r = radius(v, y)
    return [r * Math.sin(th), y, r * Math.cos(th)]
  }
  const margin = 0.03 * P
  const frame = (th, v) => {
    // Sample just inside the clamped band so collapsed vertices get the neighbouring
    // surface's normal (tip cone, countersink, runout) instead of a degenerate one.
    const yRaw = (th / TAU) * P + v * P
    let vv = v
    if (yRaw < y0 + margin) vv = (y0 + margin - (th / TAU) * P) / P
    else if (yRaw > y1 - margin) vv = (y1 - margin - (th / TAU) * P) / P
    const e = 1e-3
    const a1 = pos(th + e, vv)
    const a0 = pos(th - e, vv)
    const b1 = pos(th, vv + e / TAU)
    const b0 = pos(th, vv - e / TAU)
    const dt = [a1[0] - a0[0], a1[1] - a0[1], a1[2] - a0[2]]
    const dv = [b1[0] - b0[0], b1[1] - b0[1], b1[2] - b0[2]]
    let n = [dt[1] * dv[2] - dt[2] * dv[1], dt[2] * dv[0] - dt[0] * dv[2], dt[0] * dv[1] - dt[1] * dv[0]]
    const radial = [Math.sin(th), 0, Math.cos(th)]
    const want = internal ? -1 : 1
    if (Math.hypot(n[0], n[1], n[2]) < 1e-14) n = radial.map((x) => x * want)
    else if ((n[0] * radial[0] + n[2] * radial[2]) * want < 0) n = n.map((x) => -x)
    return { n, t: dt }
  }

  const thA = TAU * (Math.floor(y0 / P) - 1)
  const thB = TAU * Math.ceil(y1 / P)
  const steps = Math.round(((thB - thA) / TAU) * N)
  const vs = [...prof.samples(detail), 1]
  const K = vs.length

  const grid = []
  for (let s = 0; s <= steps; s++) {
    const th = thA + (TAU * s) / N
    const row = []
    for (let k = 0; k < K; k++) {
      const v = vs[k]
      const { n, t } = frame(th, v)
      row.push(b.vert(pos(th, v), n, [th / TAU, v], t))
    }
    grid.push(row)
  }
  for (let s = 0; s < steps; s++) {
    for (let k = 0; k < K - 1; k++) b.quad(grid[s][k], grid[s + 1][k], grid[s + 1][k + 1], grid[s][k + 1])
  }
  return { minor, H0: prof.H0 }
}

/** Minor radius for a given major radius / pitch / profile (without building geometry). */
export const minorRadius = (major, pitch, profile = 'iso') => major - makeProfile(profile).H0 * pitch
