// Physically based finishes. One material instance per (finish, role, quality), shared
// across every mesh that uses it, so the GPU compiles each program once.
//
// quality 'high': MeshPhysicalMaterial with anisotropic (turned / rolled) highlights that
//   follow each geometry's tangent attribute (circumferential on lathed parts, along the
//   helix on threads); clearcoat for anodising, iridescence for yellow passivation.
// quality 'low':  MeshStandardMaterial (mobile / low-end).
import * as THREE from 'three'
import { finishes } from '../data/products.js'

const cache = new Map()

let knurlTex
/** Procedural straight-knurl normal map (tangent space), tiled around the head. */
function knurlNormalMap() {
  if (knurlTex) return knurlTex
  const W = 32
  const data = new Uint8Array(W * 4)
  for (let x = 0; x < W; x++) {
    const ph = x / W
    const tri = ph < 0.5 ? ph * 2 : 2 - ph * 2 // 0..1..0 ridge
    const slope = ph < 0.5 ? 1 : -1
    const nx = slope * 0.55 * (tri > 0.1 && tri < 0.9 ? 1 : 0.3)
    const nz = Math.sqrt(1 - nx * nx)
    data.set([Math.round((nx * 0.5 + 0.5) * 255), 128, Math.round((nz * 0.5 + 0.5) * 255), 255], x * 4)
  }
  knurlTex = new THREE.DataTexture(data, W, 1)
  knurlTex.wrapS = knurlTex.wrapT = THREE.RepeatWrapping
  knurlTex.repeat.set(40, 1)
  knurlTex.magFilter = THREE.LinearFilter
  knurlTex.minFilter = THREE.LinearMipmapLinearFilter
  knurlTex.generateMipmaps = true
  knurlTex.needsUpdate = true
  return knurlTex
}

/**
 * @param {string} finish  key of `finishes` in src/data/products.js
 * @param {'main'|'dark'|'nylon'|'knurl'} role
 * @param {'high'|'low'} quality
 */
export function getMaterial(finish = 'zinc', role = 'main', quality = 'high') {
  const key = `${finish}|${role}|${quality}`
  if (cache.has(key)) return cache.get(key)

  const f = finishes[role === 'nylon' ? 'nylon' : finish] ?? finishes.zinc
  const hi = quality === 'high'
  const color = new THREE.Color(f.color)
  let roughness = f.roughness
  let envMapIntensity = 1

  if (role === 'dark') {
    // recesses / bores: occluded, so darker and less reflective
    color.multiplyScalar(f.metalness > 0.5 ? 0.42 : 0.7)
    roughness = Math.min(1, roughness + 0.12)
    envMapIntensity = 0.45
  }

  const params = { color, metalness: f.metalness, roughness, envMapIntensity }
  let m
  if (hi) {
    m = new THREE.MeshPhysicalMaterial(params)
    if (f.aniso && role !== 'dark') {
      m.anisotropy = f.aniso
      m.anisotropyRotation = 0
    }
    if (f.clearcoat) {
      m.clearcoat = f.clearcoat
      m.clearcoatRoughness = 0.22
    }
    if (f.iridescence && role !== 'dark') {
      m.iridescence = f.iridescence
      m.iridescenceIOR = 1.6
      m.iridescenceThicknessMinimum = 250
      m.iridescenceThicknessMaximum = 520
    }
    if (f.metalness === 0) {
      m.sheen = 0.25
      m.sheenRoughness = 0.6
      m.sheenColor = new THREE.Color('#ffffff')
    }
  } else {
    m = new THREE.MeshStandardMaterial(params)
  }
  if (role === 'knurl') {
    m.normalMap = knurlNormalMap()
    m.normalScale = new THREE.Vector2(1.1, 1.1)
  }
  m.name = key
  cache.set(key, m)
  return m
}
