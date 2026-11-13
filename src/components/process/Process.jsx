import { useMemo, useRef } from 'react'
import gsap from 'gsap'
import { Observer } from 'gsap/Observer'
import { useGSAP } from '@gsap/react'
import { content } from '../../data/content.js'
import { prefersReducedMotion } from '../../lib/device.js'
import { useLenis } from '../../lib/smoothScroll.jsx'
import { VIGNETTES } from './Vignettes.jsx'
import ScrollHint from './ScrollHint.jsx'

gsap.registerPlugin(Observer)

const t = content.process
const clamp01 = (v) => Math.min(1, Math.max(0, v))
const HINT_FIRST_MS = 4000 // chip auto-hides after this on enter
const HINT_IDLE_MS = 6000 // and comes back after this long without interaction

// The travelling part on the journey track, one look per station.
const ICON = [
  { fill: '#C4C6C7', head: false, thread: false, check: false }, // wire
  { fill: '#C4C6C7', head: true, thread: false, check: false }, // headed blank
  { fill: '#C4C6C7', head: true, thread: false, check: false }, // slotted
  { fill: '#C4C6C7', head: true, thread: true, check: false }, // threaded
  { fill: '#D9C27E', head: true, thread: true, check: false }, // hardened + plated
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

/**
 * Manufacturing journey: a pinned side-scroll at every width (phase 12C), stacked under
 * reduced motion. ONE ScrollTrigger drives ONE progress value `p`; the track position,
 * every vignette, the active step, the journey icon, the red fill and the labels are all
 * derived from it in `update(p)` (no other triggers), so they can never drift apart.
 *
 * Anchors are the panel CENTRES: step i is active, and the icon sits on node i, exactly
 * when panel i is centred, which is the middle of its vignette (lp = 0.5). After the track
 * stops, a short hold lets step 06 (Go / No-Go) play its full sequence.
 *
 * Input: vertical scrolling drives the pin as usual; sideways swipes / drags and sideways
 * trackpad deltas (GSAP Observer) and the ← / → keys scroll the PAGE by the same distance,
 * so they feed the same trigger. The stage has `touch-action: pan-y`: vertical touch
 * scrolling stays native, so the page can always be scrolled past the pin.
 */
export default function Process({ h1 = false } = {}) {
  const H = h1 ? 'h1' : 'h2'
  const section = useRef(null)
  const stage = useRef(null)
  const track = useRef(null)
  const rail = useRef(null)
  const fill = useRef(null)
  const icon = useRef(null)
  const nodes = useRef([])
  const vig = useRef([])
  const hint = useRef(null)
  const lenis = useLenis()
  const lenisRef = useRef(lenis)
  lenisRef.current = lenis
  const reduced = useMemo(() => prefersReducedMotion(), [])
  const horizontal = !reduced

  useGSAP(
    () => {
      const stations = gsap.utils.toArray('[data-station]', section.current)
      if (reduced) {
        vig.current.forEach((v, i) => v?.set(i === stations.length - 1 ? 0.48 : 0.86)) // 06: the accepted state
        return
      }
      const el = track.current
      const n = stations.length
      let lastIcon = -1
      let lastActive = -1
      const iconEls = {
        fills: icon.current.querySelectorAll('[data-fill]'),
        head: icon.current.querySelector('[data-head]'),
        thread: icon.current.querySelector('[data-thread]'),
        check: icon.current.querySelector('[data-check]'),
      }

      // Layout, measured once per refresh / resize (never inside the scroll update).
      const m = { vw: 0, shift: 1, hold: 0, total: 1, lefts: [], widths: [], rail: 0, C: [], enterLast: 0 }
      const measure = () => {
        m.vw = window.innerWidth
        m.shift = Math.max(1, el.scrollWidth - m.vw)
        m.hold = Math.round(window.innerHeight * 0.9) // step 06 plays out after the track stops
        m.total = m.shift + m.hold
        m.lefts = stations.map((s) => s.offsetLeft)
        m.widths = stations.map((s) => s.offsetWidth)
        m.rail = rail.current.offsetWidth
        // track progress at which panel i is centred in the viewport
        m.C = m.lefts.map((l, i) => clamp01((l + m.widths[i] / 2 - m.vw / 2) / m.shift))
        // track progress at which the last panel's centre enters on the right
        const L = n - 1
        m.enterLast = clamp01((m.lefts[L] + m.widths[L] / 2 - m.vw) / m.shift)
      }

      // piecewise-linear position on the rail (0..1) through the centre anchors
      const railPos = (pt) => {
        const C = m.C
        if (pt <= C[0]) return 0
        for (let k = 0; k < n - 1; k++) {
          if (pt <= C[k + 1]) {
            const span = C[k + 1] - C[k]
            return (k + (span > 1e-6 ? (pt - C[k]) / span : 1)) / (n - 1)
          }
        }
        return 1
      }
      // the step whose centre is nearest the viewport centre
      const activeAt = (pt) => {
        let best = 0
        for (let k = 1; k < n; k++) if (Math.abs(m.C[k] - pt) <= Math.abs(m.C[best] - pt)) best = k
        return best
      }

      const update = (p) => {
        const travel = p * m.total
        const pt = Math.min(1, travel / m.shift) // track progress
        const tx = -pt * m.shift
        gsap.set(el, { x: tx })
        for (let i = 0; i < n; i++) {
          let lp
          if (i === n - 1) {
            // step 06: from its centre entering on the right to the end of the hold
            const start = m.enterLast * m.shift
            lp = clamp01((travel - start) / Math.max(1, m.total - start))
          } else {
            const x = m.lefts[i] + tx
            const w = m.widths[i]
            if (x > m.vw * 1.05) lp = 0
            else if (x + w < -m.vw * 0.05) lp = 1
            else lp = clamp01(1 - (x + w / 2) / m.vw) // 0.5 = centred
          }
          vig.current[i]?.set(lp)
        }
        const j = railPos(pt)
        icon.current.style.transform = `translate3d(${j * m.rail - 32}px, 0, 0)`
        fill.current.style.transform = `scaleX(${j})`
        const a = activeAt(pt)
        if (a !== lastActive) {
          lastActive = a
          nodes.current.forEach((nd, i) => nd && (nd.dataset.state = i < a ? 'done' : i === a ? 'active' : 'todo'))
          section.current.dataset.active = String(a)
        }
        if (a !== lastIcon) {
          lastIcon = a
          const look = ICON[a]
          iconEls.fills.forEach((f) => f.setAttribute('fill', look.fill))
          iconEls.head.style.opacity = look.head ? 1 : 0
          iconEls.thread.style.opacity = look.thread ? 1 : 0
          iconEls.check.style.opacity = look.check ? 1 : 0
        }
      }

      // ── scroll hint: on enter, hide on interaction or after 4 s, back after 6 s idle ──
      const timers = { hide: 0, idle: 0 }
      let inside = false
      let enteredAt = 0
      const clear = () => (clearTimeout(timers.hide), clearTimeout(timers.idle))
      const showBriefly = () => {
        if (!inside) return
        hint.current?.show()
        clearTimeout(timers.hide)
        timers.hide = setTimeout(() => hint.current?.hide(), HINT_FIRST_MS)
        clearTimeout(timers.idle)
        timers.idle = setTimeout(showBriefly, HINT_IDLE_MS)
      }
      const interacted = () => {
        if (!inside || performance.now() - enteredAt < 1200) return // the entering scroll (and its momentum) itself
        hint.current?.hide()
        clearTimeout(timers.hide)
        clearTimeout(timers.idle)
        timers.idle = setTimeout(showBriefly, HINT_IDLE_MS)
      }

      const proxy = { p: 0 }
      const tween = gsap.to(proxy, {
        p: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: section.current,
          start: 'top top',
          end: () => `+=${m.total}`,
          pin: stage.current,
          scrub: 0.5,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefreshInit: measure,
          onRefresh: () => {
            measure()
            update(proxy.p)
          },
          onToggle: (self) => {
            inside = self.isActive
            if (inside) {
              enteredAt = performance.now()
              showBriefly()
            } else {
              clear()
              hint.current?.hide()
            }
          },
          onUpdate: interacted,
        },
        onUpdate: () => update(proxy.p),
      })
      const st = tween.scrollTrigger
      measure()
      update(0)

      // Page scroll by d px (Lenis when present), so every input feeds the same trigger.
      const scrollBy = (d, smooth = false) => {
        const l = lenisRef.current
        if (l) l.scrollTo(l.scroll + d, smooth ? { duration: 0.8 } : { immediate: true })
        else window.scrollBy({ top: d, behavior: smooth ? 'smooth' : 'instant' })
      }

      // Sideways swipe / drag / trackpad -> same progress. Finger left = forward.
      const obs = Observer.create({
        target: stage.current,
        type: 'touch,pointer,wheel',
        lockAxis: true,
        dragMinimum: 6,
        tolerance: 2,
        onChangeX: (self) => {
          if (!st.isActive) return // only while pinned; outside it the page scrolls normally
          const wheel = self.event?.type === 'wheel'
          if (wheel && Math.abs(self.deltaX) <= Math.abs(self.deltaY)) return // vertical trackpad scroll: native
          const d = wheel ? self.deltaX : -self.deltaX
          interacted()
          scrollBy(d)
        },
      })

      // ← / → step to the previous / next station while the section is pinned.
      const onKey = (e) => {
        if (!st.isActive || e.defaultPrevented || e.altKey || e.metaKey || e.ctrlKey) return
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
        if (/^(input|textarea|select)$/i.test(e.target?.tagName ?? '') || e.target?.isContentEditable) return
        const pt = clamp01((st.scroll() - st.start) / m.shift)
        const a = activeAt(pt)
        const next = Math.max(0, Math.min(n - 1, a + (e.key === 'ArrowRight' ? 1 : -1)))
        if (next === a) return
        e.preventDefault()
        interacted()
        scrollBy(st.start + m.C[next] * m.shift - st.scroll(), true)
      }
      window.addEventListener('keydown', onKey)

      return () => {
        clear()
        obs.kill()
        window.removeEventListener('keydown', onKey)
        gsap.set(el, { clearProps: 'transform' })
      }
    },
    { scope: section },
  )

  // Horizontal-layout classes, written out literally so Tailwind can see them. The pinned
  // stage starts below the fixed header + ruler (--chrome-h); columns centre with `safe`
  // alignment, so a column taller than the stage grows down instead of up under it.
  // Reduced motion: the stacked layout everywhere (no pin).
  const cx = horizontal
    ? {
        stage: 'h-[100svh] pt-[var(--chrome-h)] touch-pan-y',
        track: 'flex h-full w-max items-stretch',
        intro: 'w-[86vw] shrink-0 flex flex-col justify-center-safe pr-6 max-w-none md:w-[min(38vw,560px)] md:pr-12',
        list: 'flex gap-0 px-0 max-w-none',
        item: 'w-[86vw] shrink-0 justify-center-safe border-l border-steel-300 px-5 pb-28 md:w-[min(44vw,620px)] md:px-10 md:pb-24',
        wide: 'w-[92vw] shrink-0 justify-center-safe border-l border-steel-300 px-5 pb-28 md:w-[min(64vw,880px)] md:px-10 md:pb-24',
        spacer: 'block w-[8vw] shrink-0 md:w-[18vw]',
      }
    : { stage: '', track: 'section-y', intro: '', list: 'mt-10 grid gap-10 md:grid-cols-2 lg:grid-cols-3', item: '', wide: '', spacer: '' }

  return (
    <section id="process" ref={section} aria-labelledby="process-title" className="relative bg-paper">
      <div ref={stage} className={`relative overflow-hidden ${cx.stage}`}>
        <div className="bp-grid bp-grid-fade pointer-events-none absolute inset-0 opacity-60" aria-hidden />
        {horizontal && <ScrollHint ref={hint} />}

        <div ref={track} className={`relative will-change-transform ${cx.track}`}>
          {/* intro panel */}
          <header className={`container-x ${cx.intro}`}>
            <p className="label-mono mb-6 flex items-center gap-3 text-steel-700">
              <span className="h-px w-8 bg-red" aria-hidden />
              {t.label}
            </p>
            <H id="process-title" className="text-h2 max-w-[14ch]">
              {t.title}
            </H>
            <p className="mt-5 max-w-[36ch] text-steel-700">{t.lead}</p>
            {horizontal && (
              <p className="label-mono mt-8 flex items-center gap-3 text-steel-500" aria-hidden>
                <span className="relative block h-px w-12 overflow-hidden bg-steel-300">
                  <span className="absolute inset-y-0 left-0 w-1/2 animate-[sa-slide_1.6s_var(--ease-machine)_infinite] bg-red" />
                </span>
                {t.scrollCue}
              </p>
            )}
          </header>

          {/* stations */}
          <ol className={horizontal ? cx.list : `container-x ${cx.list}`}>
            {t.stations.map((s, i) => {
              const V = VIGNETTES[s.key]
              return (
                <li key={s.key} data-station className={`flex flex-col ${s.wide ? cx.wide : cx.item}`}>
                  <div className="mb-4 flex items-baseline gap-4">
                    <span className="font-mono text-body font-medium text-red">0{i + 1}</span>
                    <h3 className="text-h3">{s.name}</h3>
                  </div>
                  <div data-vignette className="relative aspect-[3/2] max-h-[46svh] overflow-hidden rounded-xs border border-steel-300 bg-paper">
                    <div className="bp-grid absolute inset-0 opacity-50" aria-hidden />
                    <div className="relative h-full w-full p-2">
                      <V ref={(el) => (vig.current[i] = el)} label={`${s.name}: ${s.text}`} tag={s.tag} gauge={s.gauge} />
                    </div>
                  </div>
                  <p className="label-mono mt-4 text-steel-500">{s.spec}</p>
                  <p className="mt-2 max-w-[52ch] text-steel-700">{s.text}</p>
                </li>
              )
            })}
            {horizontal && <li aria-hidden className={cx.spacer} />}
          </ol>
        </div>

        {/* journey track: driven by the same progress as the panels */}
        {horizontal && (
          <div className="pointer-events-none absolute inset-x-0 bottom-5 md:bottom-6" aria-hidden>
            <div className="container-x">
              <div className="flex items-center gap-4 md:gap-6">
                <span className="label-mono hidden shrink-0 text-steel-500 md:inline">{t.track}</span>
                <div ref={rail} className="relative h-10 flex-1">
                  <div className="absolute inset-x-0 top-1/2 h-px bg-steel-300" />
                  <div ref={fill} className="absolute inset-x-0 top-1/2 h-px origin-left bg-red" style={{ transform: 'scaleX(0)' }} />
                  {t.stations.map((s, i) => (
                    <span
                      key={s.key}
                      ref={(el) => (nodes.current[i] = el)}
                      data-state={i === 0 ? 'active' : 'todo'}
                      className="group absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${(i / (t.stations.length - 1)) * 100}%` }}
                    >
                      <span className="block size-2.5 rounded-full border border-steel-500 bg-paper transition-colors duration-300 group-data-[state=active]:scale-125 group-data-[state=active]:border-red group-data-[state=active]:bg-red group-data-[state=done]:border-red group-data-[state=done]:bg-red" />
                      <span
                        className={`label-mono absolute top-4 text-[10px] whitespace-nowrap text-steel-500 max-md:hidden max-md:group-data-[state=active]:block group-data-[state=active]:text-red group-data-[state=done]:text-ink ${
                          i === 0 ? 'left-0' : i === t.stations.length - 1 ? 'right-0' : 'left-1/2 -translate-x-1/2'
                        }`}
                      >
                        {s.short ?? s.name}
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
