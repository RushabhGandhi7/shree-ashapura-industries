import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { SHOW_CUSTOMERS, content, yearsInBusiness } from '../../data/content.js'
import { categories } from '../../data/products.js'
import Customers from './Customers.jsx'
import { prefersReducedMotion } from '../../lib/device.js'
import { gearPath } from '../ui/gear.js'
import DimensionLine from '../ui/DimensionLine.jsx'

const t = content.industries
const computed = { years: yearsInBusiness(), categories: categories.length, industries: t.list.length }
const counters = t.counters.map((c) => ({ ...c, value: computed[c.value] ?? c.value }))
const fmt = (v, d = 0) => v.toLocaleString('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d })

// Micro-animations run on hover, keyboard focus, or once in view on touch (data-in).
const anim = 'transition-transform duration-700 ease-[var(--ease-out)] motion-reduce:transition-none'
// --on: hover / focus motions (gear turns, caliper closes…); --in: draw-ins, once in view.
const on = 'group-hover:[--on:1] group-focus-within:[--on:1] group-data-[in=true]:[--in:1]'

function WhyIcon({ kind }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }
  const draw = 'transition-[stroke-dashoffset] duration-1000 ease-[var(--ease-out)] [stroke-dashoffset:calc(1-var(--in,0))] motion-reduce:[stroke-dashoffset:0]'
  return (
    <svg viewBox="0 0 48 48" className={`size-12 text-ink ${on}`} aria-hidden>
      {kind === 'gear' && (
        <g transform="translate(24 24)">
          <path
            d={gearPath(10, 16, 12.5, 4.5)}
            {...common}
            className={`${anim} [transform:rotate(calc(var(--on,0)*72deg))]`}
          />
          <circle r="1.5" fill="var(--color-red)" />
        </g>
      )}
      {kind === 'drawing' && (
        <>
          <rect x="8" y="8" width="32" height="32" rx="1" {...common} />
          <rect x="15" y="17" width="18" height="12" {...common} strokeOpacity=".5" />
          <path d="M15 35 H33" {...common} stroke="var(--color-red)" pathLength="1" strokeDasharray="1" className={draw} />
          <path d="M15 33 v4 M33 33 v4" {...common} stroke="var(--color-red)" />
        </>
      )}
      {kind === 'caliper' && (
        <>
          <path d="M10 10 V40 M10 12 H38" {...common} />
          <path d="M10 18 H18 V24 H10" {...common} />
          <g className={`${anim} [transform:translateX(calc((1-var(--on,0))*10px))]`}>
            <path d="M28 12 V40 M28 18 H22 V24 H28" {...common} stroke="var(--color-red)" />
          </g>
        </>
      )}
      {kind === 'clock' && (
        <g transform="translate(24 24)">
          <circle r="15" {...common} />
          <path d="M0 0 V-9" {...common} />
          <path d="M0 0 H7" {...common} stroke="var(--color-red)" className={`${anim} duration-1000 [transform:rotate(calc(var(--on,0)*360deg))]`} />
          <circle r="1.5" fill="currentColor" />
        </g>
      )}
      {kind === 'check' && (
        <>
          <circle cx="24" cy="24" r="15" {...common} />
          <path d="M17 24.5 l5 5 l9 -10" {...common} stroke="var(--color-red)" strokeWidth="2" pathLength="1" strokeDasharray="1" className={draw} />
        </>
      )}
      {kind === 'box' && (
        <>
          <path d="M10 20 H38 V39 H10 Z" {...common} />
          <path d="M10 20 L24 26 L38 20" {...common} strokeOpacity=".45" />
          <g className={`${anim} origin-[10px_20px] [transform:rotate(calc((1-var(--on,0))*-28deg))]`}>
            <path d="M10 20 L17 12 H31" {...common} stroke="var(--color-red)" />
          </g>
        </>
      )}
    </svg>
  )
}

function IndustryGlyph({ k }) {
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round' }
  return (
    <svg viewBox="0 0 40 40" className="size-9 shrink-0 text-steel-700 transition-colors group-hover:text-red" aria-hidden>
      {k === 'furniture' && <path d="M8 30 V18 H32 V30 M8 24 H32 M12 18 V12 H28 V18" {...p} />}
      {k === 'electrical' && <path d="M22 6 L12 22 H20 L18 34 L28 17 H20 Z" {...p} />}
      {k === 'automotive' && (
        <>
          <path d="M6 26 V20 L11 13 H28 L34 20 V26 Z" {...p} />
          <circle cx="13" cy="27" r="3" {...p} />
          <circle cx="27" cy="27" r="3" {...p} />
        </>
      )}
      {k === 'appliances' && (
        <>
          <rect x="10" y="6" width="20" height="28" rx="2" {...p} />
          <circle cx="20" cy="22" r="6" {...p} />
          <path d="M14 11 h4" {...p} />
        </>
      )}
      {k === 'construction' && <path d="M6 34 H34 M10 34 V14 H30 V34 M10 14 L20 6 L30 14 M16 34 V24 H24 V34" {...p} />}
      {k === 'locks' && (
        <>
          <rect x="9" y="18" width="22" height="16" rx="2" {...p} />
          <path d="M14 18 V13 a6 6 0 0 1 12 0 V18" {...p} />
          <path d="M20 24 v4" {...p} />
        </>
      )}
      {k === 'networking' && (
        <>
          <rect x="6" y="8" width="28" height="10" rx="1.5" {...p} />
          <path d="M11 13 h2 M16 13 h2 M21 13 h2" {...p} />
          <path d="M20 18 V24 M10 24 H30 M10 24 V30 M20 24 V30 M30 24 V30" {...p} />
        </>
      )}
    </svg>
  )
}

export default function Industries({ h1 = false } = {}) {
  const H = h1 ? 'h1' : 'h2'
  const root = useRef(null)
  const nums = useRef([])

  // Counters: count up once when the row scrolls in; final values under reduced motion.
  useGSAP(
    () => {
      const els = nums.current
      if (prefersReducedMotion()) return
      counters.forEach((c, i) => {
        const o = { v: 0 }
        els[i].textContent = fmt(0, c.decimals)
        gsap.to(o, {
          v: c.value,
          duration: 1.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: els[i], start: 'top 88%', once: true },
          onUpdate: () => (els[i].textContent = fmt(o.v, c.decimals)),
        })
      })
    },
    { scope: root },
  )

  // Draw-in parts of each icon play once it is in view (all devices).
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && (e.target.dataset.in = 'true')),
      { threshold: 0.6 },
    )
    root.current.querySelectorAll('[data-why]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <section id="industries" ref={root} aria-labelledby="industries-title" className="relative section-y bg-paper">
      <div className="container-x">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="label-mono mb-6 flex items-center gap-3 text-steel-700">
              <span className="h-px w-8 bg-red" aria-hidden />
              {t.label}
            </p>
            <H id="industries-title" className="text-h2 max-w-[16ch]">
              {t.title}
            </H>
          </div>
          <p className="max-w-[44ch] text-steel-700 md:col-span-5">{t.lead}</p>
        </div>

        {/* counters */}
        <dl className="mt-12 grid grid-cols-2 gap-y-10 border-y border-steel-300 py-10 md:mt-16 lg:grid-cols-4">
          {counters.map((c, i) => (
            <div key={c.label} className="flex flex-col gap-3 px-1 lg:px-6 lg:not-first:border-l lg:not-first:border-steel-300">
              <dt className="label-mono order-2 text-steel-700">
                {c.label}
                {c.note && <span className="mt-1 block text-steel-500">{c.note}</span>}
              </dt>
              <dd className="display-wide order-1 text-[clamp(2.3rem,1.4rem+2.6vw,3.6rem)] leading-none tracking-[-0.03em] whitespace-nowrap tabular-nums">
                <span ref={(el) => (nums.current[i] = el)}>{fmt(c.value, c.decimals)}</span>
                {c.suffix && <span className="text-[0.5em] tracking-normal text-red">{c.suffix}</span>}
              </dd>
            </div>
          ))}
          {/* ISO badge (a certification, not a count) */}
          <div className="flex flex-col gap-3 px-1 lg:border-l lg:border-steel-300 lg:px-6">
            <dt className="label-mono order-2 text-steel-700">{t.iso.note}</dt>
            <dd className="order-1">
              <span className="inline-flex items-center gap-2.5 rounded-xs border border-ink px-3 py-2">
                <svg viewBox="0 0 24 24" className="size-6 text-red" aria-hidden>
                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M7.5 12.5 l3 3 l6 -7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="display-wide text-[clamp(1.1rem,0.8rem+0.9vw,1.5rem)] leading-none">{t.iso.title}</span>
              </span>
            </dd>
          </div>
        </dl>

        <div className="mt-16 grid gap-14 lg:grid-cols-12 lg:gap-10">
          {/* why us */}
          <div className="min-w-0 lg:col-span-7">
            <h3 className="text-h3">{t.whyTitle}</h3>
            <DimensionLine length="min(100%, 22rem)" label="6 REASONS" className="mt-4" />
            <ul className="mt-8 grid gap-px border border-steel-300 bg-steel-300 sm:grid-cols-2">
              {t.why.map((w) => (
                <li key={w.title} data-why tabIndex={0} className="group shine flex gap-4 bg-paper p-5 outline-none focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-red sm:p-6">
                  <WhyIcon kind={w.icon} />
                  <div>
                    <p className="font-display text-[1.05rem] font-[760] [font-stretch:112%]">{w.title}</p>
                    <p className="mt-1 text-small text-steel-700">{w.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* industries */}
          <div className="min-w-0 lg:col-span-5">
            <h3 className="text-h3">{t.listTitle}</h3>
            <ol className="mt-8 border-t border-steel-300">
              {t.list.map((ind, i) => (
                <li key={ind.key} className="group relative flex items-center gap-4 border-b border-steel-300 py-4">
                  <span className="absolute bottom-[-1px] left-0 h-px w-full origin-left scale-x-0 bg-red transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-x-100" aria-hidden />
                  <span className="font-mono text-small text-red">0{i + 1}</span>
                  <IndustryGlyph k={ind.key} />
                  <p className="min-w-0 font-display text-[1.2rem] font-[760] transition-transform duration-500 [font-stretch:115%] group-hover:translate-x-1">{ind.name}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {SHOW_CUSTOMERS && <Customers title={t.customersTitle} more={t.customersMore} />}
      </div>
    </section>
  )
}
