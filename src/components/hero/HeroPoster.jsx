/**
 * Lightweight SVG stand-in for the 3D scene (shown while the canvas loads, and kept
 * if WebGL is unavailable). `seated` draws the final state for reduced motion.
 */
export default function HeroPoster({ seated = false, className = '' }) {
  // Bolt geometry in poster space (rough 3/4 view)
  const cx = 300
  const plateTop = seated ? 470 : 520
  const boltBottom = seated ? plateTop + 4 : plateTop - 90
  const shaftTop = seated ? plateTop - 6 : boltBottom - 260
  const r = 26
  const threads = []
  for (let y = shaftTop + 8; y < boltBottom - 10; y += 11) {
    threads.push(<path key={y} d={`M${cx - r} ${y + 4} L${cx + r} ${y - 4}`} />)
  }
  return (
    <svg viewBox="0 0 600 720" className={className} role="img" aria-label="Steel bolt above a tapped steel plate">
      <defs>
        <linearGradient id="hp-steel" x1="0" x2="1">
          <stop offset="0" stopColor="#8E9092" />
          <stop offset="0.35" stopColor="#E6E6E3" />
          <stop offset="0.6" stopColor="#B4B5B4" />
          <stop offset="1" stopColor="#6E7073" />
        </linearGradient>
        <linearGradient id="hp-plate" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#D9DAD8" />
          <stop offset="1" stopColor="#B5B7B8" />
        </linearGradient>
        <radialGradient id="hp-shadow">
          <stop offset="0" stopColor="#1C1D1F" stopOpacity=".28" />
          <stop offset="1" stopColor="#1C1D1F" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* floor shadow */}
      <ellipse cx={cx} cy={plateTop + 120} rx="270" ry="56" fill="url(#hp-shadow)" />
      {/* plate: top face + front faces */}
      <path d={`M${cx - 250} ${plateTop + 30} L${cx + 40} ${plateTop - 60} L${cx + 260} ${plateTop + 10} L${cx - 30} ${plateTop + 100} Z`} fill="url(#hp-plate)" />
      <path d={`M${cx - 250} ${plateTop + 30} L${cx - 30} ${plateTop + 100} L${cx - 30} ${plateTop + 132} L${cx - 250} ${plateTop + 62} Z`} fill="#8F9193" />
      <path d={`M${cx - 30} ${plateTop + 100} L${cx + 260} ${plateTop + 10} L${cx + 260} ${plateTop + 42} L${cx - 30} ${plateTop + 132} Z`} fill="#A3A5A6" />
      {/* hole */}
      <ellipse cx={cx} cy={plateTop + 20} rx="34" ry="14" fill="#5F6164" />
      {/* bolt shaft */}
      <rect x={cx - r} y={shaftTop} width={r * 2} height={Math.max(0, boltBottom - shaftTop)} fill="url(#hp-steel)" />
      <g stroke="#55575A" strokeOpacity=".45" strokeWidth="2">{threads}</g>
      {/* hex head */}
      <path
        d={`M${cx - 52} ${shaftTop - 66} L${cx - 26} ${shaftTop - 80} L${cx + 26} ${shaftTop - 80} L${cx + 52} ${shaftTop - 66} L${cx + 52} ${shaftTop} L${cx - 52} ${shaftTop} Z`}
        fill="url(#hp-steel)"
      />
      <path d={`M${cx - 18} ${shaftTop - 74} L${cx - 18} ${shaftTop}`} stroke="#ffffff" strokeOpacity=".35" strokeWidth="2" />
      <path d={`M${cx + 26} ${shaftTop - 72} L${cx + 26} ${shaftTop}`} stroke="#55575A" strokeOpacity=".3" strokeWidth="2" />
    </svg>
  )
}
