import { Component, Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react'
import { content } from '../../data/content.js'
import { customiser as C, finishes } from '../../data/products.js'
import { pitchFor } from '../../three/specs.js'
import { whatsappHref } from '../../lib/contact.js'
import { dprCap, hasWebGL, isLowEnd, isSmallScreen, prefersReducedMotion } from '../../lib/device.js'
import Button from '../ui/Button.jsx'
import { WhatsAppIcon } from '../ui/Icons.jsx'
import Annotations from '../annotate/Annotations.jsx'
import TopView from './TopView.jsx'
import { topView } from '../../three/headGeometry.js'

const CustomiserScene = lazy(() => import('./CustomiserScene.jsx'))
const t = content.customise
const c = t.controls

class Boundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

/** Everything the stage, the title block and the enquiry need, from the options. */
export function describe(o) {
  const head = C.heads.find((h) => h.key === o.head)
  const material = C.materials.find((m) => m.key === o.material)
  const pitch = pitchFor(o.diameter, o.fine)
  const thread = `M${o.diameter} × ${pitch}${o.fine ? ' fine' : ''}`
  const tv = topView({ head: o.head, diameter: o.diameter, pitch })
  const r1 = (v) => String(Math.round(v * 10) / 10)
  // key top-view dimension: across flats for hex heads, head Ø for round heads
  const keyDim = tv.outline === 'hex' ? `AF ${r1(tv.af)}` : `Ø${r1(tv.dk)}`
  const dwg = `SA-${head.code}-M${o.diameter}${o.fine ? 'F' : ''}-${keyDim.replace(/[ Ø.]/g, (c) => (c === '.' ? 'P' : c === 'Ø' ? 'D' : ''))}-${o.length}-${material.short.replace(/[^A-Z0-9]/gi, '')}-${C.finishCodes[o.finish]}`
  const headSpec = content.customise.headSpec[o.head]({ af: r1(tv.af ?? 0), dk: r1(tv.dk ?? 0), key: r1(tv.key ?? 0), height: r1(tv.height) })
  return {
    head,
    tv,
    keyDim,
    headSpec,
    root: r1(tv.root),
    material,
    pitch,
    thread,
    dwg,
    part: head.part,
    lengthLabel: `${o.length} mm`,
    finishLabel: finishes[o.finish].label,
    scale: o.length <= 30 ? '2 : 1' : o.length <= 60 ? '1 : 1' : '1 : 2',
  }
}

// Annotation store shared with the lazy scene.
const store = { p: 1, anchors: null, onFrame: null }

const Chip = ({ active, disabled, onClick, children, title, className = '' }) => (
  <button
    type="button"
    aria-pressed={active}
    disabled={disabled}
    title={title}
    onClick={onClick}
    className={`rounded-xs border px-2.5 py-1.5 text-small transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-35 ${
      active ? 'border-ink bg-ink text-paper' : 'border-steel-300 bg-paper text-ink enabled:hover:border-ink'
    } ${className}`}
  >
    {children}
  </button>
)

const Group = ({ label, value, children }) => (
  <fieldset className="space-y-2.5">
    <legend className="flex w-full items-baseline justify-between">
      <span className="label-mono text-steel-500">{label}</span>
      {value && <span className="font-mono text-[12px] text-ink">{value}</span>}
    </legend>
    {children}
  </fieldset>
)

export default function Customiser({ h1 = false } = {}) {
  const H = h1 ? 'h1' : 'h2'
  const section = useRef(null)
  const stage = useRef(null)
  const [o, setO] = useState(C.defaults)
  const [mount3D, setMount3D] = useState(false)
  const [visible, setVisible] = useState(false)
  const [ready, setReady] = useState(false)
  const [view, setView] = useState('front') // phones / tablets: Front (3D) or Top
  const d = describe(o)
  const [lmin, lmax] = C.lengthRange(o.diameter)

  const profile = useMemo(() => {
    const low = isSmallScreen() || isLowEnd()
    return { reduced: prefersReducedMotion(), webgl: hasWebGL(), dpr: dprCap(), detail: low ? 'low' : 'high' }
  }, [])

  // Mount near the viewport, and only render frames while on screen.
  useEffect(() => {
    if (!profile.webgl) return
    const near = new IntersectionObserver(([e]) => e.isIntersecting && setMount3D(true), { rootMargin: '900px 0px' })
    const vis = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: '100px 0px' })
    near.observe(section.current)
    vis.observe(stage.current)
    return () => (near.disconnect(), vis.disconnect())
  }, [profile.webgl])

  const set = (patch) =>
    setO((s) => {
      const n = { ...s, ...patch }
      const [a, b] = C.lengthRange(n.diameter)
      n.length = Math.min(b, Math.max(a, n.length))
      const mat = C.materials.find((m) => m.key === n.material)
      if (!mat.finishes.includes(n.finish)) n.finish = mat.finishes[0]
      return n
    })

  const message = t.message({ part: d.part, head: d.headSpec, root: d.root, thread: d.thread, length: d.lengthLabel, material: d.material.label, finish: d.finishLabel, dwg: d.dwg })

  const items = useMemo(
    () => [
      { id: 'len', kind: 'dim', a: 'lA', b: 'lB', ea: 'lEA', eb: 'lEB', label: `L ${o.length}`, at: [0, 0.01] },
      { id: 'dia', kind: 'dim', a: 'dA', b: 'dB', label: `Ø${o.diameter}`, at: [0, 0.01] },
      { id: 'thr', kind: 'leader', anchor: 'thr', label: d.thread.replace(' fine', ''), at: [0, 0.01], dx: 34, dy: -22, len: 96, tone: 'red' },
    ],
    [o.length, o.diameter, d.thread],
  )

  return (
    <section id="customise" ref={section} aria-labelledby="customise-title" className="relative section-y bg-paper-2">
      <div className="container-x relative">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="label-mono mb-6 flex items-center gap-3 text-steel-700">
              <span className="h-px w-8 bg-red" aria-hidden />
              {t.label}
            </p>
            <H id="customise-title" className="text-h2">
              {t.title[0]} <span className="text-red">{t.title[1]}</span>
            </H>
          </div>
          <p className="max-w-[46ch] text-steel-700 md:col-span-5">{t.lead}</p>
        </div>

        <div className="mt-10 grid gap-px border border-steel-300 bg-steel-300 md:mt-14 lg:grid-cols-12">
          {/* Stage */}
          <div className="relative bg-paper lg:col-span-8">
            {/* Fixed-size box: top view card (left on desktop, toggled on phones) + 3D cell */}
            <div className="relative aspect-square overflow-hidden sm:aspect-[4/3] lg:grid lg:aspect-auto lg:h-[min(72svh,640px)] lg:grid-cols-[minmax(0,34%)_1fr]">
            <div
              id="cu-top"
              role="tabpanel"
              aria-label={t.views.top}
              className={`absolute inset-0 z-10 border-steel-300 lg:relative lg:z-auto lg:border-r ${view === 'top' ? 'visible' : 'invisible lg:visible'}`}
            >
              <TopView opts={o} pitch={d.pitch} thread={d.thread.replace(' fine', '')} reduced={profile.reduced} />
            </div>
            <div
              ref={stage}
              className={`absolute inset-0 touch-pan-y overflow-hidden select-none lg:relative ${view === 'front' ? 'visible' : 'invisible lg:visible'}`}
              aria-label={`${d.part}, ${d.thread}, ${d.lengthLabel}, ${d.finishLabel}`}
              role="img"
            >
              <div className="bp-grid bp-grid-fade absolute inset-0" aria-hidden />
              {/* poster until the 3D part is ready (also the first paint of the prerendered page) */}
              <img
                src="/hero-poster.svg"
                alt=""
                width="600"
                height="720"
                fetchPriority="high"
                decoding="async"
                className={`pointer-events-none absolute inset-0 m-auto h-[82%] w-auto transition-opacity duration-500 ${ready ? 'opacity-0' : 'opacity-100'}`}
              />
              {mount3D && (
                <Boundary>
                  <Suspense fallback={null}>
                    <div className={`absolute inset-0 transition-opacity duration-700 ${ready ? 'opacity-100' : 'opacity-0'}`}>
                      <CustomiserScene
                        opts={{ ...o, pitch: d.pitch }}
                        detail={profile.detail}
                        dpr={profile.dpr}
                        reduced={profile.reduced}
                        active={visible}
                        dragTarget={stage}
                        store={store}
                        onReady={() => setReady(true)}
                      />
                    </div>
                  </Suspense>
                </Boundary>
              )}
              <div className={`transition-opacity duration-500 ${ready ? 'opacity-100' : 'opacity-0'}`}>
                <Annotations store={store} items={items} compact={false} id="cu" />
              </div>
              <p className="label-mono pointer-events-none absolute top-4 left-4 text-steel-500">{t.dragHint}</p>
            </div>
            </div>

            {/* Front / Top switch (below lg; the box above keeps its height) */}
            <div role="tablist" aria-label={t.views.label} className="flex border-t border-steel-300 lg:hidden">
              {['front', 'top'].map((k) => (
                <button
                  key={k}
                  type="button"
                  role="tab"
                  aria-selected={view === k}
                  aria-controls={k === 'top' ? 'cu-top' : undefined}
                  onClick={() => setView(k)}
                  className={`label-mono flex-1 py-3 text-[11px] transition-colors ${view === k ? 'bg-ink text-paper' : 'bg-paper text-ink hover:text-red'} ${k === 'top' ? 'border-l border-steel-300' : ''}`}
                >
                  {t.views[k]}
                </button>
              ))}
            </div>

            {/* Title block */}
            <dl className="grid grid-cols-2 border-t border-steel-300 font-mono text-[12px] sm:grid-cols-4" aria-live="polite">
              {[
                [t.block.part, d.part, 'col-span-2'],
                [t.block.dwg, d.dwg, 'col-span-2 text-red'],
                [t.block.thread, d.thread],
                [t.block.length, d.lengthLabel],
                [t.block.material, d.material.short],
                [t.block.finish, d.finishLabel],
                [t.block.head, d.head.std, 'col-span-2'],
                [t.block.headDim, `${d.head.label} · ${d.keyDim}`, 'col-span-2'],
                [t.block.view, t.views.block, 'col-span-2'],
                [t.block.scale, d.scale],
                [t.block.rev, 'A'],
              ].map(([k, v, cls = '']) => (
                <div key={k} className={`border-steel-300 px-3 py-2 not-last:border-b sm:border-r [&:nth-child(4n)]:sm:border-r-0 ${cls}`}>
                  <dt className="text-[10px] tracking-[0.14em] text-steel-500 uppercase">{k}</dt>
                  <dd className={`mt-0.5 truncate ${cls.includes('text-red') ? 'text-red' : 'text-ink'}`}>{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-6 bg-paper p-5 sm:p-6 lg:col-span-4">
            <Group label={c.head}>
              <div className="flex flex-wrap gap-1.5">
                {C.heads.map((h) => (
                  <Chip key={h.key} active={o.head === h.key} onClick={() => set({ head: h.key })}>
                    {h.label}
                  </Chip>
                ))}
              </div>
            </Group>

            <Group label={c.size} value={d.thread}>
              <div className="flex flex-wrap gap-1.5">
                {C.sizes.map((s) => (
                  <Chip key={s} active={o.diameter === s} onClick={() => set({ diameter: s })} className="font-mono">
                    M{s}
                  </Chip>
                ))}
              </div>
              <div className="flex gap-1.5">
                <Chip active={!o.fine} onClick={() => set({ fine: false })}>
                  {c.coarse}
                </Chip>
                <Chip active={o.fine} onClick={() => set({ fine: true })}>
                  {c.fine}
                </Chip>
              </div>
            </Group>

            <Group label={c.length} value={d.lengthLabel}>
              <input
                type="range"
                min={lmin}
                max={lmax}
                step={C.lengthStep}
                value={o.length}
                onChange={(e) => set({ length: Number(e.target.value) })}
                aria-label={c.length}
                aria-valuetext={d.lengthLabel}
                className="w-full accent-[var(--color-red)]"
              />
              <div className="flex justify-between font-mono text-[10px] text-steel-500" aria-hidden>
                <span>{lmin}</span>
                <span>{lmax}</span>
              </div>
            </Group>

            <Group label={c.material}>
              <div className="grid grid-cols-2 gap-1.5">
                {C.materials.map((m) => (
                  <Chip key={m.key} active={o.material === m.key} onClick={() => set({ material: m.key })} className="text-left">
                    {m.label}
                  </Chip>
                ))}
              </div>
            </Group>

            <Group label={c.finish} value={d.finishLabel}>
              <div className="flex flex-wrap gap-2">
                {Object.keys(C.finishCodes).map((f) => {
                  const allowed = d.material.finishes.includes(f)
                  return (
                    <button
                      key={f}
                      type="button"
                      aria-pressed={o.finish === f}
                      aria-label={finishes[f].label}
                      title={allowed ? finishes[f].label : `${finishes[f].label}: not offered for ${d.material.label}`}
                      disabled={!allowed}
                      onClick={() => set({ finish: f })}
                      className={`size-9 rounded-full border-2 transition-transform disabled:cursor-not-allowed disabled:opacity-25 ${
                        o.finish === f ? 'scale-110 border-ink' : 'border-paper shadow-[0_0_0_1px_var(--color-steel-300)]'
                      }`}
                      style={{ background: `radial-gradient(circle at 34% 28%, #fff 0%, ${finishes[f].color} 34%, color-mix(in oklab, ${finishes[f].color} 62%, #000) 100%)` }}
                    />
                  )
                })}
              </div>
            </Group>

            <div className="mt-auto space-y-3 border-t border-steel-300 pt-5">
              <Button href={whatsappHref(message)} size="lg" icon={<WhatsAppIcon />} className="w-full">
                {t.cta}
              </Button>
              <p className="label-mono text-steel-500">{t.note}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
