// Machining (phase 12C): the secondary operations as a numbered step list, one small
// blueprint drawing per step. Copy in content.js `machining`; the only capacity shown is
// the Traub A25 turning range (no invented figures).
import { content } from '../../data/content.js'
import SectionHead from '../ui/SectionHead.jsx'

const t = content.machining
const INK = 'var(--color-ink)'
const STEEL = 'var(--color-steel-500)'
const RED = 'var(--color-red)'
const P = (props) => <path fill="none" stroke={INK} strokeWidth="1.3" strokeLinejoin="round" strokeLinecap="round" {...props} />
const Thin = (props) => <path fill="none" stroke={STEEL} strokeWidth="0.8" {...props} />
const Hot = (props) => <path fill="none" stroke={RED} strokeWidth="1.3" strokeLinecap="round" {...props} />

/** Small blueprint drawings, viewBox 160 × 100. Also used as video placeholders (MachineTypes). */
export const MACHINING_DRAWINGS = {
  turning: (
    <>
      <P d="M14 30h22v40H14Z" />
      <Thin d="M14 40h22M14 60h22" />
      <P d="M36 42h70v16H36Z" />
      <P d="M106 46h22v8h-22Z" />
      <Thin d="M8 50h132" strokeDasharray="8 3 1.5 3" />
      <P d="M84 58l8 10h20l-6-10Z" />
      <Hot d="M86 60l-3 4M90 60l-2 5" />
      <path d="M36 82h92M36 78v8M128 78v8" stroke={RED} strokeWidth="1" fill="none" />
    </>
  ),
  drilling: (
    <>
      <P d="M72 6h16v14H72Z" />
      <P d="M76 20h8v26l-4 8-4-8Z" />
      <Thin d="M76 26l8 4M76 32l8 4M76 38l8 4" />
      <P d="M30 62h100v24H30Z" />
      <P d="M74 62v14h12V62" />
      <Thin d="M80 2v94" strokeDasharray="8 3 1.5 3" />
      <Hot d="M112 62v24M108 62h8M108 86h8" />
    </>
  ),
  milling: (
    <>
      <P d="M62 4h36v16H62Z" />
      <P d="M68 20h24v26H68Z" />
      <Thin d="M68 26l24 6M68 34l24 6M68 42l24 4" />
      <P d="M20 58h120v28H20Z" />
      <P d="M54 58v-6h52v6" />
      <Hot d="M54 52h52M54 48v8M106 48v8" />
    </>
  ),
  grinding: (
    <>
      <circle cx="80" cy="32" r="24" fill="none" stroke={INK} strokeWidth="1.3" />
      <circle cx="80" cy="32" r="5" fill="none" stroke={INK} strokeWidth="1.3" />
      <Thin d="M62 18l36 28M98 18L62 46" />
      <P d="M18 62h124v14H18Z" />
      <Thin d="M10 69h140" strokeDasharray="8 3 1.5 3" />
      <Hot d="M70 58l-6-4M80 57v-5M90 58l6-4" />
    </>
  ),
  slotting: (
    <>
      <circle cx="80" cy="30" r="24" fill="none" stroke={INK} strokeWidth="1.3" />
      <circle cx="80" cy="30" r="4" fill="none" stroke={INK} strokeWidth="1.3" />
      <Thin d="M80 6v4M80 50v4M56 30h4M100 30h4M63 13l3 3M97 13l-3 3M63 47l3-3M97 47l-3-3" />
      <P d="M56 62h48v16H56Z" />
      <P d="M70 78h20v18H70Z" />
      <Hot d="M78 62v8h4v-8" />
    </>
  ),
  polishing: (
    <>
      <path d="M40 18h80l14 30-14 30H40L26 48Z" fill="none" stroke={INK} strokeWidth="1.3" strokeLinejoin="round" />
      <Thin d="M80 8v80" strokeDasharray="8 3 1.5 3" />
      {[
        [56, 56],
        [70, 62],
        [86, 58],
        [100, 52],
        [64, 46],
        [92, 44],
      ].map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x - 5} y={y - 2.5} width="10" height="5" rx="1" fill="none" stroke={STEEL} strokeWidth="0.9" transform={`rotate(${(x * 7) % 60 - 30} ${x} ${y})`} />
      ))}
      <Hot d="M120 26a30 30 0 0 1 0 44" />
      <Hot d="M120 70l-4-4M120 70l4-4" />
    </>
  ),
  welding: (
    <>
      <P d="M14 60h66v20H14Z" />
      <P d="M80 60h66v20H80Z" />
      <path d="M74 60q6-6 12 0" fill="none" stroke={RED} strokeWidth="1.6" />
      <P d="M96 14l-14 40" />
      <P d="M92 10l10 6-4 8-10-6Z" />
      <Hot d="M80 52l-6-6M84 50v-8M88 52l6-6" />
    </>
  ),
}

export default function Machining() {
  return (
    <section id="machining" aria-labelledby="machining-title" className="relative section-y bg-paper">
      <div className="bp-grid bp-grid-fade pointer-events-none absolute inset-0 opacity-50" aria-hidden />
      <div className="container-x relative">
        <SectionHead
          id="machining-title"
          label={t.label}
          title={
            <>
              {t.title[0]} <span className="text-red">{t.title[1]}</span>
            </>
          }
          aside={<p className="max-w-[44ch]">{t.lead}</p>}
        />
        <ol className="border-t border-steel-300">
          {t.steps.map((s, i) => (
            <li key={s.key} className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2 border-b border-steel-300 py-4 sm:grid-cols-[3rem_9rem_1fr] md:gap-x-8 lg:grid-cols-[3rem_10rem_minmax(0,18rem)_1fr]">
              <span className="font-mono text-small font-medium text-red">M{String(i + 1).padStart(2, '0')}</span>
              <svg viewBox="0 0 160 100" className="col-start-1 row-start-2 w-24 sm:col-start-2 sm:row-start-1 sm:w-full" aria-hidden>
                {MACHINING_DRAWINGS[s.key]}
              </svg>
              <div className="col-start-2 row-span-2 sm:col-start-3 sm:row-span-1">
                <h3 className="font-display text-[1.15rem] leading-tight font-[760] [font-stretch:112%]">{s.name}</h3>
                <p className="label-mono mt-1.5 text-steel-500">{s.spec}</p>
                <p className="mt-2 text-small text-steel-700 lg:hidden">{s.text}</p>
              </div>
              <p className="hidden text-steel-700 lg:block">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
