// WebGL gate: at most one live WebGL canvas per page (phones run out of GPU memory and
// Safari caps the number of contexts). Every 3D section registers with useGLGate(); the
// section with the most pixels on screen (within `margin` viewports) owns the gate, with
// hysteresis so it does not flap. Handoff is two-phase: the owner is cleared, the old
// canvas unmounts and releases (useGLHold cleanup), then the new owner is granted.
// With one registered section this is simply "mount when near, unmount when far".
import { useEffect, useLayoutEffect, useRef, useState } from 'react'

const entries = new Map() // id -> { el, margin, set, near, visible }
const holding = new Set()
let owner = null
let want = null
let raf = 0

function notify() {
  entries.forEach((e, id) => e.set(owner === id))
}

function apply() {
  if (want === owner) return
  if (owner !== null) {
    owner = null
    notify()
  }
  if (holding.size === 0) {
    owner = want
    notify()
  }
}

// No section gets the gate before the page has loaded and the main thread has gone idle once:
// three / R3F / drei (~280 KB gzip) then load and evaluate after first paint and the first
// React commit, not during them. Until then each section shows its static poster.
let ready = false
if (typeof window !== 'undefined') {
  const idle = window.requestIdleCallback ?? ((fn) => setTimeout(fn, 200))
  const open = () =>
    idle(
      () => {
        ready = true
        schedule()
      },
      { timeout: 1500 },
    )
  if (document.readyState === 'complete') open()
  else window.addEventListener('load', open, { once: true })
}

function measure() {
  raf = 0
  if (!ready) return
  const vh = window.innerHeight || 1
  let best = null
  entries.forEach((e, id) => {
    const r = e.el.getBoundingClientRect()
    e.near = r.bottom > -e.margin * vh && r.top < vh + e.margin * vh
    e.visible = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0))
    if (e.near && (!best || e.visible > entries.get(best).visible)) best = id
  })
  const cur = owner ?? want
  const keep = cur !== null && entries.get(cur)?.near && (!best || entries.get(best).visible <= entries.get(cur).visible + vh * 0.1)
  want = keep ? cur : best
  apply()
}

const schedule = () => (raf ||= requestAnimationFrame(measure))

if (typeof window !== 'undefined') {
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', schedule)
}

/** Register a 3D section. Returns true while it may hold a live canvas. */
export function useGLGate(id, ref, { margin = 1, enabled = true } = {}) {
  const [allowed, setAllowed] = useState(false)
  useEffect(() => {
    if (!enabled || !ref.current) return
    entries.set(id, { el: ref.current, margin, set: setAllowed, near: false, visible: 0 })
    schedule()
    return () => {
      entries.delete(id)
      if (want === id) want = null
      if (owner === id) owner = null
      setAllowed(false)
      schedule()
    }
  }, [id, ref, margin, enabled])
  return allowed
}

/** Mark that this section's canvas is mounted (call with the same flag that mounts it). */
export function useGLHold(id, live) {
  useLayoutEffect(() => {
    if (!live) return
    holding.add(id)
    return () => {
      holding.delete(id)
      // let the release commit finish before the next owner mounts
      queueMicrotask(apply)
    }
  }, [id, live])
}

/**
 * Release the WebGL context as soon as the canvas unmounts (R3F's own dispose waits
 * ~500 ms, which would briefly overlap two contexts during a handoff).
 * Usage: const onCreated = useReleaseGL(); <Canvas onCreated={onCreated} />
 */
export function useReleaseGL() {
  const gl = useRef(null)
  const alive = useRef(false)
  useLayoutEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
      const renderer = gl.current
      // a microtask later: StrictMode's simulated unmount remounts synchronously, a real
      // unmount does not. Runs before the gate grants the next owner (also a microtask).
      queueMicrotask(() => {
        if (alive.current || !renderer) return
        const ctx = renderer.getContext()
        if (!ctx.isContextLost()) ctx.getExtension('WEBGL_lose_context')?.loseContext()
        renderer.forceContextLoss = () => {} // R3F's delayed dispose would lose it again (console error)
        gl.current = null
      })
    }
  }, [])
  return (state) => {
    gl.current = state.gl
  }
}

/** Dev / QA: current owner. */
export const glGateState = () => ({ owner, want, holding: [...holding], entries: [...entries.keys()] })
