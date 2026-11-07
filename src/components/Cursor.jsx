import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useMediaQuery, useReducedMotion } from '../hooks/useReducedMotion.js'

const INTERACTIVE = 'a[href], button, [role="button"], input, textarea, select, label, summary, [data-cursor]'

// Hexagon with flat sides left/right, like a nut seen from above.
const HEX = (() => {
  const r = 15
  const pts = []
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i
    pts.push(`${(16 + r * Math.cos(a)).toFixed(2)},${(16 + r * Math.sin(a)).toFixed(2)}`)
  }
  return pts.join(' ')
})()

function HexCursor() {
  const outer = useRef(null)
  const nut = useRef(null)

  useEffect(() => {
    const el = outer.current
    const n = nut.current
    document.documentElement.classList.add('has-hex-cursor')

    gsap.set(el, { xPercent: -50, yPercent: -50, autoAlpha: 0 })
    const xTo = gsap.quickTo(el, 'x', { duration: 0.35, ease: 'power3.out' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.35, ease: 'power3.out' })
    const rotTo = gsap.quickTo(n, 'rotation', { duration: 0.6, ease: 'power3.out' })

    let rot = 0
    let lastX = null
    let visible = false
    let hovering = false

    const move = (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return
      if (!visible) {
        gsap.set(el, { x: e.clientX, y: e.clientY })
        gsap.to(el, { autoAlpha: 1, duration: 0.2 })
        visible = true
      }
      xTo(e.clientX)
      yTo(e.clientY)
      // Moving right tightens the nut, moving left loosens it.
      if (lastX !== null) rot += (e.clientX - lastX) * 0.6
      lastX = e.clientX
      rotTo(rot + (hovering ? 30 : 0))
    }
    const over = (e) => {
      const hit = e.target.closest?.(INTERACTIVE)
      if (!!hit === hovering) return
      hovering = !!hit
      el.dataset.hover = hovering ? 'true' : 'false'
      gsap.to(n, { scale: hovering ? 1.9 : 1, duration: 0.45, ease: 'expo.out' })
      rotTo(rot + (hovering ? 30 : 0))
    }
    const down = () => gsap.to(n, { scale: hovering ? 1.6 : 0.8, duration: 0.15 })
    const up = () => gsap.to(n, { scale: hovering ? 1.9 : 1, duration: 0.35, ease: 'back.out(3)' })
    const leave = () => {
      gsap.to(el, { autoAlpha: 0, duration: 0.2 })
      visible = false
      lastX = null
    }

    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerover', over, { passive: true })
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    document.documentElement.addEventListener('pointerleave', leave)
    return () => {
      document.documentElement.classList.remove('has-hex-cursor')
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerover', over)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      document.documentElement.removeEventListener('pointerleave', leave)
      gsap.killTweensOf([el, n])
    }
  }, [])

  return (
    <div ref={outer} className="group pointer-events-none fixed top-0 left-0 z-[100]" data-hover="false" data-transient aria-hidden>
      <svg ref={nut} width="32" height="32" viewBox="0 0 32 32" className="block overflow-visible">
        <polygon
          points={HEX}
          className="fill-paper/40 stroke-ink transition-[fill,stroke] duration-300 group-data-[hover=true]:fill-red/10 group-data-[hover=true]:stroke-red"
          strokeWidth="1.25"
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
        />
        <circle
          cx="16"
          cy="16"
          r="6"
          className="fill-none stroke-ink transition-[stroke] duration-300 group-data-[hover=true]:stroke-red"
          strokeWidth="1.25"
          vectorEffect="non-scaling-stroke"
          strokeDasharray="2.2 1.6"
        />
        <circle cx="16" cy="16" r="1.4" className="fill-red" />
      </svg>
    </div>
  )
}

/** Desktop-only (fine pointer + hover). Not mounted on touch or under reduced motion. */
export default function Cursor() {
  const fine = useMediaQuery('(hover: hover) and (pointer: fine)')
  const reduced = useReducedMotion()
  if (!fine || reduced) return null
  return <HexCursor />
}
