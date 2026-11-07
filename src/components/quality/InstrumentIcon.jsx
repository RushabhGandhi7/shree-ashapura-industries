// Line icons for the inspection instruments (48 × 48, currentColor + red accent).
const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }
const R = { ...S, stroke: 'var(--color-red)' }

export default function InstrumentIcon({ kind, className = 'size-11' }) {
  return (
    <svg viewBox="0 0 48 48" className={`shrink-0 text-ink ${className}`} aria-hidden>
      {kind === 'vernier' && (
        <>
          <path d="M6 14 H42 V20 H6 Z" {...S} />
          <path d="M10 20 V36 L14 32 V20 M30 20 V36 L26 32 V20" {...S} />
          <path d="M12 14 V17 M18 14 V16 M24 14 V17 M30 14 V16 M36 14 V17" {...R} />
        </>
      )}
      {kind === 'micrometer' && (
        <>
          <path d="M10 12 C4 20 4 30 12 36 H22" {...S} />
          <path d="M10 12 V22 M16 22 H22" {...S} />
          <rect x="22" y="19" width="10" height="6" {...S} />
          <rect x="32" y="17" width="10" height="10" rx="1" {...R} />
          <path d="M35 17 V27 M38 17 V27" {...R} />
        </>
      )}
      {kind === 'ring' && (
        <>
          <circle cx="24" cy="24" r="15" {...S} />
          <circle cx="24" cy="24" r="7" {...R} />
          <path d="M24 9 v4 M24 35 v4 M9 24 h4 M35 24 h4" {...S} />
        </>
      )}
      {kind === 'plug' && (
        <>
          <path d="M6 21 H14 V27 H6 Z M34 21 H42 V27 H34 Z" {...S} />
          <path d="M14 22.5 H34 V25.5 H14 Z" {...S} />
          <path d="M7 21 l2 6 M10 21 l2 6 M35 21 l2 6 M38 21 l2 6" {...R} />
          <text x="10" y="17" textAnchor="middle" fontSize="6" fill="currentColor" className="font-mono">GO</text>
          <text x="38" y="17" textAnchor="middle" fontSize="6" fill="var(--color-red)" className="font-mono">NG</text>
        </>
      )}
      {kind === 'hardness' && (
        <>
          <path d="M12 40 H36 M16 40 V8 H32 V14" {...S} />
          <path d="M28 14 H36 V22 H28 Z" {...S} />
          <path d="M32 22 V28 L30 31 H34 L32 28" {...R} />
          <path d="M26 34 H38" {...S} />
        </>
      )}
      {kind === 'jig' && (
        <>
          <rect x="8" y="26" width="32" height="12" rx="1" {...S} />
          <path d="M14 26 V18 H20 V26 M28 26 V18 H34 V26" {...S} />
          <circle cx="24" cy="22" r="3" {...R} />
          <path d="M17 18 V12 M31 18 V12" {...S} />
        </>
      )}
      {kind === 'report' && (
        <>
          <path d="M12 6 H30 L36 12 V42 H12 Z" {...S} />
          <path d="M30 6 V12 H36" {...S} />
          <path d="M17 20 H31 M17 26 H31 M17 32 H25" {...S} strokeOpacity=".55" />
          <path d="M26 35 l3 3 l6 -7" {...R} strokeWidth="2" />
        </>
      )}
    </svg>
  )
}
