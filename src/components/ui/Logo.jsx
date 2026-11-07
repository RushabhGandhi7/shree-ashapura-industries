import { MARK } from './logoMark.js'

/**
 * Brand lockup: the client's "SA" mark (public/brand/sa-logo.svg) + wordmark.
 * The mark is ink (currentColor) with the dot in the brand red.
 */
export default function Logo({ compact = false, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2.5 sm:gap-3 ${className}`}>
      <svg viewBox={MARK.viewBox} className="h-7 w-auto shrink-0 text-ink min-[380px]:h-8 sm:h-9" aria-hidden focusable="false">
        <path d={MARK.d} fill="currentColor" />
        <circle cx={MARK.dot.cx} cy={MARK.dot.cy} r={MARK.dot.r} fill="var(--color-red)" />
      </svg>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-[0.85rem] font-[780] min-[380px]:text-[0.95rem] tracking-[-0.01em] whitespace-nowrap [font-stretch:120%]">
            SHREE ASHAPURA
          </span>
          <span className="label-mono mt-1 text-[0.6rem] text-steel-700">Industries · Mumbai</span>
        </span>
      )}
    </span>
  )
}
