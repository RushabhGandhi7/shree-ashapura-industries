import { Component, Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import { content } from '../../data/content.js'
import { whatsappHref } from '../../lib/contact.js'
import { categories } from '../../data/products.js'
import { spinStore } from '../../lib/spinStore.js'
import { dprCap, hasFinePointer, hasWebGL, isLowEnd, isSmallScreen, prefersReducedMotion } from '../../lib/device.js'

// One shared canvas for all eight cards, loaded lazily when the section gets close.
const ProductViews = lazy(() => import('./ProductViews.jsx'))
const t = content.products

class Boundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {
    this.props.onFail?.()
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

function Card({ c, setSlot, touch, still, Hc = 'h3', eager = false }) {
  const ref = useRef(null)

  // Touch devices: one turn when the card scrolls into view.
  useEffect(() => {
    if (!touch) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) spinStore.kick(c.slug)
      },
      { threshold: 0.65 },
    )
    io.observe(ref.current)
    return () => io.disconnect()
  }, [touch, c.slug])

  return (
    <li>
      <Link
        ref={ref}
        to={`/products/${c.slug}`}
        onClick={() => touch && spinStore.kick(c.slug, 1400)}
        onPointerEnter={(e) => e.pointerType === 'mouse' && spinStore.set(c.slug, true)}
        onPointerLeave={() => spinStore.set(c.slug, false)}
        onFocus={() => spinStore.set(c.slug, true)}
        onBlur={() => spinStore.set(c.slug, false)}
        className="shine group flex h-full w-full flex-col bg-paper text-left transition-colors duration-300 hover:bg-white focus-visible:z-10"
      >
        {/* 3D slot: the shared canvas renders this card's View here */}
        <div className="relative aspect-[4/3] w-full overflow-hidden border-b border-steel-300/70">
          <div className="bp-grid bp-grid-fade absolute inset-0 opacity-70" aria-hidden />
          <span
            className="display-wide pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[4.5rem] leading-none text-steel-100/70 select-none"
            aria-hidden
          >
            {c.code}
          </span>
          {/* no WebGL (or the 3D chunk failed): the pre-rendered image of the same parts */}
          {still && <img src={c.image} alt="" width="1200" height="900" loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : undefined} decoding="async" className="absolute inset-0 h-full w-full object-contain" />}
          <div ref={(el) => setSlot(c.slug, el)} className="absolute inset-0" aria-hidden />
          <span className="label-mono absolute right-3 bottom-3 rounded-xs border border-steel-300 bg-paper/85 px-1.5 py-0.5 text-[10px] text-steel-700">
            {c.callout}
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-2 p-4 sm:p-5">
          <span className="font-mono text-small font-medium text-red">{c.code}</span>
          <Hc className="text-[1.15rem] leading-tight sm:text-h3">{c.name}</Hc>
          <p className="text-small leading-relaxed text-steel-700">{c.blurb}</p>
          <span className="label-mono mt-auto inline-flex items-center gap-2 pt-2 text-ink group-hover:text-red">
            {t.open}
            <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </span>
        </div>
      </Link>
    </li>
  )
}

export default function Products({ h1 = false } = {}) {
  const H = h1 ? 'h1' : 'h2'
  const section = useRef(null)
  const grid = useRef(null)
  const slotsRef = useRef({})
  const [slots, setSlots] = useState(null)
  const [mount3D, setMount3D] = useState(false)
  const [glFailed, setGlFailed] = useState(false)

  const profile = useMemo(
    () => ({
      touch: !hasFinePointer(),
      reduced: prefersReducedMotion(),
      webgl: hasWebGL(),
      dpr: dprCap(),
      quality: isSmallScreen() || isLowEnd() ? 'low' : 'high',
    }),
    [],
  )

  const setSlot = useCallback((slug, el) => {
    if (el) slotsRef.current[slug] = el
  }, [])

  // Hand the slot elements to the 3D layer once all cards have mounted.
  useEffect(() => {
    setSlots({ ...slotsRef.current })
  }, [])

  // Mount the shared canvas when the section is within ~one screen.
  useEffect(() => {
    if (!profile.webgl) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setMount3D(true)
          io.disconnect()
        }
      },
      { rootMargin: '800px 0px' },
    )
    io.observe(section.current)
    return () => io.disconnect()
  }, [profile.webgl])

  return (
    <section id="products" ref={section} aria-labelledby="products-title" className="relative section-y bg-paper">
      <div className="bp-grid bp-grid-fade pointer-events-none absolute inset-0 opacity-60" aria-hidden />
      <div className="container-x relative">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="label-mono mb-6 flex items-center gap-3 text-steel-700">
              <span className="h-px w-8 bg-red" aria-hidden />
              {t.label}
            </p>
            <H id="products-title" className="text-h2 max-w-[16ch]">
              {t.title}
            </H>
          </div>
          <div className="md:col-span-5">
            <p className="max-w-[44ch] text-steel-700">{t.lead}</p>
            <p className="label-mono mt-4 text-steel-500">{profile.touch ? t.hintTouch : t.hint}</p>
          </div>
        </div>

        <div ref={grid} className="relative mt-12 md:mt-16">
          <ul className="grid grid-cols-1 gap-px border border-steel-300 bg-steel-300 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((c, i) => (
              <Card key={c.slug} eager={i < 2} Hc={h1 ? 'h2' : 'h3'} c={c} setSlot={setSlot} touch={profile.touch} still={!profile.webgl || glFailed} />
            ))}
          </ul>
          {mount3D && slots && (
            <Boundary onFail={() => setGlFailed(true)}>
              <Suspense fallback={null}>
                <ProductViews slots={slots} container={grid} dpr={profile.dpr} quality={profile.quality} reduced={profile.reduced} />
              </Suspense>
            </Boundary>
          )}
        </div>
      </div>

      <div className="container-x relative mt-px">
        <div className="relative flex flex-col gap-5 overflow-hidden border border-t-0 border-steel-300 bg-paper-2 p-5 sm:p-7 md:flex-row md:items-center md:justify-between">
          <div className="bp-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden />
          <div className="relative">
            <p className="label-mono mb-2 flex items-center gap-2 text-red">
              <span className="size-1.5 rounded-full bg-red" aria-hidden />
              DWG → PART
            </p>
            <h3 className="text-h3 max-w-[24ch]">{t.custom.title}</h3>
            <p className="mt-2 max-w-[60ch] text-small leading-relaxed text-steel-700">{t.custom.text}</p>
          </div>
          <a
            href={whatsappHref(t.custom.message)}
            target="_blank"
            rel="noopener noreferrer"
            className="shine relative inline-flex h-12 shrink-0 items-center justify-center gap-2 self-start rounded-xs bg-red px-6 font-semibold text-paper md:self-center"
          >
            <span className="relative z-[2]">{t.custom.cta} →</span>
          </a>
        </div>
      </div>

    </section>
  )
}
