// Tube sweep: a closed 2D section swept along an open 3D polyline (wire forms such as
// the cotter pin and the hook bracket). Frames are parallel-transported so the section
// does not twist; `normal0` sets the initial section u-axis (section v-axis = T × N).
import { cross, dot, len, sub } from './builder.js'

const norm = (a) => {
  const l = len(a) || 1
  return [a[0] / l, a[1] / l, a[2] / l]
}

/** Chaikin corner cutting: rounds the kinks of a polyline while keeping its end points. */
export function smoothPath(pts, iterations = 2) {
  let p = pts
  for (let k = 0; k < iterations; k++) {
    const out = [p[0]]
    for (let i = 0; i < p.length - 1; i++) {
      const a = p[i]
      const b = p[i + 1]
      if (i > 0) out.push(a.map((v, j) => v * 0.75 + b[j] * 0.25))
      if (i < p.length - 2) out.push(a.map((v, j) => v * 0.25 + b[j] * 0.75))
    }
    out.push(p[p.length - 1])
    p = out
  }
  return p
}

/**
 * @param b       MeshBuilder
 * @param o.path    [[x, y, z]] centreline
 * @param o.section [[u, v]] closed loop (any winding)
 * @param o.normal0 initial u-axis, roughly perpendicular to the first segment
 * @param o.caps    cap both ends (default true)
 */
export function tubeSweep(b, { path, section, normal0 = [1, 0, 0], caps = true }) {
  const n = path.length
  const M = section.length
  const T = path.map((_, i) => norm(sub(path[Math.min(n - 1, i + 1)], path[Math.max(0, i - 1)])))
  const Nv = []
  let N0 = sub(normal0, T[0].map((t) => t * dot(normal0, T[0])))
  Nv.push(norm(N0))
  for (let i = 1; i < n; i++) {
    const prev = Nv[i - 1]
    Nv.push(norm(sub(prev, T[i].map((t) => t * dot(prev, T[i])))))
  }
  const Bv = T.map((t, i) => cross(t, Nv[i]))

  // 2D outward normals of the section
  let cu = 0
  let cv = 0
  section.forEach(([u, v]) => ((cu += u / M), (cv += v / M)))
  const sn = section.map((p, i) => {
    const a = section[(i - 1 + M) % M]
    const c = section[(i + 1) % M]
    let nu = c[1] - a[1]
    let nv = -(c[0] - a[0])
    if ((p[0] - cu) * nu + (p[1] - cv) * nv < 0) ((nu = -nu), (nv = -nv))
    return [nu, nv]
  })

  const at = (i, [u, v]) => [
    path[i][0] + Nv[i][0] * u + Bv[i][0] * v,
    path[i][1] + Nv[i][1] * u + Bv[i][1] * v,
    path[i][2] + Nv[i][2] * u + Bv[i][2] * v,
  ]
  const grid = []
  for (let i = 0; i < n; i++) {
    const row = []
    for (let k = 0; k < M; k++) {
      const [nu, nv] = sn[k]
      const nn = [Nv[i][0] * nu + Bv[i][0] * nv, Nv[i][1] * nu + Bv[i][1] * nv, Nv[i][2] * nu + Bv[i][2] * nv]
      row.push(b.vert(at(i, section[k]), nn, [i / (n - 1), k / M], T[i]))
    }
    grid.push(row)
  }
  for (let i = 0; i < n - 1; i++)
    for (let k = 0; k < M; k++) b.quad(grid[i][k], grid[i + 1][k], grid[i + 1][(k + 1) % M], grid[i][(k + 1) % M])

  if (!caps) return
  for (const [i, s] of [[0, -1], [n - 1, 1]]) {
    const t = T[i].map((x) => x * s)
    const c = b.vert(at(i, [cu, cv]), t)
    const ids = section.map((p) => b.vert(at(i, p), t))
    for (let k = 0; k < M; k++) b.tri(c, ids[k], ids[(k + 1) % M])
  }
}
