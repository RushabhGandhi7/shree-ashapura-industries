// Shared state for the exploded-view section (main bundle + lazy 3D chunk).
import { boltDims, nutDims, washerDims } from '../three/specs.js'

const U = (v) => v / 10
const d = 8
const bd = boltDims(d)

export const EXPLODED = {
  spec: { diameter: d, length: 25, pitch: 1.25 },
  L: U(25),
  P: U(1.25),
  R: U(d) / 2,
  S: U(bd.hex.s),
  K: U(bd.hex.k),
  WT: U(washerDims(d).flat.h),
  WR: U(washerDims(d).flat.d2) / 2,
  NM: U(nutDims(d).hex.m),
}

export const explodedStore = { p: 0, anchors: null, onFrame: null, invalidate: null }

const clamp01 = (v) => Math.min(1, Math.max(0, v))
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
export const range = (p, a, b) => clamp01((p - a) / (b - a))

/**
 * Part positions from scroll progress. Assembled: washer under the head, nut against
 * it. Exploding: the bolt rises, the washer drops a little, and the nut runs down the
 * thread and off the tip. While it's on the thread its rotation is locked to its travel
 * (alpha = 2π·Δy/P), exactly like the hero.
 */
export function explodedAt(p) {
  const { L, P, WT, NM } = EXPLODED
  const e = easeInOut(range(p, 0.08, 0.62))
  const yB = 0.9 * e
  const yW = -WT - 0.75 * e
  const yN0 = -WT - NM
  const yN1 = 0.9 - L - 0.65 - NM
  const yN = yN0 + (yN1 - yN0) * e
  const rel = Math.max(yN - yB, -L - NM) // relative to the bolt; stops once off the tip
  const alpha = (2 * Math.PI * rel) / P
  return { e, yB, yW, yN, alpha }
}
