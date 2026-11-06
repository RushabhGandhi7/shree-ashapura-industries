import { createContext, useContext, useEffect, useState } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { prefersReducedMotion } from './device.js'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const LenisContext = createContext(null)

/**
 * One Lenis instance, driven by GSAP's ticker (autoRaf: false), so there is a single
 * requestAnimationFrame loop for scroll and every GSAP / ScrollTrigger animation.
 * Under prefers-reduced-motion, Lenis is not created and native scrolling is used.
 */
export function SmoothScrollProvider({ children }) {
  const [lenis, setLenis] = useState(null)

  useEffect(() => {
    if (prefersReducedMotion()) return

    const instance = new Lenis({
      autoRaf: false,
      lerp: 0.1,
      wheelMultiplier: 1,
      anchors: false,
    })
    instance.on('scroll', ScrollTrigger.update)

    const update = (time) => instance.raf(time * 1000)
    gsap.ticker.add(update)
    gsap.ticker.lagSmoothing(0)

    if (document.documentElement.classList.contains('is-loading')) instance.stop()
    setLenis(instance)

    return () => {
      gsap.ticker.remove(update)
      instance.destroy()
      setLenis(null)
    }
  }, [])

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
}

export const useLenis = () => useContext(LenisContext)

/** Scroll to a section id (or element / number) using Lenis when available. */
export function scrollToTarget(lenis, target, opts = {}) {
  const el = typeof target === 'string' ? document.getElementById(target) : target
  if (lenis) {
    lenis.scrollTo(el ?? 0, { offset: 0, duration: 1.2, ...opts })
  } else if (el && typeof el !== 'number') {
    el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  } else {
    window.scrollTo({ top: typeof target === 'number' ? target : 0 })
  }
}
