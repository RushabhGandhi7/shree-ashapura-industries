import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { prefersReducedMotion } from '../../lib/device.js'

const ROT = { right: 0, down: 90, left: 180, up: 270 }

/** Filled engineering arrowhead (10×6) pointing in `dir`. */
const Arrow = ({ dir }) => (
  <svg viewBox="0 0 10 6" width="10" height="6" style={{ transform: `rotate(${ROT[dir]}deg)` }} aria-hidden focusable="false">
    <path d="M10 3 0 0v6Z" fill="currentColor" />
  </svg>
)

/**
 * Engineering dimension line that draws itself: extension ticks rise, the line grows
 * from the centre outward with arrowheads riding its ends, then the label appears.
 *
 * Props
 *  - length: CSS length of the measured span ("100%", "240px", "40vh")
 *  - orientation: 'horizontal' | 'vertical'
 *  - label: e.g. "L 40", "Ø12", "M8 × 1.25"
 *  - arrows / ticks: toggle arrowheads and extension ticks
 *  - delay, duration: timing in seconds
 *  - trigger: 'scroll' (play on entering viewport) | 'mount' | 'manual'
 *  - timelineRef: optional ref that receives the GSAP timeline (for 'manual' or scrubbing)
 *  - tone: 'steel' | 'red' | 'ink'
 */
export default function DimensionLine({
  length = '100%',
  orientation = 'horizontal',
  label,
  arrows = true,
  ticks = true,
  delay = 0,
  duration = 0.9,
  trigger = 'scroll',
  tone = 'steel',
  className = '',
  timelineRef,
}) {
  const root = useRef(null)
  const h = orientation === 'horizontal'
  const toneCls = { steel: 'text-steel-500', red: 'text-red', ink: 'text-ink' }[tone]

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const q = gsap.utils.selector(root)
      const half = () => (h ? root.current.offsetWidth : root.current.offsetHeight) / 2 - 5
      const travel = h ? 'x' : 'y'

      const tl = gsap.timeline({ paused: true, delay, defaults: { ease: 'expo.out' } })
      if (ticks) tl.from(q('[data-tick]'), { [h ? 'scaleY' : 'scaleX']: 0, duration: 0.35, ease: 'power2.out', stagger: 0.06 })
      tl.from(q('[data-line]'), { [h ? 'scaleX' : 'scaleY']: 0, duration }, ticks ? '-=0.1' : 0)
      if (arrows) {
        tl.from(q('[data-arrow-start]'), { [travel]: half, autoAlpha: 0, duration }, '<')
        tl.from(q('[data-arrow-end]'), { [travel]: () => -half(), autoAlpha: 0, duration }, '<')
      }
      if (label) tl.from(q('[data-label]'), { autoAlpha: 0, scale: 0.92, duration: 0.5, ease: 'power2.out' }, '-=0.5')

      if (trigger === 'mount') tl.play()
      if (trigger === 'scroll') {
        ScrollTrigger.create({ trigger: root.current, start: 'top 88%', once: true, onEnter: () => tl.play() })
      }
      if (timelineRef) timelineRef.current = tl
    },
    { scope: root },
  )

  return (
    <div
      ref={root}
      className={`relative shrink-0 ${h ? 'h-6' : 'w-6'} ${toneCls} ${className}`}
      style={h ? { width: length } : { height: length }}
      role={label ? 'img' : undefined}
      aria-label={label ? `Dimension ${label}` : undefined}
      aria-hidden={label ? undefined : true}
    >
      {ticks && (
        <>
          <span data-tick className={`absolute bg-current opacity-70 ${h ? 'inset-y-0 left-0 w-px origin-bottom' : 'inset-x-0 top-0 h-px origin-left'}`} />
          <span data-tick className={`absolute bg-current opacity-70 ${h ? 'inset-y-0 right-0 w-px origin-bottom' : 'inset-x-0 bottom-0 h-px origin-left'}`} />
        </>
      )}

      <span
        data-line
        className={`absolute bg-current ${h ? 'top-1/2 left-0 h-px w-full origin-center' : 'top-0 left-1/2 h-full w-px origin-center'}`}
      />

      {arrows && (
        <>
          <span data-arrow-start className={`absolute flex ${h ? 'top-1/2 left-0 -translate-y-1/2' : 'top-0 left-1/2 -translate-x-1/2'}`}>
            <Arrow dir={h ? 'left' : 'up'} />
          </span>
          <span data-arrow-end className={`absolute flex ${h ? 'top-1/2 right-0 -translate-y-1/2' : 'bottom-0 left-1/2 -translate-x-1/2'}`}>
            <Arrow dir={h ? 'right' : 'down'} />
          </span>
        </>
      )}

      {label && (
        <span
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${h ? 'w-max max-w-[calc(100%-2.5rem)] text-center' : ''}`}
        >
          <span
            data-label
            className={`label-mono block bg-paper px-1.5 py-0.5 ${tone === 'steel' ? 'text-steel-700' : ''} ${
              h ? 'text-balance' : 'whitespace-nowrap [writing-mode:vertical-rl] rotate-180 px-0.5 py-1.5'
            }`}
          >
            {label}
          </span>
        </span>
      )}
    </div>
  )
}
