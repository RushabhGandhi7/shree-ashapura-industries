// Scroll progress as a dimension line along the navbar's bottom edge: a red fill over a
// steel track, ruler ticks every 10 %, and a mono readout ("037 / 100") at the right end.
// Driven by Lenis' scroll event (one rAF loop with GSAP). Without Lenis (reduced motion:
// Lenis is never created) a passive window scroll listener is the only source.
import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router'
import { content } from '../../data/content.js'
import { useLenis } from '../../lib/smoothScroll.jsx'

const t = content.nav
const TICKS = Array.from({ length: 11 }, (_, i) => i)

/** Calls fn(scrollY, progress 0..1) on every scroll, on route change and on resize. */
export function useScrollProgress(fn) {
  const lenis = useLenis()
  const { pathname } = useLocation()
  const cb = useRef(fn)
  cb.current = fn

  useEffect(() => {
    const read = () => {
      if (lenis) return cb.current(lenis.scroll, lenis.limit > 0 ? lenis.progress : 0)
      const max = document.documentElement.scrollHeight - window.innerHeight
      cb.current(window.scrollY, max > 0 ? window.scrollY / max : 0)
    }
    read()
    let off
    if (lenis) off = lenis.on('scroll', read)
    else window.addEventListener('scroll', read, { passive: true })
    window.addEventListener('resize', read)
    // the new page lays out after the route change: read again once it has
    const raf = requestAnimationFrame(() => requestAnimationFrame(read))
    return () => {
      off?.()
      window.removeEventListener('scroll', read)
      window.removeEventListener('resize', read)
      cancelAnimationFrame(raf)
    }
  }, [lenis, pathname])
}

export default function NavProgress() {
  const fill = useRef(null)
  const readout = useRef(null)
  const last = useRef(-1)

  useScrollProgress((_, p) => {
    const v = Math.min(1, Math.max(0, p))
    if (fill.current) fill.current.style.transform = `scaleX(${v})`
    const n = Math.round(v * 100)
    if (n !== last.current && readout.current) {
      last.current = n
      readout.current.textContent = t.progress(n)
    }
  })

  // One fixed element right under the header (top: --header-h, which follows the header's
  // height as it condenses), above page content and below the header. Its box is --ruler-h
  // tall: the 1 px track (the header's bottom edge), ruler ticks hanging below it, and the
  // readout right-aligned under the track's end. Content clears it via --chrome-h.
  return (
    <div className="pointer-events-none fixed inset-x-0 top-[var(--header-h)] z-[var(--z-ruler)] h-[var(--ruler-h)]" aria-hidden>
      <div className="container-x">
        <div className="relative h-px bg-steel-300">
          <div ref={fill} className="absolute inset-0 origin-left bg-red" style={{ transform: 'scaleX(0)' }} />
          {TICKS.map((i) => (
            <span
              key={i}
              className={`absolute top-0 w-px bg-steel-500 ${i % 5 === 0 ? 'h-1.5' : 'h-1'}`}
              style={{ left: `${i * 10}%`, transform: i === 10 ? 'translateX(-1px)' : undefined }}
            />
          ))}
          <span
            ref={readout}
            className="label-mono absolute top-2 right-0 hidden rounded-xs bg-paper/90 px-1.5 py-px text-[11px] leading-[1.2] tabular-nums text-steel-700 sm:block"
          >
            {t.progress(0)}
          </span>
        </div>
      </div>
    </div>
  )
}
