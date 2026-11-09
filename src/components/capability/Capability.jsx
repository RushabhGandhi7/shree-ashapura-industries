import { useRef } from 'react'
import { Link } from 'react-router'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { content, machines } from '../../data/content.js'
import SectionHead from '../ui/SectionHead.jsx'
import { whatsappHref } from '../../lib/contact.js'
import { revealOnce } from '../../lib/reveal.js'
import { prefersReducedMotion } from '../../lib/device.js'

const t = content.capability
const MAX = 60 // shared scale, mm
const TICKS = Array.from({ length: MAX / 5 + 1 }, (_, i) => i * 5)
const pct = (v) => `${(v / MAX) * 100}%`

/** N small machine glyphs (one per machine), lit in sequence. */
function MachineCount({ n }) {
  return (
    <span className="flex flex-wrap gap-1" aria-hidden>
      {Array.from({ length: n }, (_, i) => (
        <svg key={i} data-glyph viewBox="0 0 16 16" className="size-4 text-steel-300 transition-colors duration-300 data-[on=true]:text-red" data-on="false">
          <rect x="2" y="3" width="12" height="9" rx="1" fill="currentColor" />
          <rect x="4" y="12" width="2" height="2" fill="currentColor" />
          <rect x="10" y="12" width="2" height="2" fill="currentColor" />
        </svg>
      ))}
    </span>
  )
}

/** Capability: machine ranges for units 24 & 25 on one mm scale, plus the made-to-drawing call-out. */
export default function Capability({ h1 = false, teaser = false } = {}) {
  const H = h1 ? 'h1' : 'h2'
  const root = useRef(null)

  useGSAP(
    () => {
      const rows = gsap.utils.toArray('[data-row]', root.current)
      const finish = (row) => {
        row.querySelector('[data-band]').style.transform = 'scaleX(1)'
        row.querySelectorAll('[data-glyph]').forEach((g) => (g.dataset.on = 'true'))
        row.querySelectorAll('[data-reveal]').forEach((el) => (el.style.opacity = 1))
      }
      if (prefersReducedMotion()) return rows.forEach(finish)
      const cleanups = rows.map((row) => {
        const band = row.querySelector('[data-band]')
        const glyphs = row.querySelectorAll('[data-glyph]')
        const tl = gsap.timeline({ paused: true })
        tl.fromTo(band, { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: 'power3.out' })
          .fromTo(row.querySelectorAll('[data-reveal]'), { opacity: 0 }, { opacity: 1, duration: 0.4, stagger: 0.08 }, '-=0.5')
          .add(() => glyphs.forEach((g, i) => setTimeout(() => (g.dataset.on = 'true'), i * 70)), '-=0.6')
        // never left hidden: plays on scroll, or snaps to the end state if it can't be reached
        return revealOnce(row, {
          play: () => tl.play(),
          finish: () => {
            tl.progress(1)
            finish(row)
          },
        })
      })
      return () => cleanups.forEach((c) => c())
    },
    { scope: root },
  )

  return (
    <section id="capability" ref={root} aria-labelledby="capability-title" className="relative section-y bg-paper-2">
      <div className="bp-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden />
      <div className="container-x relative">
        <SectionHead
          id="capability-title"
          as={H}
          label={t.label}
          title={
            <>
              {t.title[0]} <span className="text-red">{t.title[1]}</span>
            </>
          }
          aside={<p className="max-w-[44ch]">{t.lead}</p>}
        />

        <div className="grid gap-10 lg:grid-cols-12">
          {/* range chart */}
          <div className={`flex min-w-0 flex-col border border-steel-300 bg-paper p-5 sm:p-8 ${teaser ? 'lg:col-span-12' : 'lg:col-span-8'}`}>
            <ul className="flex flex-1 flex-col justify-between gap-9">
              {machines.map((m) => (
                <li key={m.key} data-row>
                  <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
                    <p className="font-display text-[1.15rem] font-[760] [font-stretch:112%]">{m.name}</p>
                    <span className="flex items-center gap-3">
                      <MachineCount n={m.count} />
                      <span className="label-mono text-ink">{t.machinesLabel(m.count)}</span>
                    </span>
                  </div>
                  {/* bar on the shared scale */}
                  <div className="relative h-9">
                    <div className="absolute inset-x-0 top-1/2 h-px bg-steel-300" />
                    <div className="absolute top-1/2 h-3 -translate-y-1/2" style={{ left: pct(m.min), width: pct(m.max - m.min) }}>
                      <div data-band className="h-full origin-left rounded-[1px] bg-red/85" />
                      {/* dimension ends */}
                      <span data-reveal className="absolute -top-2 left-0 h-7 w-px bg-ink" />
                      <span data-reveal className="absolute -top-2 right-0 h-7 w-px bg-ink" />
                    </div>
                  </div>
                  <p data-reveal className="label-mono mt-1 text-ink" style={{ paddingLeft: `min(${pct(m.min)}, calc(100% - 10rem))` }}>
                    {t.rangeLabel(m)}
                  </p>
                </li>
              ))}
            </ul>
            {/* scale */}
            <div className="relative mt-8 h-8 border-t border-ink" aria-hidden>
              {TICKS.map((v) => (
                <span key={v} className="absolute top-0 -translate-x-1/2" style={{ left: pct(v) }}>
                  <span className={`block w-px bg-ink ${v % 10 === 0 ? 'h-2.5' : 'h-1.5'}`} />
                  {v % 10 === 0 && <span className="label-mono mt-1 block text-[10px] text-steel-500">{v}</span>}
                </span>
              ))}
              <span className="label-mono absolute -top-6 right-0 text-[10px] text-steel-500">{t.scale}</span>
            </div>
          </div>

          {teaser && (
            <Link to="/manufacturing" className="label-mono inline-flex items-center gap-2 text-ink hover:text-red lg:col-span-12">
              {content.teasers.capability.cta} <span aria-hidden>→</span>
            </Link>
          )}
          {/* made to your drawing */}
          {!teaser && <aside className="relative flex flex-col overflow-hidden border border-ink bg-paper p-6 sm:p-8 lg:col-span-4">
            <svg viewBox="0 0 200 120" className="mb-6 w-full max-w-[16rem]" aria-hidden>
              <rect x="2" y="2" width="196" height="116" fill="none" stroke="var(--color-ink)" strokeWidth="1.2" />
              <rect x="8" y="8" width="184" height="104" fill="none" stroke="var(--color-steel-300)" />
              <path d="M40 40 H120 V54 H150 V66 H120 V80 H40 Z" fill="none" stroke="var(--color-ink)" strokeWidth="1.4" />
              <path d="M40 92 H150 M40 88 v8 M150 88 v8" stroke="var(--color-red)" strokeWidth="1.2" />
              <text x="95" y="104" textAnchor="middle" className="font-mono" fontSize="8" fill="var(--color-red)">
                L
              </text>
              <rect x="138" y="96" width="54" height="16" fill="none" stroke="var(--color-steel-500)" />
              <text x="165" y="107" textAnchor="middle" className="font-mono" fontSize="7" fill="var(--color-steel-700)">
                DWG
              </text>
            </svg>
            <p className="label-mono flex items-center gap-2 text-red">
              <span className="size-1.5 rounded-full bg-red" aria-hidden />
              {t.drawing.eyebrow}
            </p>
            <h3 className="mt-3 text-h3">{t.drawing.title}</h3>
            <p className="mt-3 text-small leading-relaxed text-steel-700">{t.drawing.text}</p>
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {t.drawing.tags.map((g) => (
                <li key={g} className="label-mono rounded-xs border border-steel-300 px-2 py-1 text-[10px] text-ink">
                  {g}
                </li>
              ))}
            </ul>
            <a
              href={whatsappHref(t.drawing.message)}
              target="_blank"
              rel="noopener noreferrer"
              className="shine relative mt-auto inline-flex h-12 items-center justify-center self-start rounded-xs bg-red px-6 font-semibold text-paper max-lg:mt-6 lg:mt-8"
            >
              <span className="relative z-[2]">{t.drawing.cta} →</span>
            </a>
          </aside>}
        </div>
      </div>
    </section>
  )
}
