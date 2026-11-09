// Route transitions: the leaving page fades out (keeping its own frozen element), the
// window jumps to the top, then the new page fades in. Same sequence and timings as the
// former Framer AnimatePresence (mode "wait", initial={false}), done with the Web Animations
// API so Framer stays out of the first-load JS (it only loads with the mobile menu / caliper).
import { useLayoutEffect, useRef, useState } from 'react'
import { useLocation, useOutlet } from 'react-router'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLenis } from '../lib/smoothScroll.jsx'
import { prefersReducedMotion } from '../lib/device.js'
import RouteLifecycle from './RouteLifecycle.jsx'

const EASE_IN = 'cubic-bezier(0.16, 1, 0.3, 1)'
const OUT_MS = 160
const IN_MS = 220

export default function PageTransition() {
  const { pathname } = useLocation()
  const outlet = useOutlet()
  const lenis = useLenis()
  const wrap = useRef(null)
  // the page on screen: its key and the element it was rendered with (frozen while leaving)
  const [page, setPage] = useState(() => ({ key: pathname, el: outlet, enter: false }))
  const latest = useRef(outlet)
  latest.current = outlet

  // pathname changed: fade the old page out, jump to the top, swap in the new page
  useLayoutEffect(() => {
    if (pathname === page.key) return
    const d = prefersReducedMotion() ? 0 : 1
    let cancelled = false
    const swap = () => {
      if (cancelled) return
      if (lenis) lenis.scrollTo(0, { immediate: true, force: true })
      else window.scrollTo(0, 0)
      ScrollTrigger.clearScrollMemory?.()
      setPage({ key: pathname, el: latest.current, enter: true })
    }
    const node = wrap.current
    if (!node || !d) {
      swap()
      return () => (cancelled = true)
    }
    // start from the current opacity (a fade-in may still be running)
    const from = getComputedStyle(node).opacity
    node.getAnimations().forEach((a) => a.cancel())
    const out = node.animate([{ opacity: from }, { opacity: 0 }], { duration: OUT_MS, easing: 'ease-out', fill: 'forwards' })
    out.onfinish = swap
    return () => {
      cancelled = true
      out.onfinish = null
    }
  }, [pathname, page.key, lenis])

  // a newly swapped-in page fades in
  useLayoutEffect(() => {
    const node = wrap.current
    if (!node) return
    node.getAnimations().forEach((a) => a.cancel())
    if (!page.enter || prefersReducedMotion()) return
    node.animate([{ opacity: 0 }, { opacity: 1 }], { duration: IN_MS, easing: EASE_IN })
  }, [page])

  return (
    // opacity only: a transform on this wrapper would break position:fixed pins inside it
    <div ref={wrap} key={page.key}>
      {page.el}
      <RouteLifecycle />
    </div>
  )
}
