// Hex prism for bolt heads and nuts, with the real 30° chamfer: a cone clips the corners,
// which produces the characteristic arcs on each flat. Vertical edges get a soft
// highlight by blending normals toward the corner (reads as a tiny machined radius
// without extra geometry).
import { TAU } from './builder.js'

const COT30 = Math.sqrt(3) // radius gained per unit of height on a 30° chamfer
const SIN30 = 0.5
const COS30 = Math.sqrt(3) / 2

/**
 * @param b builder
 * @param o { s: across flats, y0, y1, chamferTop, chamferBot, rCh: chamfer circle radius, detail }
 * @returns {{ topLoop: number[][], botLoop: number[][] }} exact boundary points for caps
 *
 * Face k has its outward normal at phi = k·60°, so one flat always faces +Z.
 */
export function hexPrism(b, { s, y0, y1, chamferTop = true, chamferBot = false, rCh = 0.475 * s, detail = 'high' }) {
  const rc = s / Math.sqrt(3) // corner radius
  const hw = rc / 2 // half face width
  const hi = detail !== 'low'
  const cols = hi
    ? [-1, -0.985, -0.95, -0.89, -0.81, -0.71, -0.58, -0.43, -0.27, -0.09, 0.09, 0.27, 0.43, 0.58, 0.71, 0.81, 0.89, 0.95, 0.985, 1]
    : [-1, -0.95, -0.7, -0.3, 0, 0.3, 0.7, 0.95, 1]
  const coneRows = hi ? 5 : 2

  // Each flat is split along the exact chamfer curve: per column, the height where the
  // flat meets the cone is solved analytically, and the flat grid and cone grid share
  // those points. So the arcs are crisp (a true machined edge) instead of stepping.
  const topLoop = []
  const botLoop = []
  for (let k = 0; k < 6; k++) {
    const phi = (k * TAU) / 6
    const n = [Math.sin(phi), 0, Math.cos(phi)]
    const t = [Math.cos(phi), 0, -Math.sin(phi)]
    const facePt = (u, y) => [n[0] * (s / 2) + t[0] * u * hw, y, n[2] * (s / 2) + t[2] * u * hw]
    const flatN = (u) => {
      const e = Math.max(0, (Math.abs(u) - 0.92) / 0.08)
      const w = e * e * (3 - 2 * e) * 0.5
      const c = facePt(Math.sign(u), 0)
      const cl = Math.hypot(c[0], c[2])
      return [n[0] * (1 - w) + (c[0] / cl) * w, 0, n[2] * (1 - w) + (c[2] / cl) * w]
    }
    // column data: radius of the face point and where each chamfer cone cuts it
    const C = cols.map((u) => {
      const rho = Math.hypot(s / 2, u * hw)
      const yT = chamferTop ? y1 - (rho - rCh) / COT30 : y1
      const yB = chamferBot ? y0 + (rho - rCh) / COT30 : y0
      return { u, rho, yT, yB }
    })

    // flat region: two rows (planar), from yB to yT per column
    const flat = [C.map((c) => b.vert(facePt(c.u, c.yB), flatN(c.u), [k + (c.u + 1) / 2, c.yB], t)), C.map((c) => b.vert(facePt(c.u, c.yT), flatN(c.u), [k + (c.u + 1) / 2, c.yT], t))]
    for (let i = 0; i < cols.length - 1; i++) b.quad(flat[0][i], flat[0][i + 1], flat[1][i + 1], flat[1][i])

    // cone regions
    const cone = (top) => {
      const grid = []
      for (let r = 0; r <= coneRows; r++) {
        const f = r / coneRows
        grid.push(
          C.map((c) => {
            const yA = top ? c.yT : c.yB
            const yE = top ? y1 : y0
            const y = yA + (yE - yA) * f
            const lim = rCh + (top ? y1 - y : y - y0) * COT30
            const fp = facePt(c.u, y)
            const sc = lim / c.rho
            const p = [fp[0] * sc, y, fp[2] * sc]
            const rx = p[0] / lim
            const rz = p[2] / lim
            if (r === coneRows) (top ? topLoop : botLoop).push(p)
            return b.vert(p, [rx * SIN30, top ? COS30 : -COS30, rz * SIN30], [k + (c.u + 1) / 2, y], t)
          }),
        )
      }
      for (let r = 0; r < coneRows; r++) for (let i = 0; i < cols.length - 1; i++) b.quad(grid[r][i], grid[r][i + 1], grid[r + 1][i + 1], grid[r + 1][i])
      // the last column duplicates the next face's first; drop it from the loop
      ;(top ? topLoop : botLoop).pop()
    }
    if (chamferTop) cone(true)
    else C.slice(0, -1).forEach((c) => topLoop.push(facePt(c.u, y1)))
    if (chamferBot) cone(false)
    else C.slice(0, -1).forEach((c) => botLoop.push(facePt(c.u, y0)))
  }
  return { topLoop, botLoop }
}

/** Hexagon outline (corner radius rc) sampled with `per` points per side, at height y. */
export function hexOutline(acrossFlats, y, per = 4, rot = Math.PI / 6) {
  const rc = acrossFlats / Math.sqrt(3)
  const pts = []
  for (let k = 0; k < 6; k++) {
    const a0 = rot + (k * TAU) / 6
    const a1 = rot + ((k + 1) * TAU) / 6
    const p0 = [rc * Math.sin(a0), rc * Math.cos(a0)]
    const p1 = [rc * Math.sin(a1), rc * Math.cos(a1)]
    for (let i = 0; i < per; i++) {
      const f = i / per
      pts.push([p0[0] + (p1[0] - p0[0]) * f, y, p0[1] + (p1[1] - p0[1]) * f])
    }
  }
  return pts
}
