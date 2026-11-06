import { useEffect } from 'react'
import gsap from 'gsap'
import { hasFinePointer, prefersReducedMotion } from '../lib/device.js'

/**
 * Magnetic hover: the element eases toward the pointer, and its inner label
 * ([data-magnetic-inner]) moves a little further for depth.
 * Disabled on touch devices and under reduced motion.
 */
export function useMagnetic(ref, { enabled = true, strength = 10, innerStrength = 16 } = {}) {
  useEffect(() => {
    const el = ref.current
    if (!enabled || !el || !hasFinePointer() || prefersReducedMotion()) return

    const inner = el.querySelector('[data-magnetic-inner]')
    const cfg = { duration: 0.5, ease: 'power3.out' }
    const xTo = gsap.quickTo(el, 'x', cfg)
    const yTo = gsap.quickTo(el, 'y', cfg)
    const ixTo = inner && gsap.quickTo(inner, 'x', cfg)
    const iyTo = inner && gsap.quickTo(inner, 'y', cfg)

    const move = (e) => {
      const r = el.getBoundingClientRect()
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2)
      const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2)
      xTo(dx * strength)
      yTo(dy * strength)
      ixTo?.(dx * innerStrength * 0.5)
      iyTo?.(dy * innerStrength * 0.5)
    }
    const leave = () => {
      const back = { duration: 0.7, ease: 'elastic.out(1, 0.45)' }
      gsap.to(el, { x: 0, y: 0, ...back })
      if (inner) gsap.to(inner, { x: 0, y: 0, ...back })
    }

    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
      gsap.killTweensOf([el, inner].filter(Boolean))
    }
  }, [ref, enabled, strength, innerStrength])
}
