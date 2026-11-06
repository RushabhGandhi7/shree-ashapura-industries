// Parametric part builders. Every builder returns geometry per material role:
//   main  — the part's finish
//   dark  — recesses, bores, internal threads (darker variant: cheap occlusion)
//   nylon — nylon insert (nyloc)
//   knurl — knurled band (finish + procedural normal map)
// Results are memoised by their parameters, so identical parts share geometry.
import * as THREE from 'three'
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { makeBuilders, ring, stitch, up, down, arc, TAU } from './lib/builder.js'
import { lathe, roundedRectProfile } from './lib/lathe.js'
import { threadSurface, minorRadius } from './lib/thread.js'
import { hexPrism } from './lib/hex.js'
import { hexSocket, crossRecess } from './lib/recess.js'
import { plate, roundedRect2, circle2, slot2, helicalSweep, roundedSection } from './lib/sheet.js'
import { boltDims, nutDims, washerDims, pitchFor, tappingPitch, DEFAULTS } from './specs.js'

export const mm = (v) => v / 10
export const SEGMENTS = { high: 48, low: 24 }
const ROLES = ['main', 'dark', 'nylon', 'knurl']

/* ───────────────────────── shared pieces ───────────────────────── */

/**
 * External thread + plain shank + under-head fillet. Returns the shank's lathe points
 * (ending on the bearing face at y = 0) so the head can continue the same profile.
 */
function threadedShank(B, { R, L, P, threadLen, N, detail, profile = 'iso', pointed = false, fillet = 0, shankR }) {
  const yTip = -L
  const yRun = threadLen >= L - 1e-6 ? -Math.min(L * 0.5, 1.2 * P) : -(L - threadLen)
  const rS = shankR ?? R * 0.995
  const minor = minorRadius(R, P, profile)
  const tipLen = Math.min(L * 0.45, R * 3.2)
  threadSurface(B.main, {
    major: R,
    pitch: P,
    y0: yTip,
    y1: yRun,
    segments: N,
    profile,
    detail,
    shankR: rS,
    fadeLen: P * 0.9,
    ...(pointed
      ? { taper: (y) => Math.min(1, Math.max(0, (y - yTip) / tipLen)) ** 0.9 }
      : { tipR: minor * 0.9 }),
  })
  if (!pointed) stitch(B.main, ring(minor * 0.9, yTip, N), [[0, yTip, 0]], down)

  const pts = [[rS, yRun]]
  if (fillet > 0) {
    pts.push([rS, -fillet])
    pts.push(...arc(rS + fillet, -fillet, fillet, Math.PI, Math.PI / 2, 4).slice(1))
  } else pts.push([rS, 0])
  return pts
}

// Pan / dome head surface: super-ellipse, flat top with a rounded edge.
function domeHead(Rh, ys, k, n = 2.6) {
  const surfaceY = (r) => ys + (k - ys) * Math.max(0, 1 - (Math.min(r, Rh) / Rh) ** n) ** (1 / n)
  const surfaceN = (p) => {
    const r = Math.hypot(p[0], p[2])
    if (r < 1e-6) return [0, 1, 0]
    const y = surfaceY(r)
    const dr = (n * r ** (n - 1)) / Rh ** n
    const dy = (n * Math.max(1e-9, y - ys) ** (n - 1)) / (k - ys) ** n
    return [(dr * p[0]) / r, dy, (dr * p[2]) / r]
  }
  const pointsTo = (rA, steps) => {
    const tA = Math.acos((rA / Rh) ** (n / 2))
    const out = []
    for (let i = 0; i <= steps; i++) {
      const t = (tA * i) / steps
      out.push([Rh * Math.cos(t) ** (2 / n), ys + (k - ys) * Math.sin(t) ** (2 / n)])
    }
    return out
  }
  return { surfaceY, surfaceN, pointsTo }
}

/** Heads sit on y = 0 (bearing face) and rise upward. `drive`: 'hex' | 'cross'. */
function head(B, kind, { d, D, R, N, detail, shankPts, drive }) {
  const hi = detail !== 'low'
  const dims = boltDims(d)
  const main = B.main
  switch (kind) {
    case 'hex': {
      const { s, k, dw, wf } = dims.hex
      const S = mm(s)
      const K = mm(k)
      const DW = mm(dw)
      const WF = mm(wf)
      lathe(
        [
          { pts: [...shankPts, [DW / 2, 0]], builder: main },
          { pts: [[DW / 2, 0], [DW / 2, WF]], builder: main },
        ],
        { segments: N },
      )
      const hp = hexPrism(main, { s: S, y0: WF, y1: K, chamferTop: true, detail })
      stitch(main, hp.botLoop, ring(DW / 2, WF, N), down)
      stitch(main, hp.topLoop, [[0, K, 0]], up)
      return K
    }
    case 'socket': {
      const { dk, k, key, t } = dims.socket
      const DK = mm(dk) / 2
      const K = mm(k)
      const c = DK * 0.05
      const rr = DK * 0.14
      lathe(
        [
          { pts: [...shankPts, [DK - c, 0]], builder: main },
          { pts: [[DK - c, 0], [DK, c]], builder: main },
          { pts: [[DK, c], [DK, K - rr]], builder: B.knurl },
          { pts: [[DK, K - rr], ...arc(DK - rr, K - rr, rr, 0, Math.PI / 2, hi ? 5 : 3).slice(1)], builder: main },
        ],
        { segments: N },
      )
      hexSocket(B, { rOuter: DK - rr, y: K, N, s: mm(key), depth: mm(t), detail })
      return K
    }
    case 'pan': {
      const { dk, k } = dims.pan
      const Rh = mm(dk) / 2
      const K = mm(k)
      const dome = domeHead(Rh, K * 0.3, K)
      const rA = Rh * 0.72
      lathe(
        [
          { pts: [...shankPts, [Rh, 0]], builder: main },
          { pts: [[Rh, 0], [Rh, K * 0.3]], builder: main },
          { pts: dome.pointsTo(rA, hi ? 12 : 6), builder: main, normal: dome.surfaceN },
        ],
        { segments: N },
      )
      const arm = Rh * 0.54
      crossRecess(B, { rOuter: rA, N, surfaceY: dome.surfaceY, surfaceN: dome.surfaceN, armX: arm, armZ: arm, w: Rh * 0.11, depth: K * 0.55, rings: hi ? 3 : 1, detail })
      return K
    }
    case 'countersunk': {
      const Rk = mm(dims.csk.dk) / 2
      const rS = shankPts[0][0]
      const hc = Rk - rS // 90° head
      const band = D * 0.04
      const ch = D * 0.025
      const K = hc + band + ch
      lathe(
        [
          { pts: shankPts, builder: main },
          { pts: [[rS, 0], [Rk, hc]], builder: main },
          { pts: [[Rk, hc], [Rk, hc + band]], builder: main },
          { pts: [[Rk, hc + band], [Rk - ch, K]], builder: main },
        ],
        { segments: N },
      )
      if (drive === 'cross') {
        const arm = Rk * 0.5
        crossRecess(B, { rOuter: Rk - ch, N, surfaceY: () => K, surfaceN: up, armX: arm, armZ: arm, w: Rk * 0.1, depth: K * 0.75, rings: 1, detail })
      } else hexSocket(B, { rOuter: Rk - ch, y: K, N, s: mm(dims.csk.key), depth: mm(dims.csk.t), detail })
      return K
    }
    default:
      throw new Error(`Unknown head: ${kind}`)
  }
}

/* ───────────────────────── parts ───────────────────────── */

function bolt(B, p) {
  const d = p.diameter
  const D = mm(d)
  const R = D / 2
  const N = SEGMENTS[p.detail]
  const L = mm(p.length)
  const P = mm(p.pitch ?? pitchFor(d))
  const dims = boltDims(d)
  const csk = p.head === 'countersunk'
  const shankPts = threadedShank(B, {
    R,
    L,
    P,
    threadLen: mm(dims.threadLength(p.length)),
    N,
    detail: p.detail,
    fillet: csk ? 0 : D * 0.06,
  })
  head(B, p.head, { d, D, R, N, detail: p.detail, shankPts, drive: 'hex' })
}

function screw(B, p) {
  const d = p.diameter
  const D = mm(d)
  const R = D / 2
  const N = SEGMENTS[p.detail]
  const L = mm(p.length)
  const P = mm(p.pitch ?? tappingPitch(d))
  const minor = minorRadius(R, P, 'tapping')
  const shankPts = threadedShank(B, {
    R,
    L,
    P,
    threadLen: L,
    N,
    detail: p.detail,
    profile: 'tapping',
    pointed: true,
    fillet: p.head === 'countersunk' ? 0 : D * 0.05,
    shankR: minor + (R - minor) * 0.35,
  })
  head(B, p.head, { d, D, R, N, detail: p.detail, shankPts, drive: 'cross' })
}

function nut(B, p) {
  const d = p.diameter
  const D = mm(d)
  const R = D / 2
  const N = SEGMENTS[p.detail]
  const P = mm(p.pitch ?? pitchFor(d))
  const nd = nutDims(d)
  const cs = R * 1.1 // countersink radius at the faces
  const main = B.main
  const inner = (y0, y1, o = {}) =>
    threadSurface(B.dark, { major: R, pitch: P, y0, y1, segments: N, detail: p.detail, internal: true, csTop: cs, csBot: cs, ...o })

  switch (p.head) {
    case 'hex': {
      const S = mm(nd.hex.s)
      const M = mm(nd.hex.m)
      const hp = hexPrism(main, { s: S, y0: 0, y1: M, chamferTop: true, chamferBot: true, detail: p.detail })
      inner(0, M)
      stitch(main, hp.topLoop, ring(cs, M, N), up)
      stitch(main, hp.botLoop, ring(cs, 0, N), down)
      break
    }
    case 'nyloc': {
      const S = mm(nd.nyloc.s)
      const H = mm(nd.nyloc.h)
      const HX = mm(nd.nyloc.hexH)
      const rCol = S * 0.45
      const rLip = R * 1.08
      const rr = Math.min((H - HX) * 0.4, (rCol - rLip) * 0.8)
      const lipT = D * 0.05
      const rNyl = R - 0.62 * P
      const csT = R + 0.02
      const hp = hexPrism(main, { s: S, y0: 0, y1: HX, chamferTop: false, chamferBot: true, detail: p.detail })
      stitch(main, hp.topLoop, ring(rCol, HX, N), up)
      stitch(main, hp.botLoop, ring(cs, 0, N), down)
      lathe(
        [
          { pts: [[rCol, HX], [rCol, H - rr], ...arc(rCol - rr, H - rr, rr, 0, Math.PI / 2, 5).slice(1), [rLip, H]], builder: main },
          { pts: [[rLip, H], [rLip, H - lipT]], builder: main },
          { pts: [[rLip, H - lipT], [rNyl, H - lipT]], builder: B.nylon },
          { pts: [[rNyl, H - lipT], [rNyl, HX]], builder: B.nylon },
          { pts: [[rNyl, HX], [csT, HX]], builder: B.nylon },
        ],
        { segments: N },
      )
      inner(0, HX, { csTop: csT })
      break
    }
    case 'flange': {
      const S = mm(nd.flange.s)
      const H = mm(nd.flange.h)
      const rF = mm(nd.flange.dc) / 2
      const fH = H * 0.36
      const yH0 = H * 0.2
      const e = H * 0.07
      const hp = hexPrism(main, { s: S, y0: yH0, y1: H, chamferTop: true, detail: p.detail })
      stitch(main, hp.topLoop, ring(cs, H, N), up)
      lathe(
        [
          { pts: [[cs, 0], [rF, 0]], builder: main },
          { pts: [[rF, 0], [rF, e]], builder: main },
          { pts: [[rF, e], [S * 0.47, fH]], builder: main },
        ],
        { segments: N },
      )
      inner(0, H)
      break
    }
    case 'wing': {
      const rB0 = D * 0.95
      const rB1 = D * 0.78
      const hB = D * 1.1
      const e = D * 0.06
      const rr = D * 0.12
      lathe(
        [
          { pts: [[cs, 0], [rB0 - e, 0]], builder: main },
          { pts: [[rB0 - e, 0], [rB0, e]], builder: main },
          { pts: [[rB0, e], [rB1, hB - rr], ...arc(rB1 - rr, hB - rr, rr, 0, Math.PI / 2, 4).slice(1), [cs, hB]], builder: main },
        ],
        { segments: N },
      )
      inner(0, hB)
      const wing = wingGeometry(D, p.detail)
      appendGeometry(main, wing)
      appendGeometry(main, wing, new THREE.Matrix4().makeRotationY(Math.PI))
      break
    }
    default:
      throw new Error(`Unknown nut: ${p.head}`)
  }
}

function wingGeometry(D, detail) {
  const s = new THREE.Shape()
  s.moveTo(0.55 * D, 0.12 * D)
  s.bezierCurveTo(1.35 * D, 0.14 * D, 2.05 * D, 0.85 * D, 2.02 * D, 1.55 * D)
  s.quadraticCurveTo(1.98 * D, 2.15 * D, 1.5 * D, 2.12 * D)
  s.bezierCurveTo(1.05 * D, 2.08 * D, 0.75 * D, 1.45 * D, 0.55 * D, 1.15 * D)
  s.lineTo(0.55 * D, 0.12 * D)
  const t = 0.28 * D
  const bevel = 0.07 * D
  let g = new THREE.ExtrudeGeometry(s, {
    depth: t - bevel * 2,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel * 0.9,
    bevelSegments: detail === 'low' ? 2 : 4,
    curveSegments: detail === 'low' ? 8 : 18,
  })
  g.translate(0, 0, -(t - bevel * 2) / 2)
  g.deleteAttribute('normal')
  g.deleteAttribute('uv')
  g = mergeVertices(g, 1e-5)
  g.computeVertexNormals()
  return g
}

function washer(B, p) {
  const d = p.diameter
  const N = SEGMENTS[p.detail]
  const wd = washerDims(d)
  if (p.head === 'spring') {
    const { d1, s, b } = wd.spring
    const S = mm(s)
    const W = mm(b)
    const rc = mm(d1) / 2 + W / 2
    const gap = 0.14
    helicalSweep(B.main, {
      section: roundedSection(W, S, Math.min(W, S) * 0.22, p.detail === 'low' ? 1 : 3),
      rc,
      a0: gap / 2,
      a1: TAU - gap / 2,
      rise: S * 0.75,
      steps: Math.round(N * 1.5),
    })
    return
  }
  const { d1, d2, h } = wd.flat
  const H = mm(h)
  lathe([{ pts: roundedRectProfile(mm(d1) / 2, mm(d2) / 2, 0, H, H * 0.22, p.detail === 'low' ? 1 : 3), closed: true, builder: B.main }], {
    segments: Math.max(N, 48),
  })
}

/** Stamped angle bracket: two legs with a hole and a slot, joined by a radiused bend. */
function bracket(B, p) {
  const N = SEGMENTS[p.detail]
  const W = mm(p.diameter) // width
  const L1 = mm(p.length) // long leg
  const L2 = L1 * 0.78
  const t = W * 0.1
  const R = t // inner bend radius
  const main = B.main
  const hole = circle2(L1 * 0.62, 0, W * 0.17, N)
  plate(main, {
    outline: roundedRect2(0, -W / 2, L1, W / 2, W * 0.22, 8, [1, 1, 0, 0]),
    holes: [hole],
    t,
    basis: { O: [0, 0, 0], U: [1, 0, 0], W: [0, 0, 1], H: [0, 1, 0] },
  })
  plate(main, {
    outline: roundedRect2(0, -W / 2, L2, W / 2, W * 0.22, 8, [1, 1, 0, 0]),
    holes: [slot2(L2 * 0.6, 0, L2 * 0.36, W * 0.3, 10)],
    t,
    basis: { O: [-(R + t), R + t, 0], U: [0, 1, 0], W: [0, 0, 1], H: [1, 0, 0] },
  })
  // the bend: a quarter tube between the legs
  const steps = p.detail === 'low' ? 6 : 12
  const C = [0, R + t]
  const rowsOuter = []
  const rowsInner = []
  for (let i = 0; i <= steps; i++) {
    const a = -Math.PI / 2 - (Math.PI / 2) * (i / steps)
    const ca = Math.cos(a)
    const sa = Math.sin(a)
    const o = [C[0] + (R + t) * ca, C[1] + (R + t) * sa]
    const n = [C[0] + R * ca, C[1] + R * sa]
    rowsOuter.push([o, [ca, sa]])
    rowsInner.push([n, [-ca, -sa]])
  }
  for (const rows of [rowsOuter, rowsInner]) {
    const ids = rows.map(([q, nn]) => [main.vert([q[0], q[1], -W / 2], [nn[0], nn[1], 0]), main.vert([q[0], q[1], W / 2], [nn[0], nn[1], 0])])
    for (let i = 0; i < steps; i++) main.quad(ids[i][0], ids[i + 1][0], ids[i + 1][1], ids[i][1])
  }
  for (const z of [-W / 2, W / 2]) {
    const nz = [0, 0, Math.sign(z)]
    for (let i = 0; i < steps; i++) {
      const a = rowsOuter[i][0]
      const b = rowsOuter[i + 1][0]
      const c = rowsInner[i + 1][0]
      const dd = rowsInner[i][0]
      main.quad(main.vert([a[0], a[1], z], nz), main.vert([b[0], b[1], z], nz), main.vert([c[0], c[1], z], nz), main.vert([dd[0], dd[1], z], nz))
    }
  }
}

/** Precision turned part: stepped shaft, circlip groove, spanner flats, centre holes. */
function turned(B, p) {
  const N = p.detail === 'low' ? 32 : 64
  const D = mm(p.diameter)
  const L = mm(p.length)
  const r1 = 0.3 * D
  const r2 = 0.5 * D
  const r3 = 0.38 * D
  const ch = 0.03 * D
  const yS1 = 0.38 * L
  const yS2 = 0.78 * L
  const g0 = 0.15 * L
  const g1 = g0 + 0.045 * L
  const rg = r1 - 0.07 * D
  const cd = 0.07 * D
  const cdh = cd * 1.1
  const fr = 0.035 * D
  const flat = 0.84 * r2
  const flats = (phi, r) => Math.min(r, flat / Math.max(1e-6, Math.abs(Math.cos(phi))))
  const m = B.main
  lathe(
    [
      { pts: [[0, cdh], [cd, 0]], builder: B.dark },
      { pts: [[cd, 0], [r1 - ch, 0]], builder: m },
      { pts: [[r1 - ch, 0], [r1, ch]], builder: m },
      { pts: [[r1, ch], [r1, g0]], builder: m },
      { pts: [[r1, g0], [rg, g0]], builder: m },
      { pts: [[rg, g0], [rg, g1]], builder: m },
      { pts: [[rg, g1], [r1, g1]], builder: m },
      { pts: [[r1, g1], [r1, yS1 - fr], ...arc(r1 + fr, yS1 - fr, fr, Math.PI, Math.PI / 2, 4).slice(1), [r2 - ch, yS1]], builder: m },
      { pts: [[r2 - ch, yS1], [r2, yS1 + ch]], builder: m, mod: flats },
      { pts: [[r2, yS1 + ch], [r2, yS2 - ch]], builder: m, mod: flats },
      { pts: [[r2, yS2 - ch], [r2 - ch, yS2]], builder: m, mod: flats },
      { pts: [[r2 - ch, yS2], [r3, yS2]], builder: m, mod: flats },
      { pts: [[r3, yS2], [r3, L - ch]], builder: m },
      { pts: [[r3, L - ch], [r3 - ch, L]], builder: m },
      { pts: [[r3 - ch, L], [cd, L]], builder: m },
      { pts: [[cd, L], [0, L - cdh]], builder: B.dark },
    ],
    { segments: N },
  )
}

/** Moulded "tree" panel clip: domed head, stem with flexible fins (split by two flats). */
function clip(B, p) {
  const N = SEGMENTS[p.detail]
  const Ds = mm(p.diameter)
  const L = mm(p.length)
  const rc = Ds * 0.27
  const rf = Ds * 0.5
  const fins = 5
  const yStem = L * 0.74
  const finH = yStem / fins
  const rH = Ds * 1.35
  const hH = Ds * 0.32
  const flat = rf * 0.7
  const flats = (phi, r) => Math.min(r, flat / Math.max(1e-6, Math.abs(Math.sin(phi))))
  const m = B.main
  const groups = [{ pts: [[0, 0], [rc * 0.7, 0]], builder: m }]
  for (let k = 0; k < fins; k++) {
    const y = k * finH
    const yt = y + finH * 0.82
    const start = k === 0 ? [rc * 0.7, 0] : [rc, y]
    groups.push({ pts: [start, [k === 0 ? rf * 0.82 : rf, yt]], builder: m, mod: flats })
    groups.push({ pts: [[k === 0 ? rf * 0.82 : rf, yt], [rc, yt]], builder: m, mod: flats })
    if (k < fins - 1) groups.push({ pts: [[rc, yt], [rc, y + finH]], builder: m })
  }
  groups.push({ pts: [[rc, yStem - finH * 0.18], [rc, L]], builder: m })
  groups.push({ pts: [[rc, L], [rH, L]], builder: m })
  const dome = []
  const n = 2.2
  for (let i = 0; i <= 14; i++) {
    const t = ((Math.PI / 2) * i) / 14
    dome.push([rH * Math.cos(t) ** (2 / n), L + hH * Math.sin(t) ** (2 / n)])
  }
  dome[dome.length - 1][0] = 0
  groups.push({ pts: dome, builder: m })
  lathe(groups, { segments: N })
}

/** Furniture connector: cam lock (with side entry window) + connecting bolt in place. */
function connector(B, p) {
  const k = p.diameter / 5
  const u = (v) => mm(v * k)
  const N = SEGMENTS[p.detail]
  const hi = p.detail !== 'low'

  // ── cam lock, axis vertical, window facing -X
  const R = u(7.5)
  const H = u(12.5)
  const c = u(0.5)
  const rr = u(1.1)
  const yw0 = H * 0.3
  const yw1 = H * 0.8
  const ri = R * 0.62
  const w0 = (4 * Math.PI) / 3
  const w1 = (5 * Math.PI) / 3
  const inWin = (phi) => phi > w0 && phi < w1
  const m = B.main
  lathe(
    [
      { pts: [[0, 0], [R - c, 0]], builder: m },
      { pts: [[R - c, 0], [R, c]], builder: m },
      { pts: [[R, c], [R, yw0], [R, yw1], [R, H - rr]], builder: m },
      { pts: [[R, H - rr], ...arc(R - rr, H - rr, rr, 0, Math.PI / 2, 4).slice(1)], builder: m },
    ],
    { segments: N, skip: (phi, y) => inWin(phi) && y > yw0 && y < yw1 },
  )
  crossRecess(B, { rOuter: R - rr, N, surfaceY: () => H, surfaceN: up, armX: R * 0.6, armZ: R * 0.36, w: R * 0.075, depth: H * 0.28, rings: 1, detail: p.detail })
  // window jambs + cavity
  const j0 = Math.round((w0 / TAU) * N)
  const j1 = Math.round((w1 / TAU) * N)
  const P = (r, phi, y) => [r * Math.sin(phi), y, r * Math.cos(phi)]
  for (let j = j0; j < j1; j++) {
    const a = (TAU * j) / N
    const b = (TAU * (j + 1)) / N
    for (const [y, ny] of [[yw1, -1], [yw0, 1]]) {
      const n = [0, ny, 0]
      m.quad(m.vert(P(R, a, y), n), m.vert(P(R, b, y), n), m.vert(P(ri, b, y), n), m.vert(P(ri, a, y), n))
    }
    const na = [Math.sin(a), 0, Math.cos(a)]
    const nb = [Math.sin(b), 0, Math.cos(b)]
    const d = B.dark
    d.quad(d.vert(P(ri, a, yw0), na), d.vert(P(ri, b, yw0), nb), d.vert(P(ri, b, yw1), nb), d.vert(P(ri, a, yw1), na))
  }
  for (const [phi, s] of [[w0, 1], [w1, -1]]) {
    const n = [Math.cos(phi) * s, 0, -Math.sin(phi) * s]
    m.quad(m.vert(P(R, phi, yw0), n), m.vert(P(R, phi, yw1), n), m.vert(P(ri, phi, yw1), n), m.vert(P(ri, phi, yw0), n))
  }

  // ── connecting bolt, built upright then laid into the window
  const bolt = makeBuilders()
  const rT = u(3.1)
  const Pt = u(2.6)
  const Lt = u(10)
  const rCol = u(3.8)
  const tCol = u(1.4)
  const rSh = u(2.5)
  const lSh = u(19)
  const rNeck = u(2.1)
  const lNeck = u(1.4)
  const rh = u(3.5)
  const rTop = u(2.2)
  const minor = minorRadius(rT, Pt, 'wood')
  const rFade = minor + (rT - minor) * 0.2
  threadSurface(bolt.main, {
    major: rT,
    pitch: Pt,
    y0: -Lt,
    y1: -u(0.3),
    segments: N,
    profile: 'wood',
    detail: p.detail,
    shankR: rFade,
    fadeLen: Pt * 0.6,
    taper: (y) => Math.min(1, 0.35 + ((y + Lt) / u(3.2)) * 0.65),
  })
  stitch(bolt.main, ring(rFade * 0.35, -Lt, N), [[0, -Lt, 0]], down)
  const yNeck0 = tCol + lSh
  const yNeck1 = yNeck0 + lNeck
  const aN = -Math.acos(rNeck / rh)
  const yc = yNeck1 - rh * Math.sin(aN)
  const aT = Math.acos(rTop / rh)
  const yTop = yc + rh * Math.sin(aT)
  const ball = []
  for (let i = 0; i <= (hi ? 14 : 7); i++) {
    const a = aN + ((aT - aN) * i) / (hi ? 14 : 7)
    ball.push([rh * Math.cos(a), yc + rh * Math.sin(a)])
  }
  const cc = u(0.3)
  lathe(
    [
      { pts: [[rFade, -u(0.3)], [rFade, 0]], builder: bolt.main },
      { pts: [[rFade, 0], [rCol - cc, 0]], builder: bolt.main },
      { pts: [[rCol - cc, 0], [rCol, cc]], builder: bolt.main },
      { pts: [[rCol, cc], [rCol, tCol - cc]], builder: bolt.main },
      { pts: [[rCol, tCol - cc], [rCol - cc, tCol]], builder: bolt.main },
      { pts: [[rCol - cc, tCol], [rSh, tCol]], builder: bolt.main },
      { pts: [[rSh, tCol], [rSh, yNeck0]], builder: bolt.main },
      { pts: [[rSh, yNeck0], [rNeck, yNeck1]], builder: bolt.main },
      { pts: ball, builder: bolt.main },
    ],
    { segments: N },
  )
  hexSocket(bolt, { rOuter: rTop, y: yTop, N, s: u(3), depth: u(2), detail: p.detail })

  // lay it along +X with the ball inside the cam's window
  const tx = -R * 0.18 - yTop
  const mtx = new THREE.Matrix4().makeTranslation(tx, (yw0 + yw1) / 2, 0).multiply(new THREE.Matrix4().makeRotationZ(-Math.PI / 2))
  return { extra: bolt, extraMatrix: mtx }
}

/** Steel plate with a tapped through-hole at the origin (top face y = 0). Used by the hero. */
function tappedPlate(B, p) {
  const N = SEGMENTS[p.detail]
  const R = mm(p.diameter) / 2
  const P = mm(p.pitch ?? pitchFor(p.diameter))
  const t = p.thickness
  const cs = R * 1.12
  plate(B.main, {
    outline: roundedRect2(-p.width / 2, -p.depth / 2, p.width / 2, p.depth / 2, 0.12, 6),
    holes: [circle2(0, 0, cs, N)],
    t,
    basis: { O: [0, -t, 0], U: [1, 0, 0], W: [0, 0, 1], H: [0, 1, 0] },
    chamfer: 0.035,
    holeWalls: false,
  })
  threadSurface(B.dark, { major: R, pitch: P, y0: -t, y1: 0, segments: N, detail: p.detail, internal: true, csTop: cs, csBot: cs })
}

const BUILDERS = { bolt, screw, nut, washer, bracket, turned, clip, connector, plate: tappedPlate }

/* ───────────────────────── public API ───────────────────────── */

function appendGeometry(b, geo, matrix) {
  const g = matrix ? geo.clone().applyMatrix4(matrix) : geo
  const pos = g.attributes.position
  const nrm = g.attributes.normal
  const base = []
  for (let i = 0; i < pos.count; i++) base.push(b.vert([pos.getX(i), pos.getY(i), pos.getZ(i)], [nrm.getX(i), nrm.getY(i), nrm.getZ(i)]))
  const idx = g.index
  const count = idx ? idx.count : pos.count
  for (let i = 0; i < count; i += 3) {
    const a = idx ? idx.getX(i) : i
    const c = idx ? idx.getX(i + 1) : i + 1
    const d = idx ? idx.getX(i + 2) : i + 2
    b.tri(base[a], base[c], base[d])
  }
}

/** Fill in defaults so equivalent requests share one cache entry. */
export function normalise(params) {
  const type = params.type ?? 'bolt'
  const def = DEFAULTS[type] ?? {}
  const given = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined))
  const p = { ...def, ...given, type, head: params.head ?? params.variant ?? def.head, detail: params.detail ?? 'high' }
  delete p.variant
  delete p.finish
  return p
}

const cache = new Map()

/**
 * Build (or fetch from cache) the geometry for a part.
 * @returns {{ geos: Record<string, THREE.BufferGeometry>, tris: number, ms: number }}
 */
export function buildPart(params) {
  const p = normalise(params)
  const key = JSON.stringify(p)
  if (cache.has(key)) return cache.get(key)
  const t0 = performance.now()
  const B = makeBuilders()
  const res = BUILDERS[p.type](B, p) || {}
  const geos = {}
  for (const role of ROLES) {
    const parts = []
    if (!B[role].empty) parts.push(B[role].build())
    if (res.extra && !res.extra[role].empty) parts.push(res.extra[role].build().applyMatrix4(res.extraMatrix))
    if (parts.length) {
      const g = parts.length === 1 ? parts[0] : mergeGeometries(parts)
      g.computeBoundingBox()
      g.computeBoundingSphere()
      geos[role] = g
    }
  }
  const tris = Object.values(geos).reduce((s, g) => s + (g.index ? g.index.count : g.attributes.position.count) / 3, 0)
  const out = { geos, tris, ms: performance.now() - t0 }
  cache.set(key, out)
  return out
}
