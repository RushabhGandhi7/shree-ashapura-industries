import { useMemo, useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { content } from '../../data/content.js'
import { prefersReducedMotion } from '../../lib/device.js'
import { VIGNETTES } from './Vignettes.jsx'

const t = content.process
const clamp01 = (v) => Math.min(1, Math.max(0, v))

// The travelling part on the journey track, one look per station.
const ICON = [
  { fill: '#C4C6C7', head: false, thread: false, check: false }, // wire
  { fill: '#C4C6C7', head: true, thread: false, check: false }, // headed blank
  { fill: '#C4C6C7', head: true, thread: true, check: false }, // threaded
  { fill: '#E2561C', head: true, thread: true, check: false }, // hot
  { fill: '#D9C27E', head: true, thread: true, check: false }, // plated
  { fill: '#D9C27E', head: true, thread: true, check: true }, // passed
]

function JourneyIcon({ iconRef }) {
  return (
    <svg ref={iconRef} viewBox="0 0 64 30" width="64" height="30" aria-hidden className="overflow-visible">
      <g data-body>
        <rect data-fill x="8" y="11" width="50" height="8" rx="1.5" fill="#C4C6C7" stroke="#55575A" strokeOpacity=".5" />
        <rect data-head data-fill x="2" y="4" width="9" height="22" rx="1.5" fill="#C4C6C7" stroke="#55575A" strokeOpacity=".5" style={{ opacity: 0 }} />
        <g data-thread stroke="#55575A" strokeOpacity=".55" style={{ opacity: 0 }}>
          {[24, 29, 34, 39, 44, 49, 54].map((x) => (
            <line key={x} x1={x} y1="11" x2={x + 3} y2="19" />
          ))}
        </g>
      </g>
      <path data-check d="M44 0 l5 5 l10 -11" fill="none" stroke="var(--color-red)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0 }} transform="translate(0 4)" />
    </svg>
  )
}

export default function Process() {
  const section = useRef(null)
  const stage = useRef(null)
  const track = useRef(null)
  const rail = useRef(null)
  const icon = useRef(null)
  const nodes = useRef([])
  const vig = useRef([])
  const reduced = useMemo(() => prefersReducedMotion(), [])
  const horizontal = !reduced // desktop only; phones get the stacked layout via CSS + matchMedia

  useGSAP(
    () => {
      const stations = gsap.utils.toArray('[data-station]', section.current)
      if (reduced) {
        vig.current.forEach((v) => v?.set(0.86))
        return
      }
      const mm = gsap.matchMedia()

      // Desktop: pin + horizontal scrub; one fastener travels along the journey track.
      mm.add('(min-width: 768px)', () => {
        const el = track.current
        const vw = () => window.innerWidth
        const shift = () => el.scrollWidth - vw()
        let lastStage = -1
        const iconEls = {
          fills: icon.current.querySelectorAll('[data-fill]'),
          head: icon.current.querySelector('[data-head]'),
          thread: icon.current.querySelector('[data-thread]'),
          check: icon.current.querySelector('[data-check]'),
        }
        // Layout is measured once per refresh / resize, never inside the scroll update
        // (reading offsets right after writing a transform forces a reflow every frame).
        const m = { vw: 0, shift: 1, lefts: [], widths: [], rail: 0, P: [] }
        const measure = () => {
          m.vw = vw()
          m.shift = Math.max(1, shift())
          m.lefts = stations.map((s) => s.offsetLeft)
          m.widths = stations.map((s) => s.offsetWidth)
          m.rail = rail.current.offsetWidth
          m.P = m.lefts.map((l) => (l - 0.55 * m.vw) / m.shift)
        }
        measure()
        const done = new Array(stations.length).fill(-1)
        const update = (p) => {
          const tx = -p * m.shift
          gsap.set(el, { x: tx })
          // each station's vignette runs as its panel crosses the viewport
          for (let i = 0; i < stations.length; i++) {
            const x = m.lefts[i] + tx
            const w = m.widths[i]
            let lp
            if (x > m.vw * 1.05) lp = 0
            else if (x + w < -m.vw * 0.05) lp = 1
            // 0 as the panel's centre enters on the right, 0.5 centred, 1 leaving on the left
            else lp = clamp01(1 - (x + w / 2) / m.vw)
            if (lp === done[i] && (lp === 0 || lp === 1)) continue // parked off-screen: skip
            done[i] = lp
            vig.current[i]?.set(lp)
          }
          // journey: icon position between first and last station marks
          const P = m.P
          const j = clamp01((p - P[0]) / (P[P.length - 1] - P[0]))
          const w = m.rail
          icon.current.style.transform = `translate3d(${j * w - 32}px, 0, 0)`
          const idx = Math.min(stations.length - 1, Math.round(j * (stations.length - 1)))
          nodes.current.forEach((n, i) => n && (n.dataset.on = String(i <= idx)))
          if (idx !== lastStage) {
            lastStage = idx
            const look = ICON[idx]
            iconEls.fills.forEach((f) => f.setAttribute('fill', look.fill))
            iconEls.head.style.opacity = look.head ? 1 : 0
            iconEls.thread.style.opacity = look.thread ? 1 : 0
            iconEls.check.style.opacity = look.check ? 1 : 0
          }
        }
        const proxy = { p: 0 }
        gsap.to(proxy, {
          p: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: section.current,
            start: 'top top',
            end: () => `+=${Math.max(1, shift())}`,
            pin: stage.current,
            scrub: 0.5,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onRefresh: () => {
              measure()
              update(proxy.p)
            },
          },
          onUpdate: () => update(proxy.p),
        })
        update(0)
        return () => gsap.set(el, { clearProps: 'transform' })
      })

      // Phones: stacked stations, each vignette scrubs while its card is in view.
      mm.add('(max-width: 767px)', () => {
        stations.forEach((s, i) => {
          const o = { p: 0 }
          vig.current[i]?.set(0)
          gsap.to(o, {
            p: 1,
            ease: 'none',
            scrollTrigger: { trigger: s.querySelector('[data-vignette]'), start: 'top 88%', end: 'bottom 35%', scrub: 0.4 },
            onUpdate: () => vig.current[i]?.set(o.p),
          })
        })
      })
      return () => mm.revert()
    },
    { scope: section },
  )

  // Desktop horizontal-layout classes, written out literally so Tailwind can see them.
  // Reduced motion keeps the stacked layout everywhere (no pin).
  const cx = horizontal
    ? {
        stage: 'md:h-[100svh] md:pt-[var(--nav-h)]',
        track: 'md:flex md:h-full md:w-max md:items-stretch md:py-0',
        intro: 'md:w-[min(38vw,560px)] md:shrink-0 md:flex md:flex-col md:justify-center md:pr-12 md:max-w-none',
        list: 'md:mt-0 md:flex md:gap-0 md:px-0 md:max-w-none',
        item: 'md:w-[min(44vw,620px)] md:shrink-0 md:justify-center md:border-l md:border-steel-300 md:px-10 md:pb-24',
        spacer: 'md:block md:w-[18vw] md:shrink-0',
      }
    : { stage: '', track: '', intro: '', list: 'md:grid-cols-2 lg:grid-cols-3', item: '', spacer: '' }

  return (
    <section id="process" ref={section} aria-labelledby="process-title" className="relative bg-paper">
      <div ref={stage} className={`relative overflow-hidden ${cx.stage}`}>
        <div className="bp-grid bp-grid-fade pointer-events-none absolute inset-0 opacity-60" aria-hidden />

        <div ref={track} className={`relative section-y will-change-transform ${cx.track}`}>
          {/* intro panel */}
          <header className={`container-x ${cx.intro}`}>
            <p className="label-mono mb-6 flex items-center gap-3 text-steel-700">
              <span className="h-px w-8 bg-red" aria-hidden />
              {t.label}
            </p>
            <h2 id="process-title" className="text-h2 max-w-[14ch]">
              {t.title}
            </h2>
            <p className="mt-5 max-w-[36ch] text-steel-700">{t.lead}</p>
            {horizontal && (
              <p className="label-mono mt-8 hidden items-center gap-3 text-steel-500 md:flex" aria-hidden>
                <span className="relative block h-px w-12 overflow-hidden bg-steel-300">
                  <span className="absolute inset-y-0 left-0 w-1/2 animate-[sa-slide_1.6s_var(--ease-machine)_infinite] bg-red" />
                </span>
                Scroll
              </p>
            )}
          </header>

          {/* stations */}
          <ol className={`container-x mt-10 grid gap-10 ${cx.list}`}>
            {t.stations.map((s, i) => {
              const V = VIGNETTES[s.key]
              return (
                <li
                  key={s.key}
                  data-station
                  className={`flex flex-col ${cx.item}`}
                >
                  <div className="mb-4 flex items-baseline gap-4">
                    <span className="font-mono text-body font-medium text-red">0{i + 1}</span>
                    <h3 className="text-h3">{s.name}</h3>
                  </div>
                  <div data-vignette className="relative aspect-[3/2] overflow-hidden rounded-xs border border-steel-300 bg-paper">
                    <div className="bp-grid absolute inset-0 opacity-50" aria-hidden />
                    <div className="relative h-full w-full p-2">
                      <V ref={(el) => (vig.current[i] = el)} label={`${s.name}: ${s.text}`} />
                    </div>
                  </div>
                  <p className="label-mono mt-4 text-steel-500">{s.spec}</p>
                  <p className="mt-2 max-w-[48ch] text-steel-700">{s.text}</p>
                </li>
              )
            })}
            {horizontal && <li aria-hidden className={`hidden ${cx.spacer}`} />}
          </ol>
        </div>

        {/* journey track (desktop) */}
        {horizontal && (
          <div className="pointer-events-none absolute inset-x-0 bottom-6 hidden md:block" aria-hidden>
            <div className="container-x">
              <div className="flex items-center gap-6">
                <span className="label-mono shrink-0 text-steel-500">{t.track}</span>
                <div ref={rail} className="relative h-10 flex-1">
                  <div className="absolute inset-x-0 top-1/2 h-px bg-steel-300" />
                  {t.stations.map((s, i) => (
                    <span
                      key={s.key}
                      ref={(el) => (nodes.current[i] = el)}
                      data-on="false"
                      className="group absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${(i / (t.stations.length - 1)) * 100}%` }}
                    >
                      <span className="block size-2.5 rounded-full border border-steel-500 bg-paper transition-colors duration-300 group-data-[on=true]:border-red group-data-[on=true]:bg-red" />
                      <span
                        className={`label-mono absolute top-4 text-[10px] whitespace-nowrap text-steel-500 group-data-[on=true]:text-ink ${
                          i === 0 ? 'left-0' : i === t.stations.length - 1 ? 'right-0' : 'left-1/2 -translate-x-1/2'
                        }`}
                      >
                        {s.name}
                      </span>
                    </span>
                  ))}
                  <div className="absolute top-[calc(50%-15px)] left-0 will-change-transform">
                    <JourneyIcon iconRef={icon} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
