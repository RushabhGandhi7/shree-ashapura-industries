import { company, content } from '../../data/content.js'
import DimensionLine from '../ui/DimensionLine.jsx'

const t = content.quality

const Heading = ({ children, id }) => (
  <h3 id={id} className="label-mono mb-4 font-medium [font-stretch:100%] text-steel-500">
    {children}
  </h3>
)

/** Quality: inspection & testing, in-process checks, PPAP, Lean and the quality policy. */
export default function Quality() {
  return (
    <section id="quality" aria-labelledby="quality-title" className="relative section-y bg-paper">
      <div className="bp-grid bp-grid-fade pointer-events-none absolute inset-0 opacity-50" aria-hidden />
      <div className="container-x relative">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="label-mono mb-6 flex items-center gap-3 text-steel-700">
              <span className="h-px w-8 bg-red" aria-hidden />
              {t.label}
            </p>
            <h2 id="quality-title" className="text-h2 max-w-[16ch]">
              {t.title[0]} <span className="text-red">{t.title[1]}</span>
            </h2>
          </div>
          <div className="md:col-span-5">
            <p className="max-w-[46ch] text-steel-700">{t.lead}</p>
            <p className="label-mono mt-4 inline-flex items-center gap-2 rounded-xs border border-ink bg-paper px-2.5 py-1.5 text-ink">
              <span className="size-1.5 rounded-full bg-red" aria-hidden />
              {t.isoBadge.title} · {t.isoBadge.text}
            </p>
          </div>
        </div>

        {/* in-process checks: first piece, then every 2 hours */}
        <div className="mt-12 grid gap-px border border-steel-300 bg-steel-300 md:mt-16 md:grid-cols-[1fr_1fr_1.2fr]">
          {t.inProcess.steps.map((s) => (
            <div key={s.k} className="bg-paper p-5 sm:p-7">
              <p className="font-mono text-small font-medium text-red">{s.k}</p>
              <p className="mt-3 font-display text-[1.35rem] leading-tight font-[760] [font-stretch:115%]">{s.title}</p>
              <p className="mt-2 text-small text-steel-700">{s.text}</p>
            </div>
          ))}
          <div className="flex flex-col justify-center gap-4 bg-paper-2 p-5 sm:p-7">
            <p className="label-mono text-steel-500">{t.inProcess.title}</p>
            {/* timeline: first piece at 0, checks every 2 h */}
            <svg viewBox="0 0 260 44" className="w-full max-w-[22rem]" aria-hidden>
              <line x1="8" y1="22" x2="252" y2="22" stroke="var(--color-steel-500)" strokeWidth="1" />
              {[0, 1, 2, 3, 4].map((i) => (
                <g key={i} transform={`translate(${8 + i * 61} 0)`}>
                  <circle cy="22" r={i === 0 ? 6 : 4} fill={i === 0 ? 'var(--color-red)' : 'var(--color-paper)'} stroke="var(--color-ink)" strokeWidth="1.2" />
                  <text y="42" textAnchor="middle" className="font-mono" fontSize="9" fill="var(--color-steel-700)">
                    {i === 0 ? '1ST' : `${i * 2}H`}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        <div className="mt-14 grid gap-12 lg:grid-cols-12 lg:gap-10">
          <section aria-labelledby="q-inspection" className="min-w-0 lg:col-span-7">
            <Heading id="q-inspection">{t.inspection.title}</Heading>
            <ul className="border-t border-steel-300">
              {t.inspection.items.map((it, i) => (
                <li key={it} className="flex items-baseline gap-4 border-b border-steel-300 py-3">
                  <span className="font-mono text-[11px] text-red">{String(i + 1).padStart(2, '0')}</span>
                  <span>{it}</span>
                </li>
              ))}
            </ul>
            <p className="label-mono mt-4 text-steel-500">{t.design}</p>
          </section>

          <section aria-labelledby="q-ppap" className="min-w-0 lg:col-span-5">
            <Heading id="q-ppap">{t.ppap.title}</Heading>
            <ul className="flex flex-wrap gap-1.5">
              {t.ppap.items.map((it) => (
                <li key={it} className="rounded-xs border border-steel-300 bg-paper px-2.5 py-1 text-small">
                  {it}
                </li>
              ))}
            </ul>

            <div className="mt-10">
              <Heading>{t.lean.title}</Heading>
              <p className="font-display text-[1.2rem] font-[760] [font-stretch:115%]">{t.lean.text}</p>
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {t.lean.items.map((it) => (
                  <li key={it} className="label-mono rounded-xs border border-steel-300 bg-paper-2 px-2 py-1 text-[11px] text-ink">
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>

        {/* quality policy, signed */}
        <figure className="relative mt-14 overflow-hidden border border-steel-300 bg-paper p-6 sm:p-9">
          <div className="grid gap-8 md:grid-cols-12">
            <div className="md:col-span-4">
              <p className="label-mono text-steel-500">{t.policy.title}</p>
              <DimensionLine length="min(100%, 14rem)" label={content.hero.tolerance} className="mt-4" />
            </div>
            <blockquote className="md:col-span-8">
              <p className="text-body-lg">{t.policy.intro}</p>
              <ul className="mt-4 grid gap-x-8 gap-y-2 sm:grid-cols-2">
                {t.policy.principles.map((p) => (
                  <li key={p} className="flex gap-3 text-steel-700">
                    <span className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-red" aria-hidden />
                    {p}
                  </li>
                ))}
              </ul>
            </blockquote>
          </div>
          <figcaption className="mt-8 flex flex-wrap items-baseline justify-between gap-3 border-t border-steel-300 pt-5">
            <span>
              <span className="font-display text-[1.2rem] font-[760] [font-stretch:115%]">{t.policy.name}</span>
              <span className="ml-3 text-small text-steel-700">{t.policy.role}</span>
            </span>
            <span className="label-mono text-steel-500">{company.name}</span>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
