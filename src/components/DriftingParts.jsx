import { useId, useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { prefersReducedMotion } from '../lib/device.js'

// Simple fastener silhouettes on a 100×100 box.
const SHAPES = {
  nut: (
    <>
      <polygon points="50,6 88,28 88,72 50,94 12,72 12,28" />
      <circle cx="50" cy="50" r="19" fill="var(--color-paper)" />
    </>
  ),
  washer: (
    <>
      <circle cx="50" cy="50" r="44" />
      <circle cx="50" cy="50" r="18" fill="var(--color-paper)" />
    </>
  ),
  bolt: (
    <>
      <rect x="28" y="4" width="44" height="20" rx="2" />
      <rect x="40" y="24" width="20" height="72" />
    </>
  ),
  screw: (
    <>
      <path d="M22 6 h56 a6 6 0 0 1 0 12 H22 a6 6 0 0 1 0 -12Z" />
      <path d="M42 18 h16 v58 L50 96 L42 76Z" />
    </>
  ),
}

// PLACEHOLDER layout: [shape, left %, top %, size px, depth 0..1, blur px, rotation deg]
const LAYOUT = [
  ['nut', 6, 14, 90, 0.9, 6, 12],
  ['washer', 84, 8, 120, 0.5, 10, 0],
  ['bolt', 72, 62, 110, 0.75, 7, -28],
  ['screw', 18, 70, 80, 0.35, 12, 40],
  ['nut', 46, 86, 64, 0.6, 9, -10],
  ['washer', 30, 30, 52, 0.25, 14, 0],
  ['bolt', 92, 40, 70, 0.4, 12, 64],
  ['screw', 58, 18, 58, 0.3, 13, -52],
  ['nut', 2, 48, 46, 0.2, 15, 30],
]

/**
 * Background layer of out-of-focus fastener silhouettes. Blur is baked into each SVG
 * (rasterised once), so only cheap transforms animate: a slow CSS drift on the inner
 * element and depth-based scroll parallax on the outer one.
 */
export default function DriftingParts({ count = LAYOUT.length, scrollTrigger, className = '' }) {
  const root = useRef(null)
  const uid = useId().replace(/:/g, '')

  useGSAP(
    () => {
      if (!scrollTrigger || prefersReducedMotion()) return
      // `trigger` may be a ref, an element, or omitted. A parent's ref is not attached yet
      // when this child effect runs, so fall back to the enclosing <section>.
      const tr = scrollTrigger.trigger
      const trig = (tr && typeof tr === 'object' && 'current' in tr ? tr.current : tr) ?? root.current.closest('section')
      gsap.utils.toArray('[data-depth]', root.current).forEach((el) => {
        const depth = Number(el.dataset.depth)
        gsap.to(el, { yPercent: -depth * 220, ease: 'none', scrollTrigger: { ...scrollTrigger, trigger: trig, scrub: true } })
      })
    },
    { scope: root, dependencies: [count] },
  )

  return (
    <div ref={root} className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      {LAYOUT.slice(0, count).map(([shape, x, y, size, depth, blur, rot], i) => (
        <div
          key={i}
          data-depth={depth}
          className="absolute will-change-transform"
          style={{ left: `${x}%`, top: `${y}%`, width: size, height: size }}
        >
          <div
            className="sa-drift h-full w-full"
            style={{ '--dur': `${14 + i * 2.3}s`, '--delay': `${-i * 3.1}s`, '--rot': `${rot}deg` }}
          >
            <svg viewBox="-30 -30 160 160" className="h-full w-full overflow-visible" style={{ opacity: 0.18 + depth * 0.2 }}>
              <defs>
                <filter id={`${uid}-b${i}`} x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation={blur / 2} />
                </filter>
              </defs>
              <g filter={`url(#${uid}-b${i})`} fill="var(--color-steel-500)" transform={`rotate(${rot} 50 50)`}>
                {SHAPES[shape]}
              </g>
            </svg>
          </div>
        </div>
      ))}
    </div>
  )
}
