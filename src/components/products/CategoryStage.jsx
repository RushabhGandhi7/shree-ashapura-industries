// Lazy 3D stage for a category page: the category's parts, posed like its card, turning
// slowly. Renders only while on screen; R3F releases the WebGL context on unmount.
import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import { Fastener } from '../../three/Fastener.jsx'
import StudioEnvironment from '../../three/StudioEnvironment.jsx'
import TickerLoop from '../../three/TickerLoop.jsx'
import { CARD_FOV, fitDistance, measure } from '../../three/categoryFit.js'
import { glAntialias } from '../../lib/device.js'
import { useReleaseGL } from '../../lib/glGate.js'

function Scene({ category, detail, onReady }) {
  const spin = useRef(null)
  const fit = useMemo(() => measure(category.parts, detail), [category, detail])
  // same fit as the product card and its poster image (categoryFit default margin), so the
  // poster -> live swap is a pure crossfade
  const dist = useMemo(() => fitDistance(category.pose.tilt, fit), [category, fit])
  const cam = useRef(null)
  const first = useRef(true)
  useFrame((_, dt) => {
    if (spin.current) spin.current.rotation.y += Math.min(dt, 0.05) * 0.45
    if (first.current) ((first.current = false), onReady?.())
  })
  useEffect(() => cam.current?.lookAt(0, 0, 0), [dist])
  return (
    <>
      <PerspectiveCamera ref={cam} makeDefault fov={CARD_FOV} position={[0, dist * 0.16, dist]} near={0.05} far={dist * 4} />
      <StudioEnvironment resolution={detail === 'low' ? 64 : 128} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[3, 6, 5]} intensity={1} />
      <group rotation={category.pose.tilt}>
        <group ref={spin}>
          <group position={[-fit.c.x, -fit.c.y, -fit.c.z]}>
            {category.parts.map((p, i) => (
              <Fastener key={i} {...p} detail={detail} quality={detail} />
            ))}
          </group>
        </group>
      </group>
    </>
  )
}

export default function CategoryStage({ category, detail, dpr, onReady }) {
  const box = useRef(null)
  const onCreated = useReleaseGL()
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting))
    io.observe(box.current)
    return () => io.disconnect()
  }, [])
  return (
    <div ref={box} className="absolute inset-0">
      <Canvas onCreated={onCreated} frameloop="never" dpr={dpr} gl={{ antialias: glAntialias(), alpha: true, powerPreference: 'high-performance' }} aria-hidden>
        <Scene category={category} detail={detail} onReady={onReady} />
        {/* idle spin while on screen, rendered from gsap.ticker */}
        <TickerLoop running={visible} />
      </Canvas>
    </div>
  )
}
