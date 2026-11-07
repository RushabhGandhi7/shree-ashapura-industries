import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { company, content } from '../../data/content.js'
import { prefersReducedMotion } from '../../lib/device.js'
import InstrumentIcon from './InstrumentIcon.jsx'

const t = content.quality
const N_TICKS = 5 // first piece + 4 two-hour checks on the timeline

const Heading = ({ children, id }) => (
  <h3 id={id} className="label-mono mb-4 font-medium [font-stretch:100%] text-steel-500">
    {children}
  </h3>
)

/** ISO 9001:2015 seal (certificate details // CONFIRM in content.js). */
function IsoSeal() {
  const teeth = Array.from({ length: 24 }, (_, i) => i)
  return (
    <svg viewBox="0 0 120 120" className="size-28 shrink-0 sm:size-32" role="img" aria-label={`${t.isoBadge.title} ${t.isoBadge.text}`}>
      <circle cx="60" cy="60" r="54" fill="var(--color-paper)" stroke="var(--color-ink)" strokeWidth="1.5" />
      {teeth.map((i) => {
        const a = (i / 24) * Math.PI * 2
        return <line key={i} x1={60 + Math.sin(a) * 47} y1={60 + Math.cos(a) * 47} x2={60 + Math.sin(a) * 51} y2={60 + Math.cos(a) * 51} stroke="var(--color-steel-500)" strokeWidth="1" />
      })}
      <circle cx="60" cy="60" r="42" fill="none" stroke="var(--color-red)" strokeWidth="1.2" />
      <text x="60" y="52" textAnchor="middle" className="font-display" fontSize="17" fontWeight="800" fill="var(--color-ink)">
        ISO
      </text>
      <text x="60" y="70" textAnchor="middle" className="font-mono" fontSize="11" letterSpacing="0.5" fill="var(--color-ink)">
        9001:2015
      </text>
      <path d="M50 80 l6 6 l13 -14" fill="none" stroke="var(--color-red)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Quality & certifications: ISO, policy, in-process timeline, instruments, PPAP checklist, Lean. */
export default function Quality() {
  const root = useRef(null)
  const line = useRef(null)
  const count = useRef(null)
  const total = t.ppap.items.length

  useGSAP(
    () => {
      const items = gsap.utils.toArray('[data-ppap]', root.current)
      const nodes = gsap.utils.toArray('[data-node]', root.current)
      const setCount = () => {
        const n = items.filter((el) => el.dataset.done === 'true').length
        if (count.current) count.current.textContent = t.ppapProgress(n, total)
      }
      if (prefersReducedMotion()) {
        items.forEach((el) => (el.dataset.done = 'true'))
        nodes.forEach((el) => (el.dataset.on = 'true'))
        line.current.style.strokeDashoffset = '0'
        setCount()
        return
      }
      // PPAP: each document ticks as it scrolls past three-quarters of the viewport.
      items.forEach((el) =>
        gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: 'top 75%',
            onEnter: () => ((el.dataset.done = 'true'), setCount()),
            onLeaveBack: () => ((el.dataset.done = 'false'), setCount()),
          },
        }),
      )
      // Timeline: the line draws with scroll, nodes light up as it reaches them.
      gsap.fromTo(
        line.current,
        { strokeDashoffset: 1 },
        {
          strokeDashoffset: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: line.current.closest('svg'),
            start: 'top 85%',
            end: 'top 45%',
            scrub: 0.4,
            onUpdate: (st) => nodes.forEach((n, i) => (n.dataset.on = String(st.progress >= i / (N_TICKS - 1) - 0.001))),
          },
        },
      )
    },
    { scope: root },
  )

  return (
    <section id="quality" ref={root} aria-labelledby="quality-title" className="relative section-y bg-paper">
      <div className="bp-grid bp-grid-fade pointer-events-none absolute inset-0 opacity-50" aria-hidden />
      <div className="container-x relative">
        {/* header: title + ISO seal + mission */}
        <div className="grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="label-mono mb-6 flex items-center gap-3 text-steel-700">
              <span className="h-px w-8 bg-red" aria-hidden />
              {t.label}
            </p>
            <h2 id="quality-title" className="text-h2 max-w-[16ch]">
              {t.title[0]} <span className="text-red">{t.title[1]}</span>
            </h2>
          </div>
          <div className="flex items-center gap-5 md:col-span-5">
            <IsoSeal />
            <div>
              <p className="font-display text-[1.15rem] leading-snug font-[760] [font-stretch:112%]">{t.mission}</p>
              <p className="mt-2 text-small text-steel-700">{t.lead}</p>
            </div>
          </div>
        </div>

        {/* in-process checks: first piece, then every 2 hours */}
        <div className="mt-12 grid gap-px border border-steel-300 bg-steel-300 md:mt-16 md:grid-cols-[1fr_1fr_1.3fr]">
          {t.inProcess.steps.map((s) => (
            <div key={s.k} className="bg-paper p-5 sm:p-7">
              <p className="font-mono text-small font-medium text-red">{s.k}</p>
              <p className="mt-3 font-display text-[1.35rem] leading-tight font-[760] [font-stretch:115%]">{s.title}</p>
              <p className="mt-2 text-small text-steel-700">{s.text}</p>
            </div>
          ))}
          <div className="flex flex-col justify-center gap-4 bg-paper-2 p-5 sm:p-7">
            <p className="label-mono text-steel-500">{t.inProcess.title}</p>
            <svg viewBox="0 0 260 46" className="w-full max-w-[24rem] overflow-visible" aria-hidden>
              <line x1="8" y1="20" x2="252" y2="20" stroke="var(--color-steel-300)" strokeWidth="1" />
              <line ref={line} x1="8" y1="20" x2="252" y2="20" stroke="var(--color-red)" strokeWidth="1.6" pathLength="1" strokeDasharray="1" strokeDashoffset="1" />
              {Array.from({ length: N_TICKS }, (_, i) => (
                <g key={i} data-node data-on="false" transform={`translate(${8 + i * 61} 0)`} className="group">
                  <circle cy="20" r={i === 0 ? 6 : 4.5} className="fill-paper stroke-ink transition-colors duration-300 group-data-[on=true]:fill-red" strokeWidth="1.2" />
                  <text y="42" textAnchor="middle" className="font-mono" fontSize="9" fill="var(--color-steel-700)">
                    {i === 0 ? '1ST' : `${i * 2}H`}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* instruments */}
        <section aria-labelledby="q-instruments" className="mt-14">
          <Heading id="q-instruments">{t.instrumentsTitle}</Heading>
          <ul className="grid grid-cols-2 gap-px border border-steel-300 bg-steel-300 sm:grid-cols-3 lg:grid-cols-7">
            {t.instruments.map((it) => (
              <li key={it.name} className="flex flex-col gap-3 bg-paper p-4 max-sm:last:col-span-2 sm:p-5 sm:max-lg:last:col-span-3">
                <InstrumentIcon kind={it.icon} />
                <p className="font-display text-[0.98rem] leading-tight font-[760] [font-stretch:110%]">{it.name}</p>
                <p className="label-mono -mt-1 text-[10px] text-steel-500">{it.note}</p>
              </li>
            ))}
          </ul>
          <p className="label-mono mt-4 text-steel-500">{t.design}</p>
        </section>

        <div className="mt-14 grid gap-12 lg:grid-cols-12 lg:gap-10">
          {/* PPAP checklist, ticks with scroll */}
          <section aria-labelledby="q-ppap" className="min-w-0 lg:col-span-7">
            <div className="mb-4 flex items-baseline justify-between gap-4">
              <h3 id="q-ppap" className="label-mono font-medium [font-stretch:100%] text-steel-500">
                {t.ppap.title}
              </h3>
              <span ref={count} className="font-mono text-small text-red" aria-hidden>
                {t.ppapProgress(0, total)}
              </span>
            </div>
            <ol className="grid border-t border-steel-300 sm:grid-cols-2 sm:gap-x-8">
              {t.ppap.items.map((it, i) => (
                <li key={it} data-ppap data-done="false" className="group flex items-center gap-3 border-b border-steel-300 py-2.5">
                  <svg viewBox="0 0 20 20" className="size-5 shrink-0" aria-hidden>
                    <rect x="1.5" y="1.5" width="17" height="17" rx="2" className="fill-paper stroke-steel-500 transition-colors duration-300 group-data-[done=true]:stroke-red" strokeWidth="1.2" />
                    <path
                      d="M5.5 10.5 l3 3 l6 -7"
                      fill="none"
                      stroke="var(--color-red)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      pathLength="1"
                      strokeDasharray="1"
                      className="transition-[stroke-dashoffset] duration-500 ease-[var(--ease-out)] [stroke-dashoffset:1] group-data-[done=true]:[stroke-dashoffset:0]"
                    />
                  </svg>
                  <span className="font-mono text-[11px] text-steel-500">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-small transition-colors group-data-[done=true]:text-ink">{it}</span>
                </li>
              ))}
            </ol>
          </section>

          <div className="min-w-0 space-y-10 lg:col-span-5">
            <section aria-labelledby="q-lean">
              <Heading id="q-lean">{t.lean.title}</Heading>
              <p className="font-display text-[1.2rem] font-[760] [font-stretch:115%]">{t.lean.text}</p>
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {t.lean.items.map((it) => (
                  <li key={it} className="label-mono rounded-xs border border-steel-300 bg-paper-2 px-2 py-1 text-[11px] text-ink">
                    {it}
                  </li>
                ))}
              </ul>
            </section>

            {/* short quality policy, signed */}
            <figure className="border border-steel-300 bg-paper p-6">
              <p className="label-mono text-steel-500">{t.policy.title}</p>
              <blockquote className="mt-3">
                <p>{t.policy.intro}</p>
                <ul className="mt-3 space-y-1.5">
                  {t.policy.principles.map((p) => (
                    <li key={p} className="flex gap-3 text-small text-steel-700">
                      <span className="mt-[0.55em] size-1.5 shrink-0 rounded-full bg-red" aria-hidden />
                      {p}
                    </li>
                  ))}
                </ul>
              </blockquote>
              <figcaption className="mt-5 border-t border-steel-300 pt-4">
                <span className="font-display text-[1.1rem] font-[760] [font-stretch:115%]">{t.policy.name}</span>
                <span className="ml-3 text-small text-steel-700">{t.policy.role}</span>
                <span className="label-mono mt-1 block text-[10px] text-steel-500">{company.name}</span>
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  )
}
