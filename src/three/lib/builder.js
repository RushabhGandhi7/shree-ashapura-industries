// Low-level mesh building helpers shared by every procedural part.
//
// Conventions (whole library):
//   Units: 1 = 10 mm. Y is the part axis.
//   Angles: a point at angle phi and radius r sits at (r·sin phi, y, r·cos phi), so
//   phi = atan2(x, z). This matches the thread phase convention, which keeps bolts,
//   nuts and tapped holes mating.
import * as THREE from 'three'

const TAU = Math.PI * 2

export class MeshBuilder {
  constructor() {
    this.pos = []
    this.nrm = []
    this.uv = []
    this.tan = []
    this.idx = []
    this.n = 0
  }

  /** Add a vertex. Normal is normalised; tangent defaults to any vector perpendicular to it. */
  vert(p, n, uv = [0, 0], t = null) {
    this.pos.push(p[0], p[1], p[2])
    const l = Math.hypot(n[0], n[1], n[2]) || 1
    const nx = n[0] / l
    const ny = n[1] / l
    const nz = n[2] / l
    this.nrm.push(nx, ny, nz)
    this.uv.push(uv[0], uv[1])
    let tx, ty, tz
    if (t) {
      ;[tx, ty, tz] = t
    } else {
      // cross(n, axis least aligned with n)
      if (Math.abs(ny) < 0.9) [tx, ty, tz] = [nz, 0, -nx]
      else [tx, ty, tz] = [0, -nz, ny]
    }
    const tl = Math.hypot(tx, ty, tz) || 1
    this.tan.push(tx / tl, ty / tl, tz / tl, 1)
    return this.n++
  }

  /**
   * Add a triangle. Winding is chosen automatically so the face agrees with its vertex
   * normals, which removes a whole class of inside-out face bugs. Degenerate triangles
   * (e.g. collapsed thread ends) are dropped.
   */
  tri(a, b, c) {
    const P = this.pos
    const N = this.nrm
    const ax = P[3 * a]
    const ay = P[3 * a + 1]
    const az = P[3 * a + 2]
    const e1x = P[3 * b] - ax
    const e1y = P[3 * b + 1] - ay
    const e1z = P[3 * b + 2] - az
    const e2x = P[3 * c] - ax
    const e2y = P[3 * c + 1] - ay
    const e2z = P[3 * c + 2] - az
    const cx = e1y * e2z - e1z * e2y
    const cy = e1z * e2x - e1x * e2z
    const cz = e1x * e2y - e1y * e2x
    if (cx * cx + cy * cy + cz * cz < 1e-18) return
    const sx = N[3 * a] + N[3 * b] + N[3 * c]
    const sy = N[3 * a + 1] + N[3 * b + 1] + N[3 * c + 1]
    const sz = N[3 * a + 2] + N[3 * b + 2] + N[3 * c + 2]
    if (cx * sx + cy * sy + cz * sz < 0) this.idx.push(a, c, b)
    else this.idx.push(a, b, c)
  }

  quad(a, b, c, d) {
    this.tri(a, b, c)
    this.tri(a, c, d)
  }

  get empty() {
    return this.idx.length === 0
  }

  build() {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3))
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.nrm, 3))
    g.setAttribute('uv', new THREE.Float32BufferAttribute(this.uv, 2))
    g.setAttribute('tangent', new THREE.Float32BufferAttribute(this.tan, 4))
    g.setIndex(this.idx)
    g.computeBoundingBox()
    g.computeBoundingSphere()
    return g
  }
}

/** One builder per material role: main finish, dark recess/bore, nylon insert, knurled band. */
export const makeBuilders = () => ({
  main: new MeshBuilder(),
  dark: new MeshBuilder(),
  nylon: new MeshBuilder(),
  knurl: new MeshBuilder(),
  black: new MeshBuilder(), // moulded black plastic (leveller bases)
  smooth: new MeshBuilder(), // part finish without the brushed highlight (domes: it would pinch at the pole)
})

/** Ring of N points at radius r, height y, angles phi0 + TAU·j/N (j < N). */
export function ring(r, y, N, phi0 = 0) {
  const out = []
  for (let j = 0; j < N; j++) {
    const a = phi0 + (TAU * j) / N
    out.push([r * Math.sin(a), y, r * Math.cos(a)])
  }
  return out
}

const angleOf = (p) => {
  const a = Math.atan2(p[0], p[2])
  return a < 0 ? a + TAU : a
}

/**
 * Triangulate the band between two closed loops that are star-shaped around the Y axis
 * (outer ring + inner hexagon/cross/circle, possibly with different point counts).
 * Using the loops' exact points guarantees crack-free joins with neighbouring surfaces.
 * `inner` may be a single centre point (fan). `normalFn(p)` gives the vertex normal.
 */
export function stitch(b, outer, inner, normalFn, uvFn = (p) => [p[0], p[2]]) {
  const prep = (loop) =>
    loop
      .map((p) => ({ p, a: angleOf(p) }))
      .sort((x, y) => x.a - y.a)
  const O = prep(outer)
  const oi = O.map((o) => b.vert(o.p, normalFn(o.p), uvFn(o.p)))
  const no = O.length

  if (inner.length === 1) {
    const c = b.vert(inner[0], normalFn(inner[0]), uvFn(inner[0]))
    for (let k = 0; k < no; k++) b.tri(oi[k], oi[(k + 1) % no], c)
    return
  }

  const I = prep(inner)
  const ii = I.map((o) => b.vert(o.p, normalFn(o.p), uvFn(o.p)))
  const ni = I.length
  const angO = (k) => O[k % no].a + TAU * Math.floor(k / no)
  const angI = (k) => I[k % ni].a + TAU * Math.floor(k / ni)
  let i = 0
  let j = 0
  while (i < no || j < ni) {
    const advanceOuter = j >= ni || (i < no && angO(i + 1) <= angI(j + 1))
    if (advanceOuter) {
      b.tri(oi[i % no], oi[(i + 1) % no], ii[j % ni])
      i++
    } else {
      b.tri(oi[i % no], ii[(j + 1) % ni], ii[j % ni])
      j++
    }
  }
}

export const up = () => [0, 1, 0]
export const down = () => [0, -1, 0]

export const smoothstep = (e0, e1, x) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)))
  return t * t * (3 - 2 * t)
}

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v))

export const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
export const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
export const len = (a) => Math.hypot(a[0], a[1], a[2])

/** Points along a circular arc in the (r, y) plane, from angle a0 to a1 (radians). */
export function arc(cr, cy, rad, a0, a1, steps) {
  const out = []
  for (let i = 0; i <= steps; i++) {
    const a = a0 + ((a1 - a0) * i) / steps
    out.push([cr + rad * Math.cos(a), cy + rad * Math.sin(a)])
  }
  return out
}

export { TAU }
