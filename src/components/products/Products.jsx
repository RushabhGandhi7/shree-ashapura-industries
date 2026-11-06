import { Component, Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { content } from '../../data/content.js'
import { categories } from '../../data/products.js'
import { spinStore } from '../../lib/spinStore.js'
import { dprCap, hasFinePointer, hasWebGL, isLowEnd, isSmallScreen, prefersReducedMotion } from '../../lib/device.js'
import ProductDrawer from './ProductDrawer.jsx'

// One shared canvas for all seven cards, loaded lazily when the section gets close.
const ProductViews = lazy(() => import('./ProductViews.jsx'))
const t = content.products

class Boundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

function Card({ c, onOpen, setSlot, touch }) {
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
      <button
        ref={ref}
        type="button"
        onClick={() => {
          if (touch) spinStore.kick(c.slug, 1400)
          onOpen(c.slug)
        }}
        onPointerEnter={(e) => e.pointerType === 'mouse' && spinStore.set(c.slug, true)}
        onPointerLeave={() => spinStore.set(c.slug, false)}
        onFocus={() => spinStore.set(c.slug, true)}
        onBlur={() => spinStore.set(c.slug, false)}
        aria-haspopup="dialog"
        className="shine group flex h-full w-full flex-col bg-paper text-left transition-colors duration-300 hover:bg-white focus-visible:z-10"
      >
        {/* 3D slot: the shared canvas renders this card's View here */}
        <div className="relative aspect-[4/3] w-full overflow-hidden border-b border-steel-300/70">
          <div className="bp-grid bp-grid-fade absolute inset-0 opacity-70" aria-hidden />
          <span
            className="display-wide pointer-events-none absolute top-1/2 left-1/2 max-sm:hidden -translate-x-1/2 -translate-y-1/2 text-[4.5rem] leading-none text-steel-100/70 select-none"
            aria-hidden
          >
            {c.code}
          </span>
          <div ref={(el) => setSlot(c.slug, el)} className="absolute inset-0" aria-hidden />
          <span className="label-mono absolute right-3 bottom-3 rounded-xs border border-steel-300 bg-paper/85 px-1.5 py-0.5 text-[10px] text-steel-700">
            {c.callout}
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-2 p-4 sm:p-5">
          <span className="font-mono text-small font-medium text-red">{c.code}</span>
          <h3 className="text-[1.15rem] leading-tight sm:text-h3">{c.name}</h3>
          <p className="text-small leading-relaxed text-steel-700 max-sm:hidden">{c.blurb}</p>
          <span className="label-mono mt-auto inline-flex items-center gap-2 pt-2 text-ink group-hover:text-red">
            {t.open}
            <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </span>
        </div>
      </button>
    </li>
  )
}

export default function Products() {
  const section = useRef(null)
  const grid = useRef(null)
  const slotsRef = useRef({})
  const [slots, setSlots] = useState(null)
  const [mount3D, setMount3D] = useState(false)
  const [openSlug, setOpenSlug] = useState(null)

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

  const active = categories.find((c) => c.slug === openSlug) ?? null

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
            <h2 id="products-title" className="text-h2 max-w-[16ch]">
              {t.title}
            </h2>
          </div>
          <div className="md:col-span-5">
            <p className="max-w-[44ch] text-steel-700">{t.lead}</p>
            <p className="label-mono mt-4 text-steel-500">{profile.touch ? t.hintTouch : t.hint}</p>
          </div>
        </div>

        <div ref={grid} className="relative mt-12 md:mt-16">
          <ul className="grid grid-cols-2 gap-px border border-steel-300 bg-steel-300 lg:grid-cols-4">
            {categories.map((c) => (
              <Card key={c.slug} c={c} onOpen={setOpenSlug} setSlot={setSlot} touch={profile.touch} />
            ))}
            <li className="flex flex-col justify-between gap-6 bg-paper-2 p-4 sm:p-6">
              <p className="label-mono text-steel-500">08</p>
              <p className="max-w-[22ch] text-body-lg text-steel-700">{content.placeholderSections.products.customCell}</p>
            </li>
          </ul>
          {mount3D && slots && (
            <Boundary>
              <Suspense fallback={null}>
                <ProductViews slots={slots} container={grid} dpr={profile.dpr} quality={profile.quality} reduced={profile.reduced} />
              </Suspense>
            </Boundary>
          )}
        </div>
      </div>

      <ProductDrawer category={active} onClose={() => setOpenSlug(null)} />
    </section>
  )
}
