// Lazy 3D for the exploded view: bolt + washer + nut from the shared part library.
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Bolt, Nut, Washer } from '../../three/Fastener.jsx'
import StudioEnvironment from '../../three/StudioEnvironment.jsx'
import { EXPLODED, explodedAt, explodedStore } from '../../lib/explodedStore.js'

const FOV = 24
const TAN = Math.tan(((FOV / 2) * Math.PI) / 180)
const DEG = Math.PI / 180
const v = new THREE.Vector3()
const right = new THREE.Vector3()

function Rig({ detail, onReady }) {
  const bolt = useRef(null)
  const washer = useRef(null)
  const nut = useRef(null)
  const first = useRef(true)
  const { camera, size, invalidate } = useThree()
  const anchors = useMemo(() => ({}), [])

  useEffect(() => {
    explodedStore.invalidate = invalidate
    invalidate()
    return () => (explodedStore.invalidate = null)
  }, [invalidate])

  useFrame(() => {
    const p = explodedStore.p
    const { yB, yW, yN, alpha } = explodedAt(p)
    const { L, R, S, K, WT, WR, NM } = EXPLODED
    bolt.current.position.y = yB
    washer.current.position.y = yW
    nut.current.position.y = yN
    nut.current.rotation.y = alpha

    // camera: fixed 3/4 view, dolly fitted to the assembly as it grows
    const az = 30 * DEG
    const el = 9 * DEG
    const top = yB + K + 0.35
    const bottom = yN - 0.5
    const aspect = size.width / size.height
    const h = top - bottom
    const w = 2 * WR + (size.width < 560 ? 1.4 : 2.6) // room for callouts
    const dist = Math.max(h / (2 * TAN), w / (2 * TAN * aspect)) * 1.08
    const ty = (top + bottom) / 2
    camera.position.set(Math.sin(az) * Math.cos(el) * dist, ty + Math.sin(el) * dist, Math.cos(az) * Math.cos(el) * dist)
    camera.lookAt(0, ty, 0)
    camera.updateMatrixWorld()

    // project named anchors to canvas pixels
    right.setFromMatrixColumn(camera.matrixWorld, 0).setY(0).normalize()
    const put = (name, y, side = 0) => {
      v.set(0, y, 0).addScaledVector(right, side).project(camera)
      const o = (anchors[name] ??= { x: 0, y: 0 })
      o.x = (v.x * 0.5 + 0.5) * size.width
      o.y = (-v.y * 0.5 + 0.5) * size.height
    }
    const off = -(S / 2 + 0.45)
    put('lenA', yB, off)
    put('lenB', yB - L, off)
    put('lenEA', yB, -S / 2)
    put('lenEB', yB - L, -R)
    const yD = yB - L * 0.48
    put('diaA', yD, -R)
    put('diaB', yD, R)
    put('thr', yB - L * 0.2, R * 0.96)
    put('boltName', yB + K * 0.5, S / 2)
    const yWd = yW - 0.24
    put('wA', yWd, -WR)
    put('wB', yWd, WR)
    put('wEA', yW, -WR)
    put('wEB', yW, WR)
    put('washerName', yW + WT / 2, WR)
    const yNd = yN - 0.36
    put('nA', yNd, -S / 2)
    put('nB', yNd, S / 2)
    put('nEA', yN, -S / 2)
    put('nEB', yN, S / 2)
    put('nutName', yN + NM * 0.5, S / 2)
    const offN = -(S / 2 + 0.4)
    put('nhA', yN + NM, offN)
    put('nhB', yN, offN)
    put('nhEA', yN + NM, -S / 2)
    put('nhEB', yN, -S / 2)
    explodedStore.anchors = anchors
    explodedStore.onFrame?.(p)

    if (first.current) {
      first.current = false
      onReady?.()
    }
  })

  const { spec } = EXPLODED
  return (
    <>
      <Bolt ref={bolt} head="hex" {...spec} finish="zinc" detail={detail} />
      <Washer ref={washer} head="flat" diameter={spec.diameter} finish="stainless" detail={detail} />
      <Nut ref={nut} head="hex" diameter={spec.diameter} pitch={spec.pitch} finish="zinc" detail={detail} />
    </>
  )
}

export default function ExplodedScene({ dpr, detail, onReady }) {
  return (
    <Canvas
      frameloop="demand"
      dpr={dpr}
      camera={{ fov: FOV, near: 0.1, far: 80, position: [4, 1, 9] }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ position: 'absolute', inset: 0 }}
      aria-hidden
    >
      <StudioEnvironment resolution={detail === 'low' ? 64 : 128} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[4, 8, 6]} intensity={1.1} />
      <Rig detail={detail} onReady={onReady} />
    </Canvas>
  )
}
