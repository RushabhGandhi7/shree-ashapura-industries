// A tiny procedural "studio" environment for metal reflections: a few emissive
// softbox planes baked once through PMREM. No HDR files, no drei loaders.
import * as THREE from 'three'

const BOXES = [
  // [position, rotation, scale(w,h), color, intensity]
  [[0, 6, 0], [Math.PI / 2, 0, 0], [10, 4], '#ffffff', 2.4],
  [[-6, 2, 2], [0, Math.PI / 2, 0], [8, 1.2], '#ffffff', 1.7],
  [[6, 1, 3], [0, -Math.PI / 2, 0], [8, 0.8], '#ffffff', 1.3],
  [[0, 1, 7], [0, Math.PI, 0], [12, 3], '#F6F4EF', 1.6],
  [[3, 2.5, -6], [0, 0, 0], [2.4, 2.4], '#C8102E', 0.7], // faint brand-red kicker
]

export function createStudioEnvironment(renderer, { size = 128 } = {}) {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#a3a4a5') // light neutral room tone, matches the cream page
  const geo = new THREE.PlaneGeometry(1, 1)
  for (const [pos, rot, [w, h], color, intensity] of BOXES) {
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide })
    const m = new THREE.Mesh(geo, mat)
    m.position.set(...pos)
    m.rotation.set(...rot)
    m.scale.set(w, h, 1)
    scene.add(m)
  }
  const pmrem = new THREE.PMREMGenerator(renderer)
  const rt = pmrem.fromScene(scene, 0.035, 0.1, 100, { size })
  pmrem.dispose()
  scene.traverse((o) => o.material?.dispose?.())
  geo.dispose()
  return rt
}
