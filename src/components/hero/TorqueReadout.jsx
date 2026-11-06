import { forwardRef, useImperativeHandle, useRef } from 'react'
import { boltStateAt } from '../../lib/heroStore.js'
import { content } from '../../data/content.js'

const t = content.hero.readout
const TICKS = 20

/**
 * Small instrument readout driven by scroll progress. update(p) writes straight to the DOM.
 */
const TorqueReadout = forwardRef(function TorqueReadout({ className = '', compact = false }, ref) {
  const torque = useRef(null)
  const turns = useRef(null)
  const phase = useRef(null)
  const bar = useRef(null)
  const root = useRef(null)
  const last = useRef('')

  useImperativeHandle(ref, () => ({
    update(p) {
      const s = boltStateAt(p)
      torque.current.textContent = s.torque.toFixed(1).padStart(4, '0')
      turns.current.textContent = s.turns.toFixed(1).padStart(4, '0')
      if (bar.current) bar.current.style.transform = `scaleX(${Math.min(1, s.torque / 79)})`
      if (s.phase !== last.current) {
        last.current = s.phase
        phase.current.textContent = t.phases[s.phase]
        root.current.dataset.phase = s.phase
      }
    },
  }))

  const dot = (
    <span className="size-1.5 shrink-0 rounded-full bg-steel-500 group-data-[phase=seated]/ro:bg-red group-data-[phase=seat]/ro:bg-red group-data-[phase=thread]/ro:animate-pulse group-data-[phase=thread]/ro:bg-red" />
  )

  if (compact) {
    // One-line strip for phones, sits above the canvas instead of over it.
    return (
      <div
        ref={root}
        data-phase="align"
        className={`group/ro flex items-center justify-between gap-3 border-y border-steel-300 bg-paper/85 py-2 font-mono text-[0.7rem] tracking-[0.08em] uppercase backdrop-blur-sm ${className}`}
        role="img"
        aria-label={t.aria}
      >
        <span className="inline-flex items-center gap-1.5 text-steel-700 group-data-[phase=seated]/ro:text-red">
          {dot}
          <span ref={phase}>{t.phases.align}</span>
        </span>
        <span className="text-steel-500">
          {t.turns} <span ref={turns} className="text-ink tabular-nums">00.0</span>
        </span>
        <span className="text-ink tabular-nums group-data-[phase=seated]/ro:text-red">
          <span ref={torque} className="text-[0.85rem] font-medium">00.0</span> N·m
        </span>
      </div>
    )
  }

  return (
    <div
      ref={root}
      data-phase="align"
      className={`group/ro w-[13.5rem] rounded-xs border border-steel-300 bg-paper/85 p-3 backdrop-blur-sm sm:w-[15.5rem] sm:p-4 ${className}`}
      role="img"
      aria-label={t.aria}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="label-mono text-steel-500">{t.torque}</span>
        <span className="label-mono inline-flex items-center gap-1.5 text-steel-700 group-data-[phase=seated]/ro:text-red">
          {dot}
          <span ref={phase}>{t.phases.align}</span>
        </span>
      </div>
      <p className="mt-1.5 flex items-baseline gap-1.5 font-mono text-ink tabular-nums group-data-[phase=seated]/ro:text-red">
        <span ref={torque} className="text-[1.75rem] leading-none font-medium tracking-[-0.03em] sm:text-[2.1rem]">
          00.0
        </span>
        <span className="text-small text-steel-700">N·m</span>
      </p>
      <div className="relative mt-3 h-2.5" aria-hidden>
        <div className="absolute inset-x-0 bottom-0 flex justify-between">
          {Array.from({ length: TICKS + 1 }, (_, i) => (
            <span key={i} className={`w-px bg-steel-300 ${i % 5 === 0 ? 'h-2.5' : 'h-1.5'}`} />
          ))}
        </div>
        <div ref={bar} className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-red" />
      </div>
      <div className="mt-2.5 flex justify-between label-mono text-steel-500">
        <span>
          {t.turns} <span ref={turns} className="text-ink tabular-nums">00.0</span>
        </span>
        <span>{t.spec}</span>
      </div>
    </div>
  )
})

export default TorqueReadout
