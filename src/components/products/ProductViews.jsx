// Lazy 3D layer for a card grid: ONE canvas, one drei <View> per 3D card (gl.scissor).
// `entries` = [{ key, parts, pose }]: the category cards (ProductGrid) or the catalogue
// items with a 3D model on a category page (ItemGrid).
// Each View is portalled into its card's slot element, so it tracks the card's box.
//
// The canvas is position:absolute over the grid, so the browser scrolls the canvas and
// the cards together. drei places a view at (slot rect − canvas rect); R3F only
// re-measures the canvas rect 50 ms after scrolling stops, so any frame drawn mid-scroll
// used a stale offset and the models drifted (Phase 8C). SyncCanvasRect writes the live
// canvas rect into the store each frame, before the views render, so both rects come
// from the same moment and cannot disagree.
//
// Rendering runs on GSAP's ticker (the same tick that drives Lenis), only when something
// changed (a spin, a scroll, a resize) and only while the grid is on screen.
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { createPortal } from 'react-dom'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera, View } from '@react-three/drei'
import { Fastener } from '../../three/Fastener.jsx'
import { CARD_FOV as FOV, fitDistance, measure } from '../../three/categoryFit.js'
import StudioEnvironment from '../../three/StudioEnvironment.jsx'
import { spinStore } from '../../lib/spinStore.js'
import { useLenis } from '../../lib/smoothScroll.jsx'
import { glAntialias, maxDpr } from '../../lib/device.js'
import { useReleaseGL } from '../../lib/glGate.js'

// one render request flag, shared by the DOM side and the canvas
const loop = { dirty: true, onScreen: true }
const requestRender = () => (loop.dirty = true)

function CardScene({ c, quality, reduced, visible }) {
  const inner = useRef(null)
  const st = useRef({ angle: 0, vel: 0 })
  const cam = useRef(null)
  const { c: center, radius, height } = useMemo(() => measure(c.parts), [c.parts])
  const key = c.key

  // Fit the spinning, tilted part into the 4:3 card (inside a View, size is the canvas).
  const dist = useMemo(() => fitDistance(c.pose.tilt, { radius, height }), [c.pose.tilt, height, radius])

  useLayoutEffect(() => {
    cam.current?.lookAt(0, 0, 0)
    requestRender()
  }, [dist])

  useFrame((_, dt) => {
    const spinning = !reduced && spinStore.isSpinning(key)
    const s = st.current
    const target = spinning ? 1.7 : 0
    s.vel += (target - s.vel) * (1 - Math.exp(-3.2 * Math.min(dt, 0.05)))
    if (Math.abs(s.vel) < 0.002 && !spinning) s.vel = 0
    s.angle += s.vel * Math.min(dt, 0.05)
    inner.current.rotation.y = s.angle
    if (spinning || s.vel !== 0) requestRender()
    if (visible) spinStore.markReady(key) // drawn this frame: the card can drop its poster
  })

  return (
    <>
      <PerspectiveCamera ref={cam} makeDefault fov={FOV} position={[0, dist * 0.16, dist]} near={0.05} far={dist * 4} />
      <StudioEnvironment resolution={quality === 'low' ? 64 : 256} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[3, 6, 5]} intensity={1} />
      <group rotation={c.pose.tilt}>
        <group ref={inner}>
          <group position={[-center.x, -center.y, -center.z]}>
            {c.parts.map((p, i) => (
              <Fastener key={i} {...p} detail={quality} quality={quality} />
            ))}
          </group>
        </group>
      </group>
    </>
  )
}

/**
 * Canvas rect into the store, before any View renders (priority −1). drei places each View
 * at (slot rect − canvas rect); the canvas scrolls with the page, so its viewport position
 * changes every scroll frame (8C: R3F's own re-measure lags by 50 ms -> drift in Safari).
 * Its position in the DOCUMENT only changes with layout, so it is measured on resize, on
 * layout changes (ResizeObserver on the canvas and the body, ScrollTrigger refresh = pin
 * spacers) and after fonts load, and each frame derives the viewport position from the
 * scroll offset. TickerBridge runs on gsap.ticker after Lenis has applied this tick's
 * scroll, so rects and render use the same scroll position.
 */
function SyncCanvasRect() {
  const gl = useThree((s) => s.gl)
  const doc = useRef({ top: 0, left: 0 })
  useEffect(() => {
    const el = gl.domElement
    const measure = () => {
      const r = el.getBoundingClientRect()
      doc.current = { top: r.top + window.scrollY, left: r.left + window.scrollX }
      requestRender()
    }
    measure()
    // measure() only reads layout, so these observers cannot feed back into a resize loop
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    ro.observe(document.body)
    window.addEventListener('resize', measure)
    ScrollTrigger.addEventListener('refresh', measure)
    let alive = true
    document.fonts?.ready.then(() => alive && measure())
    return () => {
      alive = false
      ro.disconnect()
      window.removeEventListener('resize', measure)
      ScrollTrigger.removeEventListener('refresh', measure)
    }
  }, [gl])
  useFrame((state) => {
    state.size.top = doc.current.top - window.scrollY
    state.size.left = doc.current.left - window.scrollX
  }, -1)
  return null
}

/** Drives R3F from gsap.ticker: advance() only when dirty and the grid is on screen. */
function TickerBridge() {
  const advance = useThree((s) => s.advance)
  useEffect(() => {
    spinStore.invalidate = requestRender
    const tick = () => {
      if (!loop.dirty || !loop.onScreen) return
      loop.dirty = false
      advance(performance.now())
    }
    gsap.ticker.add(tick)
    window.addEventListener('resize', requestRender)
    document.fonts?.ready.then(requestRender)
    requestRender()
    return () => {
      gsap.ticker.remove(tick)
      spinStore.invalidate = null
      window.removeEventListener('resize', requestRender)
    }
  }, [advance])
  return null
}

const MAX_BUFFER = 4096 // keep the drawing buffer inside WebGL's usual size limit (Safari clamps above it)

export default function ProductViews({ entries, slots, container, touch, quality, reduced }) {
  const lenis = useLenis()
  const onCreated = useReleaseGL()
  useEffect(() => () => spinStore.resetReady(), []) // canvas gone: posters back
  const [dpr, setDpr] = useState(1)
  const [onScreen, setOnScreen] = useState({})

  // DPR: the screen's own up to 2 (lib/device maxDpr), clamped so neither buffer side
  // exceeds MAX_BUFFER. Only re-set when the value changes (no resize feedback loop).
  useEffect(() => {
    const el = container.current
    const ro = new ResizeObserver(() => {
      const cap = maxDpr()
      const fit = MAX_BUFFER / Math.max(el.offsetHeight, el.offsetWidth, 1)
      setDpr(Math.max(0.75, Math.min(cap, fit)))
      requestRender()
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [container, touch])

  // Whole canvas: pause while the grid is off screen. Each view: render only near the viewport.
  useEffect(() => {
    const grid = new IntersectionObserver(([e]) => {
      loop.onScreen = e.isIntersecting
      if (e.isIntersecting) requestRender()
    })
    grid.observe(container.current)
    const cards = new IntersectionObserver(
      (entries) => {
        setOnScreen((m) => {
          const n = { ...m }
          entries.forEach((e) => (n[e.target.dataset.slug] = e.isIntersecting))
          return n
        })
        requestRender()
      },
      { rootMargin: '120px 0px' },
    )
    Object.entries(slots).forEach(([slug, el]) => {
      el.dataset.slug = slug
      cards.observe(el)
    })
    return () => (grid.disconnect(), cards.disconnect())
  }, [container, slots])

  // Scrolling moves canvas and cards together; re-render so the views stay in sync anyway.
  useEffect(() => {
    if (!lenis) {
      window.addEventListener('scroll', requestRender, { passive: true })
      return () => window.removeEventListener('scroll', requestRender)
    }
    lenis.on('scroll', requestRender)
    return () => lenis.off('scroll', requestRender)
  }, [lenis])

  return (
    <>
      {entries.map((c) =>
        slots[c.key]
          ? createPortal(
              <View className="pointer-events-none absolute inset-0" visible={onScreen[c.key] !== false}>
                <CardScene c={c} quality={quality} reduced={reduced} visible={onScreen[c.key] !== false} />
              </View>,
              slots[c.key],
              c.key,
            )
          : null,
      )}
      <Canvas
        frameloop="never"
        onCreated={onCreated}
        dpr={dpr}
        eventSource={container.current}
        gl={{ antialias: glAntialias(), alpha: true, powerPreference: 'high-performance' }}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
        aria-hidden
      >
        <SyncCanvasRect />
        <TickerBridge />
        <View.Port />
      </Canvas>
    </>
  )
}
