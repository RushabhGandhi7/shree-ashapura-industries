// Runs when a page has mounted (inside the keyed transition wrapper):
//  - ScrollTrigger.refresh() once layout and fonts have settled
//  - scroll to a #hash target if the URL has one
//  - window.__pageReady = pathname (the prerender script waits for it)
//  - dev only: records ScrollTriggers / pin spacers / live WebGL contexts per route on the
//    first visit and warns if a later visit differs (a leak). window.__routeBaseline.
import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { scrollToTarget, useLenis } from '../lib/smoothScroll.jsx'

export const liveCounts = () => ({
  triggers: ScrollTrigger.getAll().length,
  pins: document.querySelectorAll('.pin-spacer').length,
  gl: window.__glContexts ?? 0,
  canvases: document.querySelectorAll('canvas').length,
})

export default function RouteLifecycle() {
  const { pathname, hash } = useLocation()
  const lenis = useLenis()

  useEffect(() => {
    let cancelled = false
    let timer
    const raf2 = (f) => requestAnimationFrame(() => requestAnimationFrame(f))
    raf2(() => {
      if (cancelled) return
      ScrollTrigger.refresh()
      if (hash) scrollToTarget(lenis, hash.slice(1), { immediate: true })
      window.__pageReady = pathname
      document.fonts?.ready.then(() => !cancelled && ScrollTrigger.refresh())
    })
    if (import.meta.env.DEV) {
      // Measure after lazy sections / 3D chunks have had time to mount.
      timer = setTimeout(() => {
        const b = (window.__routeBaseline ??= {})
        const now = liveCounts()
        if (!b[pathname]) b[pathname] = now
        else if (b[pathname].triggers !== now.triggers || b[pathname].pins !== now.pins || b[pathname].gl !== now.gl)
          console.warn(`[route-leak] ${pathname}: first visit ${JSON.stringify(b[pathname])}, now ${JSON.stringify(now)}`)
      }, 2500)
    }
    return () => {
      cancelled = true
      clearTimeout(timer)
      if (window.__pageReady === pathname) window.__pageReady = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return null
}
