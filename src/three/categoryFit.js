// Framing for a category's group of parts (cards, drawer renders, /lab render mode).
import * as THREE from 'three'
import { buildPart } from './parts.js'

export const CARD_FOV = 24
const TAN = Math.tan(((CARD_FOV / 2) * Math.PI) / 180)

/** Centre, spin radius and axial extent of a group of parts (spin is about local Y). */
export function measure(parts, detail = 'low') {
  const box = new THREE.Box3()
  const m = new THREE.Matrix4()
  for (const p of parts) {
    const { geos } = buildPart({ ...p, detail })
    m.compose(new THREE.Vector3(...(p.position ?? [0, 0, 0])), new THREE.Quaternion().setFromEuler(new THREE.Euler(...(p.rotation ?? [0, 0, 0]))), new THREE.Vector3(1, 1, 1))
    Object.values(geos).forEach((g) => box.union(g.boundingBox.clone().applyMatrix4(m)))
  }
  const c = box.getCenter(new THREE.Vector3())
  const s = box.getSize(new THREE.Vector3())
  return { c, radius: Math.hypot(s.x, s.z) / 2, height: s.y }
}

/** Camera distance that fits the tilted group over a full spin (worst case). */
export function fitDistance(tilt, { radius, height }, aspect = 4 / 3, margin = 1.1) {
  const axis = new THREE.Vector3(0, 1, 0).applyEuler(new THREE.Euler(...tilt))
  const w = Math.abs(axis.x) * height + 2 * radius
  const h = Math.abs(axis.y) * height + 2 * radius
  return Math.max(h / (2 * TAN), w / (2 * TAN * aspect)) * margin
}
