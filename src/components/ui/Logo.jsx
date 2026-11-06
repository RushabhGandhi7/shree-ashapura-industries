// PLACEHOLDER logo: red triangular "SA" mark + wordmark. Swap for the client's file later.
export default function Logo({ compact = false, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <svg viewBox="0 0 48 44" className="h-9 w-auto shrink-0" aria-hidden focusable="false">
        <path d="M24 1.5 46.5 42.5h-45Z" fill="var(--color-red)" />
        <path d="M24 9.5 39.6 38H8.4Z" fill="none" stroke="var(--color-paper)" strokeOpacity=".35" strokeWidth=".75" />
        <text
          x="24"
          y="35.5"
          textAnchor="middle"
          fill="var(--color-paper)"
          style={{ font: '800 14px var(--font-display)', fontStretch: '125%', letterSpacing: '-0.02em' }}
        >
          SA
        </text>
      </svg>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-[0.95rem] font-[780] tracking-[-0.01em] [font-stretch:120%]">
            SHREE ASHAPURA
          </span>
          <span className="label-mono mt-1 text-[0.6rem] text-steel-700">Industries · Mumbai</span>
        </span>
      )}
    </span>
  )
}
