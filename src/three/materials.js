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
export function knurlNormalMap() {
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
 * Numeric material parameters for a finish + role (shared by cached materials and the
 * customiser's animated ones, so both always look the same).
 */
export function finishParams(finish = 'zinc', role = 'main') {
  // fixed-material roles ignore the part's finish
  const fixed = { nylon: 'nylon', cream: 'nylon', black: 'nylonBlack' }[role]
  const f = finishes[fixed ?? finish] ?? finishes.zinc
  const color = new THREE.Color(f.color)
  let roughness = f.roughness
  let envMapIntensity = 1
  if (role === 'dark') {
    // recesses / bores: occluded, so darker and less reflective
    color.multiplyScalar(f.metalness > 0.5 ? 0.42 : 0.7)
    roughness = Math.min(1, roughness + 0.12)
    envMapIntensity = 0.45
  }
  const dark = role === 'dark'
  return {
    color,
    metalness: f.metalness,
    roughness,
    envMapIntensity,
    anisotropy: !dark ? f.aniso ?? 0 : 0,
    clearcoat: f.clearcoat ?? 0,
    iridescence: !dark ? f.iridescence ?? 0 : 0,
    sheen: f.metalness === 0 ? 0.25 : 0,
  }
}

function applyExtras(m) {
  m.anisotropyRotation = 0
  m.clearcoatRoughness = 0.22
  m.iridescenceIOR = 1.6
  m.iridescenceThicknessMinimum = 250
  m.iridescenceThicknessMaximum = 520
  m.sheenRoughness = 0.6
  m.sheenColor = new THREE.Color('#ffffff')
}

/**
 * @param {string} finish  key of `finishes` in src/data/products.js
 * @param {'main'|'dark'|'nylon'|'knurl'} role
 * @param {'high'|'low'} quality
 */
export function getMaterial(finish = 'zinc', role = 'main', quality = 'high') {
  const key = `${finish}|${role}|${quality}`
  if (cache.has(key)) return cache.get(key)
  const fp = finishParams(finish, role)
  let m
  if (quality === 'high') {
    m = new THREE.MeshPhysicalMaterial({ color: fp.color, metalness: fp.metalness, roughness: fp.roughness, envMapIntensity: fp.envMapIntensity })
    applyExtras(m)
    m.anisotropy = fp.anisotropy
    m.clearcoat = fp.clearcoat
    m.iridescence = fp.iridescence
    m.sheen = fp.sheen
  } else {
    m = new THREE.MeshStandardMaterial({ color: fp.color, metalness: fp.metalness, roughness: fp.roughness, envMapIntensity: fp.envMapIntensity })
  }
  if (role === 'knurl') {
    m.normalMap = knurlNormalMap()
    m.normalScale = new THREE.Vector2(1.1, 1.1)
  }
  m.name = key
  cache.set(key, m)
  return m
}

/**
 * A material that can blend between finishes (customiser). Physical features are kept
 * just above zero so switching finishes never forces a shader recompile.
 */
export function createTweenMaterial(finish, role, quality) {
  const fp = finishParams(finish, role)
  const hi = quality === 'high'
  const m = hi ? new THREE.MeshPhysicalMaterial() : new THREE.MeshStandardMaterial()
  if (hi) applyExtras(m)
  if (role === 'knurl') {
    m.normalMap = knurlNormalMap()
    m.normalScale = new THREE.Vector2(1.1, 1.1)
  }
  setTweenTargets(m, fp, hi, true)
  return m
}

/** Target values for a tween material (or applies them immediately with `now`). */
export function setTweenTargets(m, fp, hi, now = false) {
  const t = {
    metalness: fp.metalness,
    roughness: fp.roughness,
    envMapIntensity: fp.envMapIntensity,
    ...(hi
      ? {
          anisotropy: Math.max(0.001, fp.anisotropy),
          clearcoat: Math.max(0.001, fp.clearcoat),
          iridescence: Math.max(0.001, fp.iridescence),
          sheen: Math.max(0.001, fp.sheen),
        }
      : {}),
  }
  if (now) {
    m.color.copy(fp.color)
    Object.assign(m, t)
  }
  return { color: { r: fp.color.r, g: fp.color.g, b: fp.color.b }, values: t }
}
