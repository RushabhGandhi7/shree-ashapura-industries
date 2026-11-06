// Procedural, parameter-driven fastener geometry. Units: 1 = 10 mm.
// All builders are pure and memoised by their parameters.
import * as THREE from 'three'

const cache = new Map()
const memo = (key, build) => {
  if (!cache.has(key)) cache.set(key, build())
  return cache.get(key)
}

export const mm = (v) => v / 10

/**
 * ISO-style trapezoidal thread profile, 0..1 over one pitch.
 * 1 = crest (major diameter), 0 = root (minor diameter).
 */
export function threadProfile(t) {
  t -= Math.floor(t)
  if (t < 0.125) return 1
  if (t < 0.4375) return 1 - (t - 0.125) / 0.3125
  if (t < 0.6875) return 0
  return (t - 0.6875) / 0.3125
}

/**
 * Helical phase at a point. The same function is used for the bolt and for the
 * tapped hole, so they mesh. A rotation of the bolt by alpha (around +Y) combined
 * with a lift of alpha / 2PI * pitch keeps the surface invariant: a real thread.
 */
export const threadPhase = (y, x, z, pitch) => y / pitch - Math.atan2(x, z) / (Math.PI * 2)

/** Detail presets: radial segments + rows per pitch. */
export const DETAIL = {
  high: { radial: 64, perPitch: 14 },
  low: { radial: 36, perPitch: 8 },
}

/**
 * Externally threaded shaft. Top (under the head) at y = 0, tip at y = -length.
 * `threadLength` lets part of the shank stay plain (defaults to fully threaded).
 */
export function threadedShaft({ diameter, length, pitch, threadLength = length, detail = 'high' }) {
  const key = `shaft:${diameter}:${length}:${pitch}:${threadLength}:${detail}`
  return memo(key, () => {
    const { radial, perPitch } = DETAIL[detail]
    const R = diameter / 2
    const h = 0.6134 * pitch // ISO external thread depth
    const minor = R - h
    const rows = Math.max(8, Math.ceil((length / pitch) * perPitch))
    const geo = new THREE.CylinderGeometry(R, R, length, radial, rows, false)
    geo.translate(0, -length / 2, 0)

    const pos = geo.attributes.position
    const chamfer = pitch * 1.1
    const plainTo = -(length - threadLength) // shank is plain from 0 down to plainTo
    const v = new THREE.Vector3()
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i)
      const r0 = Math.hypot(v.x, v.z)
      if (r0 < 1e-5) continue // cap centres
      let r = v.y > plainTo ? R * 0.985 : minor + h * threadProfile(threadPhase(v.y, v.x, v.z, pitch))
      // 45° chamfer at the tip
      const fromTip = v.y + length
      r = Math.min(r, minor * 0.92 + fromTip)
      const s = r / r0
      pos.setXYZ(i, v.x * s, v.y, v.z * s)
    }
    geo.computeVertexNormals()
    return geo
  })
}

/**
 * Internal (tapped) thread sleeve for a hole of the same nominal size.
 * Spans y in [-depth, 0]. Render with side = BackSide.
 */
export function tappedSleeve({ diameter, depth, pitch, clearance = 0.012, detail = 'high' }) {
  const key = `sleeve:${diameter}:${depth}:${pitch}:${detail}`
  return memo(key, () => {
    const { radial, perPitch } = DETAIL[detail]
    const R = diameter / 2
    const h = 0.6134 * pitch
    const minor = R - h
    const rows = Math.max(6, Math.ceil((depth / pitch) * perPitch))
    const geo = new THREE.CylinderGeometry(R, R, depth, radial, rows, true)
    geo.translate(0, -depth / 2, 0)
    const pos = geo.attributes.position
    const v = new THREE.Vector3()
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i)
      const r0 = Math.hypot(v.x, v.z)
      const r = minor + h * threadProfile(threadPhase(v.y, v.x, v.z, pitch)) + clearance
      pos.setXYZ(i, (v.x / r0) * r, v.y, (v.z / r0) * r)
    }
    geo.computeVertexNormals()
    return geo
  })
}

const hexShape = (af) => {
  const rc = af / 2 / Math.cos(Math.PI / 6)
  const s = new THREE.Shape()
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i
    const x = rc * Math.cos(a)
    const y = rc * Math.sin(a)
    if (i === 0) s.moveTo(x, y)
    else s.lineTo(x, y)
  }
  s.closePath()
  return s
}

/** Hex head with bevelled edges, sitting on y = 0 and rising to y = height. */
export function hexHead({ af, height }) {
  return memo(`hex:${af}:${height}`, () => {
    const bevel = Math.min(0.06, height * 0.08)
    // Bevel inflates the outline by `bevel`, so start smaller to keep the true AF.
    const geo = new THREE.ExtrudeGeometry(hexShape(af - bevel * 2), {
      depth: height - bevel * 2,
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 3,
      curveSegments: 1,
    })
    geo.rotateX(-Math.PI / 2)
    geo.translate(0, bevel, 0)
    geo.computeVertexNormals()
    return geo
  })
}

/** Hex nut body (hexagon with a through hole), y from 0 to height. */
export function hexNut({ af, height, diameter }) {
  return memo(`nut:${af}:${height}:${diameter}`, () => {
    const bevel = Math.min(0.05, height * 0.08)
    const shape = hexShape(af - bevel * 2)
    const hole = new THREE.Path()
    hole.absarc(0, 0, diameter / 2, 0, Math.PI * 2, true)
    shape.holes.push(hole)
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: height - bevel * 2,
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 2,
      curveSegments: 48,
    })
    geo.rotateX(-Math.PI / 2)
    geo.translate(0, bevel, 0)
    return geo
  })
}

/** Flat washer, y from 0 to thickness. */
export function washer({ inner, outer, thickness }) {
  return memo(`washer:${inner}:${outer}:${thickness}`, () => {
    const shape = new THREE.Shape()
    shape.absarc(0, 0, outer, 0, Math.PI * 2, false)
    const hole = new THREE.Path()
    hole.absarc(0, 0, inner, 0, Math.PI * 2, true)
    shape.holes.push(hole)
    const bevel = thickness * 0.2
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: thickness - bevel * 2,
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 2,
      curveSegments: 64,
    })
    geo.rotateX(-Math.PI / 2)
    geo.translate(0, bevel, 0)
    return geo
  })
}

/**
 * Rectangular steel plate with a tapped hole at the origin.
 * Top face at y = 0, bottom at y = -thickness.
 */
export function plateWithHole({ width, depth, thickness, holeDiameter, radius = 0.12 }) {
  return memo(`plate:${width}:${depth}:${thickness}:${holeDiameter}:${radius}`, () => {
    const w = width / 2
    const d = depth / 2
    const r = radius
    const s = new THREE.Shape()
    s.moveTo(-w + r, -d)
    s.lineTo(w - r, -d)
    s.quadraticCurveTo(w, -d, w, -d + r)
    s.lineTo(w, d - r)
    s.quadraticCurveTo(w, d, w - r, d)
    s.lineTo(-w + r, d)
    s.quadraticCurveTo(-w, d, -w, d - r)
    s.lineTo(-w, -d + r)
    s.quadraticCurveTo(-w, -d, -w + r, -d)
    const hole = new THREE.Path()
    hole.absarc(0, 0, holeDiameter / 2, 0, Math.PI * 2, true)
    s.holes.push(hole)

    const bevel = 0.035
    const geo = new THREE.ExtrudeGeometry(s, {
      depth: thickness - bevel * 2,
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 2,
      curveSegments: 56,
    })
    // Extrude runs along +Z; lay it flat so the top face is at y = 0.
    geo.rotateX(-Math.PI / 2)
    geo.translate(0, -thickness + bevel, 0)
    return geo
  })
}

/** Soft radial gradient texture for fake contact shadows (no shadow maps). */
let blobTex
export function blobShadowTexture() {
  if (blobTex) return blobTex
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  grad.addColorStop(0, 'rgba(28,29,31,0.55)')
  grad.addColorStop(0.45, 'rgba(28,29,31,0.22)')
  grad.addColorStop(1, 'rgba(28,29,31,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 128, 128)
  blobTex = new THREE.CanvasTexture(c)
  blobTex.colorSpace = THREE.SRGBColorSpace
  return blobTex
}
