// Company history timeline (phase 12D). Data-driven: content.about.milestones (add a
// milestone by adding an entry there). Vertical rail on phones / tablets, horizontal
// dimension line on lg with the nodes spread evenly (so any count fills the width). Between
// two numeric years, a mono span label ("35 YEARS"). One-shot scroll reveal (revealOnce):
// the line draws, then nodes and text rise; reduced motion shows the final state.
import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { content } from '../../data/content.js'
import { revealOnce } from '../../lib/reveal.js'

const a = content.about
const t = a.timeline
const items = a.milestones
const yearsBetween = (x, y) => (typeof x === 'number' ? (typeof y === 'number' ? y : new Date().getFullYear()) - x : null)

export default function Timeline() {
  const root = useRef(null)

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      const lines = q('[data-line]')
      const rise = q('[data-rise]')
      gsap.set(lines, { scaleX: 1, scaleY: 1 })
      return revealOnce(root.current, {
        start: 'top 80%',
        play: () => {
          const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
          tl.fromTo(lines, { scaleX: 0, scaleY: 0 }, { scaleX: 1, scaleY: 1, duration: 1.1, ease: 'power2.inOut' })
          tl.fromTo(rise, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.08 }, 0.25)
        },
        finish: () => gsap.set([...lines, ...rise], { clearProps: 'all' }),
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} aria-labelledby="timeline-title" className="relative section-y bg-paper-2">
      <div className="bp-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden />
      <div className="container-x relative">
        <div className="mb-head">
          <p className="label-mono mb-6 flex items-center gap-3 text-steel-700">
            <span className="h-px w-8 bg-red" aria-hidden />
            {t.label}
          </p>
          <h2 id="timeline-title" className="text-h2 max-w-[16ch]">
            {t.title[0]} <span className="text-red">{t.title[1]}</span>
          </h2>
        </div>

        <ol className="relative grid gap-10 lg:grid-cols-[repeat(var(--n),minmax(0,1fr))] lg:gap-0" style={{ '--n': items.length }}>
          {/* rails: vertical (below lg) and horizontal (lg) */}
          <span data-line className="absolute top-2 bottom-2 left-[7px] w-px origin-top bg-ink lg:hidden" aria-hidden />
          <span data-line className="absolute top-[7px] right-0 left-0 hidden h-px origin-left bg-ink lg:block" aria-hidden />
          {items.map((m, i) => {
            const span = i < items.length - 1 ? yearsBetween(m.year, items[i + 1].year) : null
            return (
              <li key={`${m.year}-${m.title}`} className="relative pl-10 lg:pl-0 lg:pr-10">
                {/* node */}
                <span className="absolute top-0 left-0 grid size-[15px] place-items-center rounded-full border border-ink bg-paper lg:static lg:mb-6" aria-hidden>
                  <span className={`size-[7px] rounded-full ${i === items.length - 1 ? 'bg-red' : 'bg-ink'}`} />
                </span>
                {/* span to the next milestone, on the line */}
                {span != null && span > 0 && (
                  <span data-rise className="label-mono absolute top-[-0.05rem] left-1/2 hidden -translate-x-1/2 bg-paper-2 px-2 text-[10px] leading-none text-red lg:block" aria-hidden>
                    ← {t.span(span)} →
                  </span>
                )}
                <div data-rise>
                  <p className="display-wide text-[clamp(2.4rem,1.6rem+3vw,4rem)] leading-none tracking-[-0.03em]">{m.year}</p>
                  <h3 className="label-mono mt-3 text-steel-700">{m.title}</h3>
                  {m.text && <p className="mt-3 max-w-[36ch] text-body-lg text-steel-700">{m.text}</p>}
                  {m.points && (
                    <ul className="mt-3 space-y-1.5">
                      {m.points.map((p) => (
                        <li key={p} className="flex items-baseline gap-2.5">
                          <span className="size-1.5 shrink-0 translate-y-[-2px] rounded-full bg-red" aria-hidden />
                          {p}
                        </li>
                      ))}
                    </ul>
                  )}
                  {span != null && span > 0 && <p className="label-mono mt-3 text-[10px] text-red lg:hidden">↓ {t.span(span)}</p>}
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
