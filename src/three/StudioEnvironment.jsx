// Light, neutral studio for metal reflections. It's rendered once into a cube map, so it
// costs nothing per frame and needs no HDR download.
//
// Built with three directly instead of drei <Environment> + <Lightformer>: drei's Environment
// module statically imports its HDR / EXR / gain-map loaders (fflate, gainmap-js,
// three-stdlib, ~55 KB gzip) even when only Lightformers are used. This reproduces exactly
// what drei did for our props: a virtual scene with the cyclorama and the light panels
// (MeshBasicMaterial, toneMapped false, DoubleSide, colour × intensity, each panel turned to
// face the origin as Lightformer's default `target` does), rendered once by a CubeCamera
// (near 0.1, far 1000) into a HalfFloat cube render target that becomes scene.environment.
import { useLayoutEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

// key softbox overhead, two strip lights, a soft front fill, faint brand-red kicker
const PANELS = [
  { form: 'rect', intensity: 3, position: [0, 7, 0], scale: [12, 5, 1] },
  { form: 'rect', intensity: 2.2, position: [-7, 2.5, 1.5], scale: [10, 1.4, 1] },
  { form: 'rect', intensity: 1.6, position: [7, 1.5, 2.5], scale: [10, 0.9, 1] },
  { form: 'rect', intensity: 1.4, position: [0, 1.5, 8], scale: [14, 3, 1], color: '#f6f4ef' },
  { form: 'rect', intensity: 0.35, position: [0, -6, 0], scale: [14, 14, 1], color: '#e9e7e1' },
  { form: 'rect', intensity: 2.6, position: [-4, 4, -6], scale: [2, 8, 1] },
  { form: 'ring', intensity: 0.9, position: [3.5, 2.5, -7], scale: 2.6, color: '#C8102E', kicker: true },
]

function buildStudio(warm, kicker) {
  const studio = new THREE.Scene()
  // mid-grey cyclorama: neutral and light overall, but dark enough between the
  // softboxes that polished metal shows contrast instead of reading as white plastic
  const cyc = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), new THREE.MeshBasicMaterial({ color: warm ? '#8f8c86' : '#8a8a88', side: THREE.BackSide }))
  cyc.scale.setScalar(60)
  studio.add(cyc)
  for (const p of PANELS) {
    if (p.kicker && !kicker) continue
    const geo = p.form === 'ring' ? new THREE.RingGeometry(0.25, 0.5, 64) : new THREE.PlaneGeometry(1, 1)
    const mat = new THREE.MeshBasicMaterial({ toneMapped: false, side: THREE.DoubleSide })
    mat.color.set(p.color ?? 'white').multiplyScalar(p.intensity)
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.set(...p.position)
    if (Array.isArray(p.scale)) mesh.scale.set(...p.scale)
    else mesh.scale.setScalar(p.scale)
    mesh.lookAt(0, 0, 0)
    studio.add(mesh)
  }
  return studio
}

/**
 * kicker: the faint brand-red ring light. Flat polished faces (e.g. a stainless washer seen
 * from just above) mirror it as thin red streaks; scenes with such faces turn it off.
 */
export default function StudioEnvironment({ resolution = 256, intensity = 1, warm = false, kicker = true }) {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)

  useLayoutEffect(() => {
    const fbo = new THREE.WebGLCubeRenderTarget(resolution)
    fbo.texture.type = THREE.HalfFloatType
    const studio = buildStudio(warm, kicker)
    const cam = new THREE.CubeCamera(0.1, 1000, fbo)
    studio.add(cam)

    const autoClear = gl.autoClear
    gl.autoClear = true
    cam.update(gl, studio)
    gl.autoClear = autoClear

    const prev = { environment: scene.environment, intensity: scene.environmentIntensity }
    scene.environment = fbo.texture
    scene.environmentIntensity = intensity

    return () => {
      scene.environment = prev.environment
      scene.environmentIntensity = prev.intensity
      fbo.dispose()
      studio.traverse((o) => {
        o.geometry?.dispose()
        o.material?.dispose()
      })
    }
  }, [gl, scene, resolution, intensity, warm, kicker])

  return null
}
