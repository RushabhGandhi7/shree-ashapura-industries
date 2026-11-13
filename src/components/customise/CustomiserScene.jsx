// Lazy 3D stage for the customiser. The part morphs between configurations:
//   size   -> the new part starts at the old part's scale and grows / shrinks into place
//   length -> the new part starts stretched to the old length and settles
//   head / pitch -> quick edge-on turn: the old part closes to a sliver, the new one opens
//   finish -> colour / metalness / roughness blend on dedicated materials
// Rendering runs only while the stage is on screen (frameloop "never" otherwise).
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Bolt, buildPart } from '../../three/Fastener.jsx'
import StudioEnvironment from '../../three/StudioEnvironment.jsx'
import TickerLoop from '../../three/TickerLoop.jsx'
import { createTweenMaterial, finishParams, setTweenTargets } from '../../three/materials.js'
import { blobShadowTexture } from '../../three/lib/shadow.js'
import { glAntialias } from '../../lib/device.js'
import { useReleaseGL } from '../../lib/glGate.js'

const FOV = 26
const TAN = Math.tan(((FOV / 2) * Math.PI) / 180)
const ROLES = ['main', 'dark', 'knurl']
const v = new THREE.Vector3()
const right = new THREE.Vector3()

const geomKey = (o) => `${o.head}|${o.diameter}|${o.length}|${o.pitch}`

function bounds(o, detail) {
  const { geos } = buildPart({ type: 'bolt', head: o.head, diameter: o.diameter, length: o.length, pitch: o.pitch, detail })
  const box = new THREE.Box3()
  Object.values(geos).forEach((g) => box.union(g.boundingBox))
  return box
}

function Stage({ opts, detail, reduced, dragTarget, store, onReady }) {
  const quality = detail === 'low' ? 'low' : 'high'
  const { camera, size, invalidate } = useThree()
  const [shown, setShown] = useState(opts)
  const shownRef = useRef(opts)
  const fx = useRef({ s: 1, sy: 1, sxz: 1 })
  const tl = useRef(null)
  const spin = useRef({ angle: 0.5, vel: 0, drag: false, lastX: 0 })
  const tilt = useRef(null)
  const part = useRef(null)
  const shadow = useRef(null)
  const first = useRef(true)
  const fit = useRef({ dist: 0, cy: 0, init: false })
  const anchors = useMemo(() => ({}), [])

  // dedicated, blendable materials (one set for this stage)
  const mats = useMemo(() => Object.fromEntries(ROLES.map((r) => [r, createTweenMaterial(opts.finish, r, quality)])), []) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats])

  // finish blend
  useEffect(() => {
    const hi = quality === 'high'
    const tweens = ROLES.map((r) => {
      const { color, values } = setTweenTargets(mats[r], finishParams(opts.finish, r), hi)
      const dur = reduced ? 0 : 0.55
      return [
        gsap.to(mats[r].color, { ...color, duration: dur, ease: 'power2.out', onUpdate: invalidate }),
        gsap.to(mats[r], { ...values, duration: dur, ease: 'power2.out', onUpdate: invalidate }),
      ]
    })
    return () => tweens.flat().forEach((tw) => tw.kill())
  }, [opts.finish, mats, quality, reduced, invalidate])

  // geometry morphs
  useEffect(() => {
    const prev = shownRef.current
    if (geomKey(prev) === geomKey(opts)) return
    tl.current?.kill()
    const f = fx.current
    const commit = () => {
      shownRef.current = opts
      setShown(opts)
    }
    if (reduced) {
      Object.assign(f, { s: 1, sy: 1, sxz: 1 })
      commit()
      invalidate()
      return
    }
    const done = { onUpdate: invalidate }
    if (prev.head !== opts.head || prev.pitch !== opts.pitch) {
      tl.current = gsap
        .timeline(done)
        .to(f, { sxz: 0.04, s: 1, sy: 1, duration: 0.2, ease: 'power2.in', onUpdate: invalidate, onComplete: commit })
        .to(f, { sxz: 1, duration: 0.5, ease: 'back.out(1.6)', onUpdate: invalidate })
    } else {
      // same family: start the new part at the old proportions and let it settle
      f.s = prev.diameter / opts.diameter
      f.sy = Math.min(1.6, Math.max(0.6, ((prev.length / opts.length) * opts.diameter) / prev.diameter))
      f.sxz = 1
      commit()
      tl.current = gsap.to(f, { s: 1, sy: 1, duration: 0.6, ease: 'expo.out', onUpdate: invalidate })
    }
  }, [opts, reduced, invalidate])

  // drag to turn (pointer on the stage element)
  useEffect(() => {
    const el = dragTarget.current
    const st = spin.current
    const down = (e) => {
      st.drag = true
      st.lastX = e.clientX
      el.setPointerCapture?.(e.pointerId)
    }
    const move = (e) => {
      if (!st.drag) return
      const dx = e.clientX - st.lastX
      st.lastX = e.clientX
      st.angle += dx * 0.012
      st.vel = dx * 0.6
      invalidate()
    }
    const up = () => (st.drag = false)
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    return () => {
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
    }
  }, [dragTarget, invalidate])

  const box = useMemo(() => bounds(shown, detail), [shown, detail])

  useLayoutEffect(() => invalidate(), [shown, invalidate])

  useFrame((_, dt) => {
    dt = Math.min(dt, 0.05)
    const st = spin.current
    const f = fx.current
    // idle turn + drag inertia
    if (!st.drag) {
      st.vel *= Math.exp(-4 * dt)
      st.angle += (st.vel * dt) / 10 + (reduced ? 0 : 0.28 * dt)
    }
    part.current.rotation.y = st.angle
    part.current.scale.set(f.s * f.sxz, f.s * f.sy, f.s * f.sxz)

    // centre the part vertically and fit the camera (damped)
    const h = box.max.y - box.min.y
    const w = Math.max(box.max.x - box.min.x, box.max.z - box.min.z)
    const cy = (box.max.y + box.min.y) / 2
    tilt.current.position.y = -cy
    const aspect = size.width / size.height
    const want = Math.max((h * 1.25) / (2 * TAN), (w * 2.6) / (2 * TAN * aspect))
    const F = fit.current
    if (!F.init) {
      F.dist = want
      F.init = true
    }
    F.dist += (want - F.dist) * (1 - Math.exp(-5 * dt))
    camera.position.set(F.dist * 0.42, F.dist * 0.16, F.dist * 0.9)
    // Dev: the canvas-px rect the camera fits (part + callout room), centred; captured by
    // scripts/render-posters.mjs as the poster, which Customiser contain-fits into the canvas box.
    if (import.meta.env.DEV) {
      const k = 1 / (2 * TAN * F.dist)
      window.__customFit = { cx: size.width / 2, cy: size.height / 2, w: ((w * 2.6) / aspect) * k * size.width, h: h * 1.25 * k * size.height, angle: st.angle }
    }
    camera.lookAt(0, 0, 0)
    camera.updateMatrixWorld()

    // shadow under the part
    shadow.current.position.y = box.min.y - cy - 0.12
    shadow.current.scale.setScalar(Math.max(w * 2.2, 1.4))

    // dimension anchors
    tilt.current.updateMatrixWorld()
    right.setFromMatrixColumn(camera.matrixWorld, 0).setY(0).normalize()
    const R = shown.diameter / 20
    const L = shown.length / 10
    const put = (name, y, side) => {
      v.set(0, y * f.s * f.sy, 0)
      tilt.current.localToWorld(v)
      v.addScaledVector(right, side * f.s * f.sxz).project(camera)
      const o = (anchors[name] ??= { x: 0, y: 0 })
      o.x = (v.x * 0.5 + 0.5) * size.width
      o.y = (-v.y * 0.5 + 0.5) * size.height
    }
    const off = -(w / 2 + 0.35)
    put('lA', 0, off)
    put('lB', -L, off)
    put('lEA', 0, -w / 2)
    put('lEB', -L, -R)
    put('dA', -L * 0.58, -R)
    put('dB', -L * 0.58, R)
    put('thr', -L * 0.84, R * 0.96) // near the tip: always on the thread
    store.anchors = anchors
    store.onFrame?.(1)

    if (first.current) {
      first.current = false
      onReady?.()
    }
    if (st.vel !== 0 && Math.abs(st.vel) > 0.01) invalidate()
    if (Math.abs(want - F.dist) > 0.002) invalidate()
  })

  return (
    <group ref={tilt}>
      <group ref={part}>
        <Bolt head={shown.head} diameter={shown.diameter} length={shown.length} pitch={shown.pitch} detail={detail} materialFor={(r) => mats[r] ?? mats.main} />
      </group>
      <mesh ref={shadow} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={blobShadowTexture()} transparent depthWrite={false} opacity={0.5} />
      </mesh>
    </group>
  )
}

export default function CustomiserScene({ opts, detail, dpr, reduced, active, dragTarget, store, onReady }) {
  const onCreated = useReleaseGL()
  return (
    <Canvas
      onCreated={onCreated}
      // 'demand' when off-screen (not 'never'): the first frame renders at mount, a screen
      // early, so shaders compile before the stage scrolls into view. On screen, the idle
      // spin renders every gsap tick (TickerLoop), not from R3F's own rAF loop.
      frameloop={active && !reduced ? 'never' : 'demand'}
      dpr={dpr}
      camera={{ fov: FOV, near: 0.05, far: 100, position: [3, 1, 8] }}
      gl={{ antialias: glAntialias(), alpha: true, powerPreference: 'high-performance' }}
      style={{ position: 'absolute', inset: 0 }}
      aria-hidden
    >
      <StudioEnvironment resolution={detail === 'low' ? 64 : 128} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[4, 8, 6]} intensity={1.1} />
      <Stage opts={opts} detail={detail} reduced={reduced} dragTarget={dragTarget} store={store} onReady={onReady} />
      <TickerLoop running={active && !reduced} />
    </Canvas>
  )
}
