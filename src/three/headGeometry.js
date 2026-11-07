// Head proportions shared by the 3D builders (parts.js → head()) and the 2D top view in
// the configurator (components/customise/TopView.jsx), so the drawing and the model
// always agree. Base sizes come from the ISO-style tables in specs.js; the ratios below
// are the detail proportions the procedural heads use.
//
// Orientation (both): a point at angle φ sits at x = r·sin φ, z = r·cos φ. Hex heads and
// hex sockets have flats facing φ = 0, 60°, … (corners at 30°, 90°, …). Cross recess
// arms run along x and z. In the top view x is right and z is down.
import { boltDims } from './specs.js'
import { minorRadius } from './lib/thread.js'

export const HEAD = {
  hex: { chamfer: 0.475 }, // chamfer circle radius / AF (≈ 0.95·s chamfer Ø)
  socket: { edge: 0.05, round: 0.14 }, // bottom edge chamfer, top round (× head radius)
  pan: { dome: 0.3, n: 2.6, recess: 0.72, arm: 0.54, armW: 0.11 }, // × head radius
  csk: { band: 0.04, chamfer: 0.025 }, // × d (cylindrical band and top chamfer)
}

/**
 * Top-view (looking down the axis from the head) dimensions in mm for a bolt.
 * @returns {{ outline: 'hex'|'circle', head: number, ... }}
 */
export function topView({ head, diameter: d, pitch }) {
  const dims = boltDims(d)
  const P = pitch ?? dims.P
  const root = 2 * minorRadius(d / 2, P, 'iso')
  const base = { d, P, root }
  switch (head) {
    case 'hex': {
      const { s, k } = dims.hex
      return { ...base, head, outline: 'hex', af: s, ac: s / Math.cos(Math.PI / 6), width: s, height: k, chamfer: 2 * HEAD.hex.chamfer * s, drive: 'none' }
    }
    case 'socket': {
      const { dk, k, key } = dims.socket
      return { ...base, head, outline: 'circle', dk, width: dk, height: k, face: dk * (1 - HEAD.socket.round), drive: 'hex', key }
    }
    case 'pan': {
      const { dk, k } = dims.pan
      return { ...base, head, outline: 'circle', dk, width: dk, height: k, face: dk * HEAD.pan.recess, drive: 'cross', arm: (dk / 2) * HEAD.pan.arm, armW: (dk / 2) * HEAD.pan.armW }
    }
    case 'countersunk': {
      const { dk, key } = dims.csk
      const ch = d * HEAD.csk.chamfer
      return { ...base, head, outline: 'circle', dk, width: dk, height: dk / 2 - d / 2 + d * (HEAD.csk.band + HEAD.csk.chamfer), face: dk - 2 * ch, drive: 'hex', key, angle: 90 }
    }
    default:
      throw new Error(`topView: unknown head ${head}`)
  }
}
