// Lazy 3D layer for the category grid: ONE canvas, eight drei <View>s (gl.scissor).
// Each View is portalled into its card's slot element, so it tracks the card's box.
// The canvas covers the grid and scrolls with it, so nothing re-renders on scroll;
// frames are only drawn while a part is spinning or settling (frameloop="demand").
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera, View } from '@react-three/drei'
import { Fastener } from '../../three/Fastener.jsx'
import { CARD_FOV as FOV, fitDistance, measure } from '../../three/categoryFit.js'
import StudioEnvironment from '../../three/StudioEnvironment.jsx'
import { categories } from '../../data/products.js'
import { spinStore } from '../../lib/spinStore.js'

function CardScene({ c, quality, reduced }) {
  const inner = useRef(null)
  const st = useRef({ angle: 0, vel: 0 })
  const { invalidate } = useThree()
  const cam = useRef(null)
  const { c: center, radius, height } = useMemo(() => measure(c.parts), [c.parts])

  // Fit the spinning, tilted part into the 4:3 card (inside a View, size is the canvas).
  const dist = useMemo(() => fitDistance(c.pose.tilt, { radius, height }), [c.pose.tilt, height, radius])

  useLayoutEffect(() => {
    cam.current?.lookAt(0, 0, 0)
    invalidate()
  }, [dist, invalidate])

  useFrame((_, dt) => {
    const spinning = !reduced && spinStore.isSpinning(c.slug)
    const s = st.current
    const target = spinning ? 1.7 : 0
    s.vel += (target - s.vel) * (1 - Math.exp(-3.2 * Math.min(dt, 0.05)))
    if (Math.abs(s.vel) < 0.002 && !spinning) s.vel = 0
    s.angle += s.vel * Math.min(dt, 0.05)
    inner.current.rotation.y = s.angle
    if (spinning || s.vel !== 0) invalidate()
  })

  return (
    <>
      <PerspectiveCamera ref={cam} makeDefault fov={FOV} position={[0, dist * 0.16, dist]} near={0.05} far={dist * 4} />
      <StudioEnvironment resolution={64} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[3, 6, 5]} intensity={1} />
      <group rotation={c.pose.tilt}>
        <group ref={inner}>
          <group position={[-center.x, -center.y, -center.z]}>
            {c.parts.map((p, i) => (
              <Fastener key={i} {...p} detail="low" quality={quality} />
            ))}
          </group>
        </group>
      </group>
    </>
  )
}

function Bridge() {
  const { invalidate } = useThree()
  useEffect(() => {
    spinStore.invalidate = invalidate
    const onResize = () => invalidate()
    window.addEventListener('resize', onResize)
    document.fonts?.ready.then(() => invalidate())
    invalidate()
    return () => {
      spinStore.invalidate = null
      window.removeEventListener('resize', onResize)
    }
  }, [invalidate])
  return null
}

export default function ProductViews({ slots, dpr, quality, reduced }) {
  return (
    <>
      {categories.map((c) =>
        slots[c.slug]
          ? createPortal(
              <View className="pointer-events-none absolute inset-0">
                <CardScene c={c} quality={quality} reduced={reduced} />
              </View>,
              slots[c.slug],
              c.slug,
            )
          : null,
      )}
      <Canvas
        frameloop="demand"
        dpr={dpr}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
        aria-hidden
      >
        <Bridge />
        <View.Port />
      </Canvas>
    </>
  )
}
