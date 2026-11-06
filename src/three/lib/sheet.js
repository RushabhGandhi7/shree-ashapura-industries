// Flat plates with holes (bracket legs, the hero's steel plate) and simple sweeps
// (spring washer, sheet-metal bend).
import * as THREE from 'three'
import { TAU } from './builder.js'

/**
 * Extruded plate with optional 45° edge chamfers.
 * 2D points (u, w) map to world via a basis: world = O + U·u + W·w + H·h, h in [0, t].
 * @param o { outline: [[u,w]], holes: [[[u,w]]], t, basis: {O,U,W,H}, chamfer, holeWalls }
 *   With holeWalls = false the holes are left open (a tapped sleeve fills them).
 */
export function plate(b, { outline, holes = [], t, basis, chamfer = 0, holeWalls = true }) {
  const { O, U, W, H } = basis
  const to = (u, w, h) => [O[0] + U[0] * u + W[0] * w + H[0] * h, O[1] + U[1] * u + W[1] * w + H[1] * h, O[2] + U[2] * u + W[2] * w + H[2] * h]
  const dir = (nu, nw, nh) => [U[0] * nu + W[0] * nw + H[0] * nh, U[1] * nu + W[1] * nw + H[1] * nh, U[2] * nu + W[2] * nw + H[2] * nh]

  // 2D outward normals (away from material) for a loop.
  const normals2 = (loop, isHole) => {
    const n = loop.length
    let cu = 0
    let cw = 0
    loop.forEach(([u, w]) => ((cu += u), (cw += w)))
    cu /= n
    cw /= n
    return loop.map((p, i) => {
      const a = loop[(i - 1 + n) % n]
      const c = loop[(i + 1) % n]
      let nu = c[1] - a[1]
      let nw = -(c[0] - a[0])
      const l = Math.hypot(nu, nw) || 1
      nu /= l
      nw /= l
      const away = (p[0] - cu) * nu + (p[1] - cw) * nw
      const flip = isHole ? away > 0 : away < 0
      return flip ? [-nu, -nw] : [nu, nw]
    })
  }
  const inset = (loop, nrm, d) => loop.map(([u, w], i) => [u - nrm[i][0] * d, w - nrm[i][1] * d])

  const on = normals2(outline, false)
  const hn = holes.map((h) => normals2(h, true))
  const c = chamfer
  const capOutline = c ? inset(outline, on, c) : outline

  // Caps
  const contour = capOutline.map(([u, w]) => new THREE.Vector2(u, w))
  const holeV = holes.map((h) => h.map(([u, w]) => new THREE.Vector2(u, w)))
  const faces = THREE.ShapeUtils.triangulateShape(contour, holeV)
  const all = [...capOutline, ...holes.flat()]
  for (const [h, sign] of [[t, 1], [0, -1]]) {
    const n = dir(0, 0, sign)
    const ids = all.map(([u, w]) => b.vert(to(u, w, h), n, [u, w]))
    faces.forEach(([i, j, k]) => b.tri(ids[i], ids[j], ids[k]))
  }

  // Walls (with chamfer bands)
  const band = (loopA, hA, loopB, hB, nrm, nh) => {
    const n = loopA.length
    const ia = loopA.map(([u, w], i) => b.vert(to(u, w, hA), dir(nrm[i][0], nrm[i][1], nh), [i / n, hA]))
    const ib = loopB.map(([u, w], i) => b.vert(to(u, w, hB), dir(nrm[i][0], nrm[i][1], nh), [i / n, hB]))
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n
      b.quad(ia[i], ia[j], ib[j], ib[i])
    }
  }
  const walls = (loop, nrm) => {
    if (c) {
      band(inset(loop, nrm, c), t, loop, t - c, nrm, 1)
      band(loop, t - c, loop, c, nrm, 0)
      band(loop, c, inset(loop, nrm, c), 0, nrm, -1)
    } else band(loop, t, loop, 0, nrm, 0)
  }
  walls(outline, on)
  if (holeWalls) holes.forEach((h, i) => walls(h, hn[i]))
}

/** Rounded rectangle outline in 2D, counter-clockwise. */
export function roundedRect2(u0, w0, u1, w1, r, steps = 6, roundCorners = [1, 1, 1, 1]) {
  const pts = []
  const corners = [
    [u1, w0, -Math.PI / 2],
    [u1, w1, 0],
    [u0, w1, Math.PI / 2],
    [u0, w0, Math.PI],
  ]
  corners.forEach(([cu, cw, a0], k) => {
    if (!roundCorners[k]) {
      pts.push([cu, cw])
      return
    }
    const su = k === 0 || k === 1 ? -1 : 1
    const sw = k === 1 || k === 2 ? -1 : 1
    for (let i = 0; i <= steps; i++) {
      const a = a0 + (Math.PI / 2) * (i / steps)
      pts.push([cu + su * r + r * Math.cos(a), cw + sw * r + r * Math.sin(a)])
    }
  })
  return pts
}

/** Circle in 2D, matching ring() angles when used with the (x, z) plate basis. */
export function circle2(cu, cw, r, N, phi0 = 0) {
  const pts = []
  for (let j = 0; j < N; j++) {
    const a = phi0 + (TAU * j) / N
    pts.push([cu + r * Math.sin(a), cw + r * Math.cos(a)])
  }
  return pts
}

/** Obround slot outline in 2D along u. */
export function slot2(cu, cw, length, width, steps = 10) {
  const r = width / 2
  const h = length / 2 - r
  const pts = []
  for (let i = 0; i <= steps; i++) {
    const a = -Math.PI / 2 + (Math.PI * i) / steps
    pts.push([cu + h + r * Math.cos(a), cw + r * Math.sin(a)])
  }
  for (let i = 0; i <= steps; i++) {
    const a = Math.PI / 2 + (Math.PI * i) / steps
    pts.push([cu - h + r * Math.cos(a), cw + r * Math.sin(a)])
  }
  return pts
}

/**
 * Sweep a closed 2D section (x = radial, y = axial, smooth loop) around the Y axis
 * from angle a0 to a1 while rising by `rise`. Used for the split spring washer.
 * Ends are capped with flat faces.
 */
export function helicalSweep(b, { section, rc, a0, a1, rise, steps }) {
  const M = section.length
  const P = (a, i) => {
    const [sx, sy] = section[(i + M) % M]
    const r = rc + sx
    const y = sy + (rise * (a - a0)) / (a1 - a0)
    return [r * Math.sin(a), y, r * Math.cos(a)]
  }
  const grid = []
  for (let k = 0; k <= steps; k++) {
    const a = a0 + ((a1 - a0) * k) / steps
    const row = []
    for (let i = 0; i < M; i++) {
      const e = 1e-4
      const p = P(a, i)
      const da = sub3(P(a + e, i), P(a - e, i))
      const ds = sub3(P(a, i + 1), P(a, i - 1))
      let n = cross3(ds, da)
      // orient away from the section centre
      const cx = rc * Math.sin(a)
      const cz = rc * Math.cos(a)
      const cy = (rise * (a - a0)) / (a1 - a0)
      const away = [p[0] - cx, p[1] - cy, p[2] - cz]
      if (n[0] * away[0] + n[1] * away[1] + n[2] * away[2] < 0) n = n.map((x) => -x)
      row.push(b.vert(p, n, [k / steps, i / M], da))
    }
    grid.push(row)
  }
  for (let k = 0; k < steps; k++)
    for (let i = 0; i < M; i++) b.quad(grid[k][i], grid[k + 1][i], grid[k + 1][(i + 1) % M], grid[k][(i + 1) % M])

  // end caps
  for (const [a, sign] of [[a0, -1], [a1, 1]]) {
    const t = [Math.cos(a) * sign, 0, -Math.sin(a) * sign]
    const pts = section.map((_, i) => P(a, i))
    const cen = pts.reduce((s, p) => [s[0] + p[0] / M, s[1] + p[1] / M, s[2] + p[2] / M], [0, 0, 0])
    const ci = b.vert(cen, t)
    const ids = pts.map((p) => b.vert(p, t))
    for (let i = 0; i < M; i++) b.tri(ci, ids[i], ids[(i + 1) % M])
  }
}

/** Rounded-rectangle section (centred), for sweeps. */
export function roundedSection(w, h, r, steps = 3) {
  const pts = []
  const cs = [
    [w / 2 - r, -h / 2 + r, -Math.PI / 2],
    [w / 2 - r, h / 2 - r, 0],
    [-w / 2 + r, h / 2 - r, Math.PI / 2],
    [-w / 2 + r, -h / 2 + r, Math.PI],
  ]
  for (const [cx, cy, a0] of cs)
    for (let i = 0; i <= steps; i++) {
      const a = a0 + (Math.PI / 2) * (i / steps)
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)])
    }
  return pts
}

const sub3 = (a, c) => [a[0] - c[0], a[1] - c[1], a[2] - c[2]]
const cross3 = (a, c) => [a[1] * c[2] - a[2] * c[1], a[2] * c[0] - a[0] * c[2], a[0] * c[1] - a[1] * c[0]]
