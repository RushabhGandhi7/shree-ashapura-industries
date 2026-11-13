// Types of heads and drives (phase 12D): line drawings only (no canvas). Each card shows a
// side view and a top view; the top view turns on hover / focus (CSS, motion-safe only).
// Shapes in the client's catalogue carry an "In catalogue" chip linking to the item card.
import { Link } from 'react-router'
import { content } from '../../data/content.js'
import SectionHead from '../ui/SectionHead.jsx'

const t = content.products.heads
const INK = 'var(--color-ink)'
const STEEL = 'var(--color-steel-500)'
const RED = 'var(--color-red)'
const S = { fill: 'var(--color-steel-100)', stroke: INK, strokeWidth: 1.3, strokeLinejoin: 'round' }

const hexPts = (cx, cy, r, rot = 0) =>
  Array.from({ length: 6 }, (_, i) => {
    const a = rot + (i * Math.PI) / 3
    return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`
  }).join(' ')

// shank stub under every side view (thread hatching)
const Shank = ({ w = 20 }) => (
  <>
    <rect x={60 - w / 2} y="40" width={w} height="36" fill="none" stroke={INK} strokeWidth="1.3" />
    {[46, 52, 58, 64, 70].map((y) => (
      <line key={y} x1={60 - w / 2} y1={y + 3} x2={60 + w / 2} y2={y} stroke={STEEL} strokeWidth="0.8" />
    ))}
  </>
)

const SIDE = {
  hex: (
    <>
      <rect x="34" y="16" width="52" height="24" {...S} />
      <path d="M47 16v24M73 16v24" stroke={INK} strokeWidth="1" />
      <Shank />
    </>
  ),
  pan: (
    <>
      <path d="M32 40V32Q32 18 60 18T88 32V40Z" {...S} />
      <Shank />
    </>
  ),
  countersunk: (
    <>
      <path d="M28 16h64l-22 24H50Z" {...S} />
      <Shank />
    </>
  ),
  cheese: (
    <>
      <path d="M40 40V18q0-4 4-4h32q4 0 4 4v22Z" {...S} />
      <Shank />
    </>
  ),
  button: (
    <>
      <path d="M30 40Q30 20 60 20T90 40Z" {...S} />
      <Shank />
    </>
  ),
  flange: (
    <>
      <rect x="42" y="14" width="36" height="20" {...S} />
      <path d="M52 14v20M68 14v20" stroke={INK} strokeWidth="1" />
      <path d="M26 40v-3l16-3h36l16 3v3Z" {...S} />
      <Shank />
    </>
  ),
  truss: (
    <>
      <path d="M22 34Q24 16 60 16T98 34Z" {...S} />
      <rect x="49" y="34" width="22" height="10" {...S} />
      <Shank />
    </>
  ),
  socket: (
    <>
      <path d="M40 40V16q0-4 4-4h32q4 0 4 4v24Z" {...S} />
      <path d="M53 12v8h14v-8" stroke={STEEL} strokeWidth="0.9" fill="none" />
      <Shank />
    </>
  ),
}

const slot = (r) => <rect x={40 - r} y="37.5" width={2 * r} height="5" fill={RED} />
const cross = (r) => <path d={`M${40 - r} 40h${2 * r}M40 ${40 - r}v${2 * r}`} stroke={RED} strokeWidth="4" strokeLinecap="round" />
const hexSocket = (r) => <polygon points={hexPts(40, 40, r)} fill={RED} />

const TOP = {
  hex: (
    <>
      <polygon points={hexPts(40, 40, 30)} {...S} />
      <circle cx="40" cy="40" r="25" fill="none" stroke={STEEL} strokeWidth="0.8" />
    </>
  ),
  pan: (
    <>
      <circle cx="40" cy="40" r="30" {...S} />
      {cross(12)}
    </>
  ),
  countersunk: (
    <>
      <circle cx="40" cy="40" r="32" {...S} />
      {slot(24)}
    </>
  ),
  cheese: (
    <>
      <circle cx="40" cy="40" r="22" {...S} />
      {slot(18)}
    </>
  ),
  button: (
    <>
      <circle cx="40" cy="40" r="29" {...S} />
      {hexSocket(8)}
    </>
  ),
  flange: (
    <>
      <circle cx="40" cy="40" r="33" {...S} />
      <polygon points={hexPts(40, 40, 21)} {...S} />
    </>
  ),
  truss: (
    <>
      <circle cx="40" cy="40" r="34" {...S} />
      <circle cx="40" cy="40" r="22" fill="none" stroke={STEEL} strokeWidth="0.8" />
    </>
  ),
  socket: (
    <>
      <circle cx="40" cy="40" r="24" {...S} />
      {hexSocket(10)}
    </>
  ),
  slotted: (
    <>
      <circle cx="40" cy="40" r="30" {...S} />
      {slot(26)}
    </>
  ),
  phillips: (
    <>
      <circle cx="40" cy="40" r="30" {...S} />
      {cross(14)}
    </>
  ),
  hexSocket: (
    <>
      <circle cx="40" cy="40" r="30" {...S} />
      {hexSocket(12)}
    </>
  ),
}

function Card({ h, side = true }) {
  return (
    <li className="group flex flex-col bg-paper">
      <div className="relative flex aspect-[4/3] items-center justify-center gap-2 overflow-hidden border-b border-steel-300/70 px-3">
        <div className="bp-grid absolute inset-0 opacity-50" aria-hidden />
        {side && (
          <figure className="relative flex w-1/2 flex-col items-center">
            <svg viewBox="0 0 120 80" className="w-full" aria-hidden>
              {SIDE[h.key]}
            </svg>
            <figcaption className="label-mono mt-1 text-[9px] text-steel-500">{t.side}</figcaption>
          </figure>
        )}
        <figure className={`relative flex flex-col items-center ${side ? 'w-[38%]' : 'w-1/2'}`}>
          <svg
            viewBox="0 0 80 80"
            className="w-full transition-transform duration-700 ease-[var(--ease-machine)] motion-safe:group-hover:rotate-90 motion-safe:group-focus-within:rotate-90"
            aria-hidden
          >
            {TOP[h.key]}
          </svg>
          <figcaption className="label-mono mt-1 text-[9px] text-steel-500">{t.top}</figcaption>
        </figure>
      </div>
      <div className="flex flex-1 flex-wrap items-center justify-between gap-2 p-3 sm:p-4">
        <h4 className="font-display text-[1rem] leading-tight font-[760] [font-stretch:110%]">{h.name}</h4>
        {h.item && (
          <Link to={`/products/${h.item}`} className="label-mono shrink-0 rounded-xs border border-red/40 px-1.5 py-0.5 text-[9px] text-red hover:bg-red-tint">
            {t.inCatalogue}
          </Link>
        )}
      </div>
    </li>
  )
}

export default function HeadTypes() {
  return (
    <section id="heads" aria-labelledby="heads-title" className="relative section-y bg-paper">
      <div className="container-x">
        <SectionHead id="heads-title" label={t.label} title={t.title} aside={<p className="max-w-[44ch]">{t.lead}</p>} />
        <h3 className="label-mono mb-4 flex items-center gap-3 text-steel-700">
          <span className="h-px w-6 bg-red" aria-hidden />
          {t.headsTitle}
        </h3>
        <ul className="grid grid-cols-2 gap-px border border-steel-300 bg-steel-300 lg:grid-cols-4">
          {t.list.map((h) => (
            <Card key={h.key} h={h} />
          ))}
        </ul>
        <h3 className="label-mono mt-10 mb-4 flex items-center gap-3 text-steel-700">
          <span className="h-px w-6 bg-red" aria-hidden />
          {t.drivesTitle}
        </h3>
        <ul className="grid grid-cols-3 gap-px border border-steel-300 bg-steel-300">
          {t.drives.map((h) => (
            <Card key={h.key} h={h} side={false} />
          ))}
        </ul>
      </div>
    </section>
  )
}
