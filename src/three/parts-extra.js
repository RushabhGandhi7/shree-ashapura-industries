// Catalogue part builders (Phase 7A): washers (star / circlip / cap), brackets (T / square /
// hook), rivet, male-female screw, leveller, inserts (threaded / knurled / pin / bush),
// stud, cotter pin and castors (plate / stem).
// Same conventions as parts.js: 1 = 10 mm, Y is the axis, origin on the bearing face.
// parts.js imports this module and this module imports helpers from parts.js. That
// circular import is safe because only hoisted function declarations are used, and only
// at call time.
import * as THREE from 'three'
import { makeBuilders, ring, stitch, up, down, arc, TAU } from './lib/builder.js'
import { lathe, roundedRectProfile } from './lib/lathe.js'
import { threadSurface, minorRadius } from './lib/thread.js'
import { hexPrism } from './lib/hex.js'
import { plate, roundedRect2, circle2, roundedSection } from './lib/sheet.js'
import { tubeSweep, smoothPath } from './lib/sweep.js'
import { threadedShank, head } from './parts.js'
import { nutDims, washerDims, pitchFor } from './specs.js'

const mm = (v) => v / 10
const SEG = { high: 48, low: 24 }
const XZ = { O: [0, 0, 0], U: [1, 0, 0], W: [0, 0, 1], H: [0, 1, 0] }

/** A stud / thread built pointing down from y = 0, flipped to point up from `y`. */
function upwardThread(o, y) {
  const B2 = makeBuilders()
  const pts = threadedShank(B2, o)
  lathe([{ pts: [...pts, [0, 0]], builder: B2.main }], { segments: o.N })
  return { B: B2, matrix: new THREE.Matrix4().makeTranslation(0, y, 0).multiply(new THREE.Matrix4().makeRotationX(Math.PI)) }
}

/* ───────────────────────── washers ───────────────────────── */

/** External-tooth lock washer: flat ring with 10 square teeth. */
function star(B, p) {
  const N = SEG[p.detail]
  const { d1, d2, h } = washerDims(p.diameter).flat
  const ri = mm(d1) / 2
  const ro = (mm(d2) / 2) * 0.95
  const rr = ri + (ro - ri) * 0.5
  const teeth = 10
  const outline = []
  for (let k = 0; k < teeth; k++) {
    const a0 = (TAU * k) / teeth
    const s = TAU / teeth
    for (const [f, r] of [[0.08, rr], [0.2, ro], [0.55, ro], [0.67, rr]]) outline.push([r * Math.cos(a0 + s * f), r * Math.sin(a0 + s * f)])
  }
  plate(B.main, { outline, holes: [circle2(0, 0, ri, N)], t: mm(h) * 0.7, basis: XZ })
}

/** External circlip (DIN 471 style): tapered C-ring with two lug eyes at the gap. */
function circlip(B, p) {
  const D = mm(p.diameter)
  const ri = D * 0.47
  const bMin = D * 0.1
  const bLug = D * 0.3
  const g = 0.32 // half gap angle, centred on +u
  const steps = p.detail === 'low' ? 40 : 90
  const width = (a) => {
    const fromEnd = Math.min(a - g, TAU - g - a)
    const lug = Math.min(1, Math.max(0, 1 - (fromEnd - 0.3) / 0.35))
    const taper = bMin * (1 + 0.5 * Math.cos(a - Math.PI))
    return taper + (bLug - taper) * lug * lug * (3 - 2 * lug)
  }
  const outer = []
  const inner = []
  for (let i = 0; i <= steps; i++) {
    const a = g + ((TAU - 2 * g) * i) / steps
    outer.push([(ri + width(a)) * Math.cos(a), (ri + width(a)) * Math.sin(a)])
    inner.push([ri * Math.cos(a), ri * Math.sin(a)])
  }
  const outline = [...outer, ...inner.reverse()]
  const lugHole = (a) => {
    const rc = ri + bLug * 0.5
    return circle2(rc * Math.cos(a), rc * Math.sin(a), bLug * 0.2, 14)
  }
  plate(B.main, { outline, holes: [lugHole(g + 0.15), lugHole(TAU - g - 0.15)], t: D * 0.09, basis: XZ, chamfer: D * 0.012 })
}

/** Cap (cup) washer: pressed dome rising from a flat rim to the hole. */
function cap(B, p) {
  const N = Math.max(SEG[p.detail], 48)
  const D = mm(p.diameter)
  const ri = D * 0.55
  const ro = D * 1.25
  const H = D * 0.42
  const t = D * 0.09
  const steps = p.detail === 'low' ? 6 : 12
  const curve = (off) => {
    const out = []
    for (let i = 0; i <= steps; i++) {
      const s = i / steps
      const a = (Math.PI / 2) * s
      out.push([ro - (ro - ri) * (1 - Math.cos(a)) - off * 0.6, H * Math.sin(a) ** 0.85 - off])
    }
    return out
  }
  const outerC = curve(0)
  const innerC = curve(t).reverse()
  lathe(
    [
      { pts: outerC, builder: B.main },
      { pts: [outerC[outerC.length - 1], innerC[0]], builder: B.main },
      { pts: innerC, builder: B.main },
      { pts: [innerC[innerC.length - 1], outerC[0]], builder: B.main },
    ],
    { segments: N },
  )
}

/* ───────────────────────── brackets ───────────────────────── */

/** Flat T-plate with three holes. diameter = strip width, length = bar length. */
function tBracket(B, p) {
  const N = SEG[p.detail]
  const W = mm(p.diameter)
  const A = mm(p.length) / 2
  const S = A * 1.25
  const Wh = W / 2
  const t = W * 0.1
  const outline = [[-Wh, -S], [Wh, -S], [Wh, 0], [A, 0], [A, W], [-A, W], [-A, 0], [-Wh, 0]]
  const r = W * 0.17
  plate(B.main, {
    outline,
    holes: [circle2(-A + Wh, Wh, r, N), circle2(A - Wh, Wh, r, N), circle2(0, -S + Wh, r, N), circle2(0, Wh, r, N)],
    t,
    basis: { O: [0, 0, 0], U: [1, 0, 0], W: [0, 0, 1], H: [0, 1, 0] },
    chamfer: t * 0.15,
  })
}

/** Square plate (corner joint) with four holes. diameter = side. */
function squarePlate(B, p) {
  const N = SEG[p.detail]
  const A = mm(p.diameter) / 2
  const t = A * 0.1
  const h = A * 0.6
  plate(B.main, {
    outline: roundedRect2(-A, -A, A, A, A * 0.14, 6),
    holes: [[-h, -h], [h, -h], [h, h], [-h, h]].map(([u, w]) => circle2(u, w, A * 0.14, N)),
    t,
    basis: XZ,
    chamfer: t * 0.15,
  })
}

/** Wall hook: mounting plate with two holes and a J-bent strip. diameter = width. */
function hook(B, p) {
  const N = SEG[p.detail]
  const W = mm(p.diameter)
  const Lp = mm(p.length)
  const t = W * 0.12
  plate(B.main, {
    outline: roundedRect2(0, 0, Lp, W, W * 0.4, 8),
    holes: [circle2(Lp * 0.78, W / 2, W * 0.14, N), circle2(Lp * 0.42, W / 2, W * 0.14, N)],
    t,
    basis: { O: [-W / 2, 0, 0], U: [0, 1, 0], W: [1, 0, 0], H: [0, 0, 1] },
    chamfer: t * 0.15,
  })
  const y0 = Lp * 0.14
  const D1 = Lp * 0.42
  const rc = Lp * 0.24
  const path = [[0, y0, t * 0.5], [0, y0, D1 * 0.5]]
  const steps = p.detail === 'low' ? 10 : 20
  for (let i = 0; i <= steps; i++) {
    const a = -Math.PI / 2 + (Math.PI * 1.1 * i) / steps
    path.push([0, y0 + rc + rc * Math.sin(a), D1 + rc * Math.cos(a)])
  }
  tubeSweep(B.main, { path: smoothPath(path, 1), section: roundedSection(W * 0.62, t, t * 0.4, 2), normal0: [1, 0, 0] })
}

/* ───────────────────────── fasteners ───────────────────────── */

/** Solid round-head rivet with a semi-tubular tail. */
function rivet(B, p) {
  const N = SEG[p.detail]
  const D = mm(p.diameter)
  const R = D / 2
  const L = mm(p.length)
  const Rh = D * 0.875
  const K = D * 0.6
  const ri = R * 0.55
  const bd = D * 0.7
  const ch = R * 0.12
  const dome = []
  for (let i = 0; i <= 16; i++) {
    const t = ((Math.PI / 2) * i) / 16
    dome.push([i === 16 ? 0 : Rh * Math.cos(t), K * Math.sin(t)])
  }
  lathe(
    [
      { pts: [[0, -L + bd], [ri, -L + bd]], builder: B.dark },
      { pts: [[ri, -L + bd], [ri, -L]], builder: B.dark },
      { pts: [[ri, -L], [R - ch, -L]], builder: B.main },
      { pts: [[R - ch, -L], [R, -L + ch]], builder: B.main },
      { pts: [[R, -L + ch], [R, 0]], builder: B.main },
      { pts: [[R, 0], [Rh, 0]], builder: B.main },
      { pts: dome, builder: B.main },
    ],
    { segments: N },
  )
}

/** Male-female (sex) screw: button-head male screw above its female barrel, shown apart. */
function maleFemale(B, p) {
  const N = SEG[p.detail]
  const d = p.diameter
  const D = mm(d)
  const R = D / 2
  const P = mm(pitchFor(d))
  const Lm = mm(p.length) * 0.55
  const shankPts = threadedShank(B, { R, L: Lm, P, threadLen: Lm, N, detail: p.detail, fillet: D * 0.05 })
  head(B, 'button', { d, D, R, N, detail: p.detail, shankPts })

  // female barrel, head down, opening up
  const F = makeBuilders()
  const Rb = R * 1.65
  const Lb = mm(p.length)
  const Rh = D * 1.6
  const Kh = D * 0.45
  const c = Kh * 0.18
  const cs = R * 1.1
  const yb = Lb * 0.12
  lathe(
    [
      { pts: [[0, -Kh], [Rh - c, -Kh]], builder: F.main },
      { pts: [[Rh - c, -Kh], [Rh, -Kh + c]], builder: F.main },
      { pts: [[Rh, -Kh + c], [Rh, -c], [Rh - c, 0]], builder: F.main },
      { pts: [[Rh - c, 0], [Rb, 0]], builder: F.main },
      { pts: [[Rb, 0], [Rb, Lb - c]], builder: F.main },
      { pts: [[Rb, Lb - c], [Rb - c, Lb]], builder: F.main },
      { pts: [[Rb - c, Lb], [cs, Lb]], builder: F.main },
    ],
    { segments: N },
  )
  threadSurface(F.dark, { major: R, pitch: P, y0: yb, y1: Lb, segments: N, detail: p.detail, internal: true, csTop: cs, csBot: R * 1.02 })
  stitch(F.dark, ring(R * 1.02, yb, N), [[0, yb, 0]], up)
  const gap = D * 0.6
  return { extras: [{ B: F, matrix: new THREE.Matrix4().makeTranslation(0, -Lm - gap - Lb, 0) }] }
}

/** Double-ended stud with a hex collar. length = overall, collar sits at y = 0. */
function stud(B, p) {
  const N = SEG[p.detail]
  const d = p.diameter
  const D = mm(d)
  const R = D / 2
  const P = mm(p.pitch ?? pitchFor(d))
  const S = mm(nutDims(d).hex.s)
  const Hc = D * 0.5
  const L = mm(p.length)
  const L1 = (L - Hc) * 0.35
  const L2 = L - Hc - L1
  const rC = S * 0.42
  const o = { R, P, N, detail: p.detail }
  const lower = threadedShank(B, { ...o, L: L1, threadLen: L1 })
  lathe([{ pts: [...lower, [rC, 0]], builder: B.main }], { segments: N })
  const hp = hexPrism(B.main, { s: S, y0: 0, y1: Hc, chamferTop: true, chamferBot: true, detail: p.detail })
  stitch(B.main, hp.botLoop, ring(rC, 0, N), down)
  stitch(B.main, hp.topLoop, ring(rC, Hc, N), up)
  const B2 = makeBuilders()
  const upper = threadedShank(B2, { ...o, L: L2, threadLen: L2 })
  lathe([{ pts: [...upper, [rC, 0]], builder: B2.main }], { segments: N })
  return { extras: [{ B: B2, matrix: new THREE.Matrix4().makeTranslation(0, Hc, 0).multiply(new THREE.Matrix4().makeRotationX(Math.PI)) }] }
}

/** Split cotter pin: half-round wire, eye loop on top, two legs (one shorter). */
function cotterPin(B, p) {
  const rw = mm(p.diameter) / 2 // wire radius (diameter = nominal pin size)
  const L = mm(p.length)
  const Re = rw * 2.6
  const e = rw * 0.02
  const yc = Re * 0.95
  const loop = p.detail === 'low' ? 18 : 36
  const path = []
  for (let i = 0; i <= 6; i++) path.push([e, -L + (L * i) / 6, 0])
  const b0 = 0.42
  for (let i = 0; i <= loop; i++) {
    const b = b0 + ((TAU - 2 * b0) * i) / loop
    path.push([Re * Math.sin(b), yc - Re * Math.cos(b), 0])
  }
  for (let i = 0; i <= 6; i++) path.push([-e, -(L * 0.82 * i) / 6, 0])
  const half = []
  const hs = p.detail === 'low' ? 6 : 10
  for (let i = 0; i <= hs; i++) {
    const a = Math.PI / 2 + (Math.PI * i) / hs
    half.push([rw * Math.cos(a), rw * Math.sin(a)])
  }
  tubeSweep(B.main, { path: smoothPath(path, 2), section: half, normal0: [-1, 0, 0] })
}

/* ───────────────────────── plastic & inserts ───────────────────────── */

/** Furniture leveller: black moulded foot with hex boss, steel threaded stud on top. */
function leveller(B, p) {
  const N = SEG[p.detail]
  const d = p.diameter
  const D = mm(d)
  const R = D / 2
  const L = mm(p.length)
  const Rb = D * 2.4
  const Hb = D * 0.9
  const rk = D * 0.95
  const yk = -Hb * 0.42
  const flat = rk * 0.88
  const flats = (phi, r) => {
    const a = ((phi % (Math.PI / 3)) + Math.PI / 3) % (Math.PI / 3)
    return Math.min(r, flat / Math.cos(a - Math.PI / 6))
  }
  const c = D * 0.12
  const dome = []
  for (let i = 0; i <= 10; i++) {
    const t = i / 10
    dome.push([Rb - (Rb - rk * 1.05) * t, -Hb + Hb * 0.22 + (yk - (-Hb + Hb * 0.22)) * Math.sin((t * Math.PI) / 2)])
  }
  lathe(
    [
      { pts: [[0, -Hb], [Rb - c, -Hb]], builder: B.black },
      { pts: [[Rb - c, -Hb], ...arc(Rb - c, -Hb + c, c, -Math.PI / 2, 0, 4).slice(1), [Rb, -Hb + Hb * 0.22]], builder: B.black },
      { pts: dome, builder: B.black },
      { pts: [[rk * 1.05, yk], [rk, yk]], builder: B.black, mod: flats },
      { pts: [[rk, yk], [rk, -c * 0.5]], builder: B.black, mod: flats },
      { pts: [[rk, -c * 0.5], [rk - c * 0.5, 0]], builder: B.black, mod: flats },
      { pts: [[rk - c * 0.5, 0], [R * 1.05, 0]], builder: B.black },
    ],
    { segments: N },
  )
  const P = mm(pitchFor(d))
  return { extras: [upwardThread({ R, L, P, threadLen: L, N, detail: p.detail }, 0)] }
}

/** Inserts: threaded (furniture), knurled (brass), pin (brass), bush (flanged ferrule). */
function insert(B, p) {
  const N = SEG[p.detail]
  const d = p.diameter
  const D = mm(d)
  const R = D / 2
  const L = mm(p.length)
  const P = mm(pitchFor(d))
  const cs = R * 1.12
  const m = B.main
  const bore = (y0, y1, o = {}) => threadSurface(B.dark, { major: R, pitch: P, y0, y1, segments: N, detail: p.detail, internal: true, csTop: cs, csBot: cs, ...o })

  switch (p.head) {
    case 'threaded': {
      // flange on top (y 0..Fh), coarse external thread below
      const Ro = D
      const Rf = D * 1.3
      const Fh = D * 0.22
      const Po = mm(d * 0.4)
      const tipR = minorRadius(Ro, Po, 'wood') * 0.95
      threadSurface(m, { major: Ro, pitch: Po, y0: -L, y1: 0, segments: N, detail: p.detail, profile: 'wood', tipR, shankR: Ro * 0.86, fadeLen: Po * 0.6 })
      stitch(m, ring(tipR, -L, N), ring(cs, -L, N), down)
      const c = Fh * 0.25
      lathe(
        [
          { pts: [[Ro * 0.86, 0], [Rf, 0]], builder: m },
          { pts: [[Rf, 0], [Rf, Fh - c], [Rf - c, Fh]], builder: m },
          { pts: [[Rf - c, Fh], [cs, Fh]], builder: m },
        ],
        { segments: N },
      )
      bore(-L, Fh)
      return
    }
    case 'knurled': {
      const Ro = D * 0.8
      const Rg = Ro * 0.9
      const c = Ro * 0.08
      lathe(
        [
          { pts: [[cs, 0], [Ro - c, 0]], builder: m },
          { pts: [[Ro - c, 0], [Ro, c]], builder: m },
          { pts: [[Ro, c], [Ro, L * 0.42]], builder: B.knurl },
          { pts: [[Ro, L * 0.42], [Rg, L * 0.47], [Rg, L * 0.53], [Ro, L * 0.58]], builder: m },
          { pts: [[Ro, L * 0.58], [Ro, L - c]], builder: B.knurl },
          { pts: [[Ro, L - c], [Ro - c, L]], builder: m },
          { pts: [[Ro - c, L], [cs, L]], builder: m },
        ],
        { segments: N },
      )
      bore(0, L)
      return
    }
    case 'pin': {
      const c = R * 0.2
      const Rk = R * 1.06
      lathe(
        [
          { pts: [[0, 0], [R - c, 0]], builder: m },
          { pts: [[R - c, 0], [R, c]], builder: m },
          { pts: [[R, c], [R, L * 0.3]], builder: m },
          { pts: [[R, L * 0.3], [Rk, L * 0.33]], builder: m },
          { pts: [[Rk, L * 0.33], [Rk, L * 0.62]], builder: B.knurl },
          { pts: [[Rk, L * 0.62], [R, L * 0.65]], builder: m },
          { pts: [[R, L * 0.65], [R, L - c * 1.6], ...arc(R - c * 1.6, L - c * 1.6, c * 1.6, 0, Math.PI / 2, 5).slice(1), [0, L]], builder: m },
        ],
        { segments: N },
      )
      return
    }
    case 'bush': {
      const ri = R
      const Ro = D * 0.8
      const Rf = D * 1.2
      const Fh = D * 0.2
      const c = Fh * 0.25
      lathe(
        [
          { pts: [[ri, 0], [Ro - c, 0]], builder: m },
          { pts: [[Ro - c, 0], [Ro, c]], builder: m },
          { pts: [[Ro, c], [Ro, L - Fh]], builder: m },
          { pts: [[Ro, L - Fh], [Rf, L - Fh]], builder: m },
          { pts: [[Rf, L - Fh], [Rf, L - c], [Rf - c, L]], builder: m },
          { pts: [[Rf - c, L], [ri, L]], builder: m },
          { pts: [[ri, L], [ri, 0]], builder: B.dark },
        ],
        { segments: N },
      )
      return
    }
    default:
      throw new Error(`Unknown insert: ${p.head}`)
  }
}

/* ───────────────────────── castors ───────────────────────── */

/**
 * Castor, hanging below the mounting face (y = 0). diameter = wheel Ø.
 * plate: square top plate with 4 holes, black pressed fork, cream nylon wheel.
 * stem:  threaded stem, black fork and black twin wheels.
 */
function castor(B, p) {
  const N = SEG[p.detail]
  const isStem = p.head === 'stem'
  const Dw = mm(p.diameter)
  const Rw = Dw / 2
  const Ww = Dw * 0.4
  const tp = isStem ? 0 : Dw * 0.05
  const hr = Dw * 0.1
  const yTop = -tp - hr
  const ya = yTop - Dw * 0.12 - Rw * 0.95 // axle height
  const rAx = Dw * 0.05
  const gap = Dw * 0.03
  const tf = Dw * 0.035
  const xIn = Ww / 2 + gap
  const extras = []
  const toX = new THREE.Matrix4().makeRotationZ(-Math.PI / 2)

  // wheel(s), built around Y then turned onto the X axis
  const wheel = (x, width, role) => {
    const Bw = makeBuilders()
    const b = Bw[role]
    lathe(
      [
        { pts: roundedRectProfile(Rw * 0.66, Rw, -width / 2, width / 2, Math.min(width * 0.3, Rw * 0.15), p.detail === 'low' ? 2 : 4), closed: true, builder: b },
        { pts: roundedRectProfile(rAx, Rw * 0.68, -width * 0.38, width * 0.38, width * 0.06, 2), closed: true, builder: b },
      ],
      { segments: Math.max(N, 40) },
    )
    extras.push({ B: Bw, matrix: new THREE.Matrix4().makeTranslation(x, ya, 0).multiply(toX) })
  }
  if (isStem) {
    wheel(-Ww * 0.27, Ww * 0.46, 'black')
    wheel(Ww * 0.27, Ww * 0.46, 'black')
  } else wheel(0, Ww, 'cream')

  // axle with domed rivet ends
  const Ba = makeBuilders()
  const ax = xIn + tf + rAx * 0.8
  lathe(
    [
      {
        pts: [...arc(0, -ax, rAx * 1.5, -Math.PI / 2, 0, 4), [rAx, -ax], [rAx, ax], ...arc(0, ax, rAx * 1.5, 0, Math.PI / 2, 4)],
        builder: Ba.main,
      },
    ],
    { segments: 20 },
  )
  extras.push({ B: Ba, matrix: new THREE.Matrix4().makeTranslation(0, ya, 0).multiply(toX) })

  // pressed fork: two side cheeks and a top bridge
  const fork = B.black
  const Zh = Rw * 0.55
  const ra = Rw * 0.42
  const yF = yTop
  for (const s of [-1, 1]) {
    const outline = [[Zh, yF], [-Zh, yF]]
    for (let i = 0; i <= 12; i++) {
      const a = Math.PI + (Math.PI * i) / 12
      outline.push([ra * Math.cos(a), ya + ra * Math.sin(a)])
    }
    plate(fork, {
      outline,
      holes: [circle2(0, ya, rAx * 1.02, 16)],
      t: tf,
      basis: { O: [s > 0 ? xIn : -xIn - tf, 0, 0], U: [0, 0, 1], W: [0, 1, 0], H: [1, 0, 0] },
    })
  }
  plate(fork, {
    outline: roundedRect2(-xIn - tf, -Zh, xIn + tf, Zh, tf, 3),
    t: tf * 1.2,
    basis: { O: [0, yF - tf * 1.2, 0], U: [1, 0, 0], W: [0, 0, 1], H: [0, 1, 0] },
  })

  // swivel race
  const Rr = Rw * 0.62
  lathe(
    [
      { pts: [[0, yF], [Rr * 0.8, yF]], builder: B.main },
      { pts: [[Rr * 0.8, yF], [Rr, yF + hr * 0.45], [Rr * 0.92, yF + hr]], builder: B.main },
      { pts: [[Rr * 0.92, yF + hr], [Rr * 0.3, yF + hr]], builder: B.main },
    ],
    { segments: N },
  )

  if (isStem) {
    const d = Math.max(6, Math.round(p.diameter * 0.2))
    const R = mm(d) / 2
    extras.push(upwardThread({ R, L: Dw * 0.55, P: mm(pitchFor(d)), threadLen: Dw * 0.55, N, detail: p.detail }, 0))
  } else {
    const A = Rw * 0.95
    const h = A * 0.68
    plate(B.main, {
      outline: roundedRect2(-A, -A, A, A, A * 0.12, 5),
      holes: [[-h, -h], [h, -h], [h, h], [-h, h]].map(([u, w]) => circle2(u, w, A * 0.09, 16)),
      t: tp,
      basis: { O: [0, -tp, 0], U: [1, 0, 0], W: [0, 0, 1], H: [0, 1, 0] },
      chamfer: tp * 0.15,
    })
    const rd = Rr * 0.28
    lathe([{ pts: [[rd, 0], ...arc(0, 0, rd, 0, Math.PI / 2, 5).slice(1)], builder: B.main }], { segments: 24 })
  }
  return { extras }
}

export const EXTRA = {
  washerVariant: { star, circlip, cap },
  bracketVariant: { T: tBracket, square: squarePlate, hook },
  builders: { rivet, maleFemale, stud, cotterPin, leveller, insert, castor },
}
