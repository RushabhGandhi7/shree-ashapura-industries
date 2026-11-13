// Lazy-loaded 3D hero (lands in the `three` chunk). Rendering is on demand:
// frames are requested by the scroll timeline and by pointer tilt via heroStore.
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useReleaseGL } from '../../lib/glGate.js'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Bolt, TappedPlate } from '../../three/Fastener.jsx'
import StudioEnvironment from '../../three/StudioEnvironment.jsx'
import { blobShadowTexture } from '../../three/lib/shadow.js'
import { heroBolt } from '../../data/products.js'
import { glAntialias } from '../../lib/device.js'
import { content } from '../../data/content.js'
import { heroStore, boltStateAt, dimsAt, BOLT } from '../../lib/heroStore.js'

const DEG = Math.PI / 180
const TAN_HALF_FOV = Math.tan(15 * DEG) // fov 30
const PLATE = { w: 4.6, d: 3.2 }

const v = new THREE.Vector3()
const right = new THREE.Vector3()
const tmp = new THREE.Vector3()

function Rig({ tilt }) {
  const root = useRef(null)
  const bolt = useRef(null)
  const boltShadow = useRef(null)
  const markHead = useRef(null)
  const markFlat = useRef(null)
  const markPlate = useRef(null)
  const tiltNow = useRef({ x: 0, y: 0 })
  const first = useRef(true)
  const { camera, size, invalidate } = useThree()

  const anchors = useMemo(() => Array.from({ length: 16 }, () => ({ x: 0, y: 0 })), [])

  useEffect(() => {
    heroStore.invalidate = invalidate
    invalidate()
    return () => {
      heroStore.invalidate = null
    }
  }, [invalidate])

  useFrame((_, dt) => {
    const bs = boltStateAt(heroStore.p)
    const h = bs.h
    const dims = dimsAt(heroStore.p)

    // Bolt: height + rotation locked to height while engaged.
    bolt.current.position.y = bs.h
    bolt.current.rotation.y = bs.alpha

    // Fake contact shadow on the plate: tighter and darker as the bolt comes down.
    const k = Math.min(1, bs.h / (BOLT.L + BOLT.hover))
    boltShadow.current.scale.setScalar(BOLT.AF * 1.5 + k * 2.2)
    boltShadow.current.material.opacity = 0.75 - k * 0.55

    // Torque witness mark: painted in one stroke, head top -> flat -> plate.
    const m = dims.mark
    const seg = (a, b) => Math.min(1, Math.max(0, (m - a) / (b - a)))
    markHead.current.scale.z = Math.max(1e-3, seg(0, 0.5))
    markFlat.current.scale.y = Math.max(1e-3, seg(0.5, 0.7))
    markPlate.current.scale.z = Math.max(1e-3, seg(0.7, 1))
    markHead.current.visible = markFlat.current.visible = markPlate.current.visible = m > 0

    // Tilt (desktop only), critically damped toward the pointer target.
    let settling = false
    if (tilt) {
      const t = tiltNow.current
      const target = heroStore.pointer
      const f = 1 - Math.exp(-6 * Math.min(dt, 0.05))
      t.x += (target.x - t.x) * f
      t.y += (target.y - t.y) * f
      settling = Math.abs(target.x - t.x) + Math.abs(target.y - t.y) > 0.0015
      root.current.rotation.set(t.y * 5 * DEG, t.x * 6 * DEG, 0)
    }

    // Camera: orbit + fitted dolly. On wide canvases the subject sits right of centre
    // (film offset), leaving the left side to the copy.
    const { az, el } = bs.camera
    const azr = (az + (tilt ? tiltNow.current.x * 2 : 0)) * DEG
    const elr = el * DEG
    // The subject's extent (bolt top to plate bottom, plate width) is fitted into a box in
    // canvas pixels (heroStore.frame, measured by Hero.jsx from the layout: below the fixed
    // header + ruler, right of the copy on desktop). If the torque readout's box would cut
    // into it, the box is shrunk either above the readout or left of it, whichever keeps
    // the model larger. The view offset then puts the subject's centre in the box's centre.
    const W = size.width
    const H = size.height
    const top = h + BOLT.K + 0.25
    const bottom = Math.min(h - BOLT.L, -BOLT.plateT) - 0.2
    const extH = (top - bottom) * Math.cos(elr) + PLATE.d * Math.sin(elr)
    const extW = PLATE.w * Math.abs(Math.cos(azr)) + PLATE.d * Math.abs(Math.sin(azr))
    const aspect = W / H
    const F = heroStore.frame
    let box = F && F.x1 > F.x0 && F.y1 > F.y0 ? F : { x0: 0, y0: 0, x1: W, y1: H }
    const distFor = (b) => Math.max(extH / (2 * TAN_HALF_FOV * ((b.y1 - b.y0) / H)), extW / (2 * TAN_HALF_FOV * aspect * ((b.x1 - b.x0) / W))) * 1.06
    const A = F?.avoid
    if (A && A.x0 < box.x1 && A.x1 > box.x0 && A.y0 < box.y1 && A.y1 > box.y0) {
      const gap = 12
      const above = { ...box, y1: Math.max(box.y0 + 1, A.y0 - gap) }
      const left = { ...box, x1: Math.max(box.x0 + 1, A.x0 - gap) }
      box = distFor(above) <= distFor(left) ? above : left
    }
    const dist = distFor(box)
    const targetY = (top + bottom) / 2
    camera.position.set(Math.sin(azr) * Math.cos(elr) * dist, targetY + Math.sin(elr) * dist, Math.cos(azr) * Math.cos(elr) * dist)
    camera.lookAt(0, targetY, 0)
    camera.filmOffset = 0
    camera.setViewOffset(W, H, W / 2 - (box.x0 + box.x1) / 2, H / 2 - (box.y0 + box.y1) / 2, W, H)
    // Dev: the canvas-px rect the subject is fitted into (ext × the 1.06 margin, centred in
    // the box). scripts/render-posters.mjs captures exactly this rect as the poster image,
    // which Hero.jsx contain-fits into the same box: poster and live 3D line up.
    if (import.meta.env.DEV) {
      const k = 1 / (2 * TAN_HALF_FOV * dist)
      window.__heroFit = { cx: (box.x0 + box.x1) / 2, cy: (box.y0 + box.y1) / 2, w: extW * k * (W / aspect) * 1.06, h: extH * k * H * 1.06, p: heroStore.p }
    }
    camera.updateProjectionMatrix()
    camera.updateMatrixWorld()

    // Project dimension anchors to canvas pixels for the SVG overlay.
    right.setFromMatrixColumn(camera.matrixWorld, 0).setY(0).normalize()
    const proj = (i, x, y, z, side = 0) => {
      v.set(x, y, z)
      root.current.localToWorld(v)
      if (side) v.addScaledVector(right, side)
      v.project(camera)
      anchors[i].x = (v.x * 0.5 + 0.5) * size.width
      anchors[i].y = (-v.y * 0.5 + 0.5) * size.height
    }
    const R = BOLT.D / 2
    // 0,1: Ø across the hole mouth
    proj(0, 0, 0.01, 0, -(R + 0.03))
    proj(1, 0, 0.01, 0, R + 0.03)
    // 2,3: L from bearing face to tip, offset left; 4,5: the bolt points it measures
    const off = -(BOLT.AF / 2 + 0.55)
    proj(2, 0, h, 0, off)
    proj(3, 0, h - BOLT.L, 0, off)
    proj(4, 0, h, 0, -BOLT.AF / 2)
    proj(5, 0, h - BOLT.L, 0, -R)
    // 6: thread callout point (visible thread, right flank)
    // Pick the longer visible stretch of thread: above the plate, or protruding below it.
    const above = h - Math.max(h - BOLT.L, 0)
    const below = Math.max(0, -BOLT.plateT - (h - BOLT.L))
    const yT = above >= below ? h - above * 0.45 : -BOLT.plateT - below * 0.5
    proj(6, 0, yT, 0, R * 0.98)
    // 7,8: one pitch on the left flank
    proj(7, 0, yT + BOLT.P * 0.5, 0, -R)
    proj(8, 0, yT - BOLT.P * 0.5, 0, -R)
    // 9,10: across flats, just above the head
    proj(9, 0, h + BOLT.K + 0.06, 0, -BOLT.AF / 2)
    proj(10, 0, h + BOLT.K + 0.06, 0, BOLT.AF / 2)
    // 11: plate front-right corner (readout leader / framing)
    proj(11, PLATE.w / 2, 0, PLATE.d / 2)
    heroStore.anchors = anchors
    heroStore.onFrame?.(heroStore.p)

    if (first.current) {
      first.current = false
      heroStore.ready = true
      heroStore.onReady?.()
    }
    if (settling) invalidate()
  })

  const shadowTex = blobShadowTexture()
  const red = '#C8102E'
  const markW = 0.07

  return (
    <group ref={root}>
      <TappedPlate diameter={heroBolt.diameter} pitch={heroBolt.pitch} width={PLATE.w} depth={PLATE.d} thickness={BOLT.plateT} detail={heroStore.detail} />
      <Bolt ref={bolt} head={heroBolt.head} diameter={heroBolt.diameter} length={heroBolt.length} pitch={heroBolt.pitch} finish={heroBolt.finish} detail={heroStore.detail} />

      {/* Contact shadow of the bolt on the plate */}
      <mesh ref={boltShadow} rotation-x={-Math.PI / 2} position-y={0.004} renderOrder={1}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={shadowTex} transparent depthWrite={false} opacity={0.4} />
      </mesh>
      {/* Plate's own shadow on an implied floor */}
      <mesh rotation-x={-Math.PI / 2} position-y={-BOLT.plateT - 0.35} scale={[PLATE.w * 1.7, PLATE.d * 1.9, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={shadowTex} transparent depthWrite={false} opacity={0.55} />
      </mesh>

      {/* Torque witness mark, painted in one stroke. alpha = 0 when seated, so it lives in plate space.
          Each stroke is a group at its start point; the mesh is offset by half its length. */}
      <group ref={markHead} position={[0, BOLT.K + 0.003, 0]}>
        <mesh position-z={BOLT.AF / 4}>
          <boxGeometry args={[markW, 0.006, BOLT.AF / 2]} />
          <meshBasicMaterial color={red} />
        </mesh>
      </group>
      <group ref={markFlat} position={[0, BOLT.K + 0.003, BOLT.AF / 2 + 0.004]}>
        <mesh position-y={-BOLT.K / 2}>
          <boxGeometry args={[markW, BOLT.K, 0.006]} />
          <meshBasicMaterial color={red} />
        </mesh>
      </group>
      <group ref={markPlate} position={[0, 0.004, BOLT.AF / 2]}>
        <mesh position-z={0.25}>
          <boxGeometry args={[markW, 0.006, 0.5]} />
          <meshBasicMaterial color={red} />
        </mesh>
      </group>
    </group>
  )
}

function Lights({ lowEnd }) {
  return (
    <>
      <StudioEnvironment resolution={heroStore.detail === 'low' ? 64 : 128} intensity={0.95} warm />
      <ambientLight intensity={0.3} />
      <directionalLight position={[4, 9, 6]} intensity={1.2} />
      <directionalLight position={[-6, 3, -4]} intensity={0.3} />
    </>
  )
}

export default function HeroScene({ dpr, detail, tilt, lowEnd }) {
  heroStore.detail = detail
  const onCreated = useReleaseGL()
  return (
    <Canvas
      onCreated={onCreated}
      frameloop="demand"
      dpr={dpr}
      camera={{ fov: 30, near: 0.1, far: 80, position: [6, 5, 10] }}
      gl={{ antialias: glAntialias(), alpha: true, powerPreference: 'high-performance', stencil: false }}
      style={{ position: 'absolute', inset: 0 }}
      role="img"
      aria-label={content.hero.sceneLabel}
    >
      <Lights lowEnd={lowEnd} />
      <Rig tilt={tilt} />
    </Canvas>
  )
}

