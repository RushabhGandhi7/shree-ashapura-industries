import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { prefersReducedMotion } from '../../lib/device.js'
import { gearPath } from './gear.js'

const BIG = gearPath(16, 22, 18.5, 5)
const SMALL = gearPath(10, 14, 10.5, 3.5)

/**
 * Section divider: two meshing gears on a centre line, turning as the divider scrolls
 * past (the small gear turns 1.6x faster, the opposite way, as a mesh would).
 */
export default function GearDivider({ tone = 'paper' }) {
  const root = useRef(null)
  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const [a, b] = gsap.utils.toArray('[data-gear]', root.current)
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 0.6 } })
      tl.fromTo(a, { rotation: 0 }, { rotation: 140, ease: 'none', svgOrigin: '0 0' }, 0)
      tl.fromTo(b, { rotation: 11 }, { rotation: 11 - 140 * 1.6, ease: 'none', svgOrigin: '0 0' }, 0)
    },
    { scope: root },
  )
  return (
    <div ref={root} className={`relative h-16 ${tone === 'paper-2' ? 'bg-paper-2' : 'bg-paper'}`} aria-hidden>
      <div className="container-x relative flex h-full items-center">
        <span className="h-px flex-1 bg-steel-300" />
        <svg viewBox="-30 -30 96 60" className="mx-4 h-12 w-auto text-steel-500" fill="none">
          <g transform="translate(0 0)">
            <path data-gear d={BIG} stroke="currentColor" strokeWidth="1.2" fill="var(--color-paper)" />
          </g>
          <g transform="translate(36.5 0)">
            <path data-gear d={SMALL} stroke="var(--color-red)" strokeWidth="1.2" fill="var(--color-paper)" />
          </g>
          <circle cx="0" cy="0" r="1.6" fill="currentColor" />
          <circle cx="36.5" cy="0" r="1.2" fill="var(--color-red)" />
        </svg>
        <span className="h-px flex-1 bg-steel-300" />
      </div>
    </div>
  )
}
