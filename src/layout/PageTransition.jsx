// Route transitions: the leaving page fades out (keeping its own frozen element), the
// window jumps to the top, then the new page fades in. LazyMotion keeps Framer's initial
// cost small (the animation features load async).
import { useState } from 'react'
import { useLocation, useOutlet } from 'react-router'
import { AnimatePresence, LazyMotion, m } from 'framer-motion'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLenis } from '../lib/smoothScroll.jsx'
import { prefersReducedMotion } from '../lib/device.js'
import RouteLifecycle from './RouteLifecycle.jsx'

const features = () => import('./motion-features.js').then((r) => r.default)

/** Keeps the outlet element it first rendered, so the exiting page does not swap content mid-fade. */
function Frozen() {
  const outlet = useOutlet()
  const [el] = useState(outlet)
  return el
}

export default function PageTransition() {
  const { pathname } = useLocation()
  const lenis = useLenis()
  const reduced = prefersReducedMotion()
  const d = reduced ? 0 : 1
  return (
    <LazyMotion features={features} strict>
      <AnimatePresence
        mode="wait"
        initial={false}
        onExitComplete={() => {
          if (lenis) lenis.scrollTo(0, { immediate: true, force: true })
          else window.scrollTo(0, 0)
          ScrollTrigger.clearScrollMemory?.()
        }}
      >
        <m.div
          key={pathname}
          // opacity only: a transform on this wrapper would break position:fixed pins inside it
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.22 * d, ease: [0.16, 1, 0.3, 1] } }}
          exit={{ opacity: 0, transition: { duration: 0.16 * d } }}
        >
          <Frozen />
          <RouteLifecycle />
        </m.div>
      </AnimatePresence>
    </LazyMotion>
  )
}
