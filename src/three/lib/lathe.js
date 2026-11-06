// Surface of revolution with explicit control over sharp vs smooth edges.
//
// A profile is a list of groups. Each group is a polyline in the (r, y) plane that is
// smooth inside (normals blend between neighbours); between groups the edge is sharp
// (vertices are duplicated). Profiles must run counter-clockwise in (r, y) with r to the
// right and y up, so the outward normal is (dy, -dr) — e.g. up the outside, inward
// across a top face, down a bore.
import { TAU } from './builder.js'

/**
 * @param {object[]} groups  [{ pts: [[r, y], ...], builder, closed?, mod?(phi, r, y) => r, normal?(p) => n }]
 *   `normal` overrides the profile normal (used where a lathe must match an analytic cap).
 *   `mod` lets a group deviate from round (spanner flats, split fins); normals are then
 *   found numerically.
 * @param {object} o  { segments, phi0, phiLen, skip?(phi, y) => bool to leave a quad out }
 */
export function lathe(groups, { segments: N, phi0 = 0, phiLen = TAU, skip } = {}) {
  for (const g of groups) {
    const b = g.builder
    const pts = g.pts
    const M = pts.length
    const closed = !!g.closed
    if (M < 2) continue

    const at = (i) => (closed ? pts[(i + M) % M] : pts[Math.min(M - 1, Math.max(0, i))])
    const tang = pts.map((_, i) => {
      const p = at(i - 1)
      const n = at(i + 1)
      return [n[0] - p[0], n[1] - p[1]]
    })
    const vlen = [0]
    for (let i = 1; i < M; i++) vlen.push(vlen[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]))

    const P = (phi, i) => {
      const [r, y] = at(i)
      const R = g.mod ? g.mod(phi, r, y) : r
      return [R * Math.sin(phi), y, R * Math.cos(phi)]
    }

    const grid = []
    for (let j = 0; j <= N; j++) {
      const phi = phi0 + (phiLen * j) / N
      const s = Math.sin(phi)
      const c = Math.cos(phi)
      const row = []
      for (let i = 0; i < M; i++) {
        const p = P(phi, i)
        const [tr, ty] = tang[i]
        let n = [ty * s, -tr, ty * c] // (dy, -dr) rotated to world
        if (g.normal) n = g.normal(p)
        else if (g.mod) {
          const e = 1e-4
          const a1 = P(phi + e, i)
          const a0 = P(phi - e, i)
          const s1 = P(phi, closed ? i + 1 : Math.min(M - 1, i + 1))
          const s0 = P(phi, closed ? i - 1 : Math.max(0, i - 1))
          const dphi = [a1[0] - a0[0], a1[1] - a0[1], a1[2] - a0[2]]
          const ds = [s1[0] - s0[0], s1[1] - s0[1], s1[2] - s0[2]]
          const m = [ds[1] * dphi[2] - ds[2] * dphi[1], ds[2] * dphi[0] - ds[0] * dphi[2], ds[0] * dphi[1] - ds[1] * dphi[0]]
          const ml = Math.hypot(m[0], m[1], m[2])
          if (ml > 1e-12) {
            const sign = m[0] * n[0] + m[1] * n[1] + m[2] * n[2] < 0 ? -1 : 1
            n = [m[0] * sign, m[1] * sign, m[2] * sign]
          }
        }
        row.push(b.vert(p, n, [j / N, vlen[i]], [c, 0, -s]))
      }
      grid.push(row)
    }

    const last = closed ? M : M - 1
    for (let j = 0; j < N; j++) {
      const phiMid = phi0 + (phiLen * (j + 0.5)) / N
      for (let i = 0; i < last; i++) {
        const i1 = (i + 1) % M
        if (skip && skip(phiMid, (pts[i][1] + pts[i1][1]) / 2, g)) continue
        b.quad(grid[j][i], grid[j + 1][i], grid[j + 1][i1], grid[j][i1])
      }
    }
  }
}

/** Rounded rectangle in (r, y), counter-clockwise, as one smooth closed loop. */
export function roundedRectProfile(r0, r1, y0, y1, rad, steps = 3) {
  const pts = []
  const corner = (cr, cy, a0) => {
    for (let k = 0; k <= steps; k++) {
      const a = a0 + (Math.PI / 2) * (k / steps)
      pts.push([cr + rad * Math.cos(a), cy + rad * Math.sin(a)])
    }
  }
  corner(r1 - rad, y0 + rad, -Math.PI / 2) // bottom-outer
  corner(r1 - rad, y1 - rad, 0) // top-outer
  corner(r0 + rad, y1 - rad, Math.PI / 2) // top-inner
  corner(r0 + rad, y0 + rad, Math.PI) // bottom-inner
  return pts
}
