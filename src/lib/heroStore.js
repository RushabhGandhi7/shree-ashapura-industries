// Shared, mutable hero state. No React state and no three import, so the main bundle
// (Hero.jsx) and the lazy 3D chunk (HeroScene.jsx) can both use it cheaply.
import { heroBolt } from '../data/products.js'

const U = (v) => v / 10 // mm -> scene units

export const BOLT = {
  L: U(heroBolt.length),
  P: U(heroBolt.pitch),
  D: U(heroBolt.diameter),
  AF: U(18),
  K: U(7.5),
  hover: 1.4, // tip clearance above the plate at rest
  plateT: 0.8,
}

export const heroStore = {
  p: 0, // scroll progress 0..1
  pointer: { x: 0, y: 0 }, // target tilt, -1..1
  frame: null, // { x0, y0, x1, y1, avoid } canvas-px box the subject is fitted into (Hero.jsx)
  invalidate: null, // set by the canvas (frameloop="demand")
  anchors: null, // projected screen points, set by the canvas each frame
  onFrame: null, // overlay updater, called after anchors change
  ready: false, // first frame rendered
}

export const requestFrame = () => heroStore.invalidate?.()

const clamp01 = (v) => Math.min(1, Math.max(0, v))
export const range = (p, a, b) => clamp01((p - a) / (b - a))
const easeOut = (t) => 1 - Math.pow(1 - t, 3)
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
export const lerp = (a, b, t) => a + (b - a) * t

// Choreography keyframes (see plan): rest -> align -> thread -> seat -> hold.
export const PHASES = { align: [0.06, 0.22], thread: [0.22, 0.86], seat: [0.86, 0.95] }

/**
 * Everything that depends on scroll progress, derived from one number.
 * h: height of the bolt's bearing face above the plate top.
 * alpha: bolt rotation (rad) around +Y. Locked to h while engaged: alpha = 2PI * h / P,
 *        so the helix stays fixed in space, the way a real thread advances.
 */
export function boltStateAt(p) {
  const { L, P, hover } = BOLT
  const hRest = L + hover
  const hEngage = L // tip just touching the plate
  const hSnug = 0.06 // head nearly down at end of free running

  let h
  const a = range(p, ...PHASES.align)
  const t = range(p, ...PHASES.thread)
  const s = range(p, ...PHASES.seat)

  if (p < PHASES.thread[0]) h = lerp(hRest, hEngage, easeOut(a))
  else if (p < PHASES.seat[0]) h = lerp(hEngage, hSnug, easeInOut(t))
  else h = lerp(hSnug, 0, easeOut(s))

  const engaged = Math.min(h, hEngage)
  const alpha = (Math.PI * 2 * engaged) / P

  const turns = (hEngage - engaged) / P
  // Running torque while threading, small ripple per turn; then the tightening ramp.
  let torque = 0
  if (p >= PHASES.thread[0]) {
    torque = 6 * Math.pow(easeInOut(t), 0.7) + 0.5 * Math.sin(turns * Math.PI * 2) * t * (1 - t) * 4
    if (p >= PHASES.seat[0]) torque = lerp(6, 79, Math.pow(s, 2.2))
  }

  let phase = 'align'
  if (p >= PHASES.thread[0]) phase = 'thread'
  if (p >= PHASES.seat[0]) phase = 'seat'
  if (p >= PHASES.seat[1] - 0.005) phase = 'seated'

  // Camera: high 3/4 -> lower and orbiting a little. Framing (distance/target) is fitted
  // to the live bolt + plate extents in the scene.
  const c = easeInOut(range(p, 0.04, 0.95))
  const camera = { az: lerp(24, 38, c), el: lerp(24, 13, c) }

  return { h, alpha, turns, torque: Math.max(0, torque), phase, camera }
}

/** Draw-in progress (0..1) for each dimension, from scroll progress. */
export function dimsAt(p) {
  return {
    dia: easeOut(range(p, 0.08, 0.2)) * (1 - range(p, 0.8, 0.88)), // hidden once the head covers the hole
    len: easeOut(range(p, 0.24, 0.38)),
    thread: easeOut(range(p, 0.36, 0.48)),
    pitch: easeOut(range(p, 0.48, 0.58)),
    af: easeOut(range(p, 0.88, 0.97)),
    mark: range(p, 0.95, 0.99), // torque witness mark
  }
}
