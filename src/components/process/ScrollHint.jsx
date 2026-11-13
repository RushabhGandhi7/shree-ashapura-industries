// Small chip over the pinned side-scroll (phase 12C): "Scroll up / down to continue" with
// animated chevrons. Visibility is driven imperatively by Process.jsx (show / hide) so it
// costs no React renders during scroll. Not rendered at all under reduced motion.
import { forwardRef, useImperativeHandle, useRef } from 'react'
import { content } from '../../data/content.js'

const t = content.process

const ScrollHint = forwardRef(function ScrollHint(_, ref) {
  const el = useRef(null)
  useImperativeHandle(ref, () => ({
    show() {
      if (el.current) el.current.dataset.on = 'true'
    },
    hide() {
      if (el.current) el.current.dataset.on = 'false'
    },
    get visible() {
      return el.current?.dataset.on === 'true'
    },
  }))
  return (
    <div
      ref={el}
      data-on="false"
      data-scroll-hint
      role="status"
      aria-live="polite"
      className="scroll-hint pointer-events-none absolute top-[calc(var(--chrome-h)+0.75rem)] right-[var(--gutter)] z-20"
    >
      <span className="label-mono flex items-center gap-2.5 rounded-xs border border-steel-300 bg-paper/92 px-3 py-2 text-[11px] text-ink shadow-[0_6px_18px_-12px_rgb(28_29_31/0.45)]">
        <span className="scroll-hint-arrows flex flex-col text-red" aria-hidden>
          <svg viewBox="0 0 10 6" className="h-1.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M1 5l4-4 4 4" />
          </svg>
          <svg viewBox="0 0 10 6" className="h-1.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M1 1l4 4 4-4" />
          </svg>
        </span>
        {t.hint}
        {/* touch devices: the section also follows a sideways swipe */}
        <span className="scroll-hint-swipe hidden items-center gap-0.5 text-red [@media(hover:none)]:flex" aria-hidden>
          <svg viewBox="0 0 6 10" className="h-2.5 w-1.5" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M5 1L1 5l4 4" />
          </svg>
          <svg viewBox="0 0 6 10" className="h-2.5 w-1.5" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M1 1l4 4-4 4" />
          </svg>
        </span>
      </span>
    </div>
  )
})

export default ScrollHint
