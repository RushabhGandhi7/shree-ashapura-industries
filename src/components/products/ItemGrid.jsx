// Every catalogue item of one category (phase 12B): equal 4:3 cards, 2 / 3 / 4 per row.
// Items with a `model` render real procedural 3D through the SAME shared-canvas layer as
// the category grid (ProductViews: one <Canvas>, one drei <View> per 3D card, gated by
// glGate so the page never holds more than one WebGL context). Their poster
// (public/products/items/<model>.webp, `npm run render:products`) shows until the live view
// has drawn. Every other item is a blueprint line drawing (ItemDrawing) with a "Photo coming"
// tag, or its real photo once `photo` is set in content.js.
// A filler tile spans exactly the cells left in the last row at each breakpoint, so no
// grid ever shows an empty cell.
import { Component, Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { Link } from 'react-router'
import { content, itemsOf } from '../../data/content.js'
import { itemModels } from '../../data/products.js'
import { spinStore } from '../../lib/spinStore.js'
import { useGLGate, useGLHold } from '../../lib/glGate.js'
import { hasFinePointer, hasWebGL, partDetail, prefersReducedMotion } from '../../lib/device.js'
import { scrollToTarget, useLenis } from '../../lib/smoothScroll.jsx'
import { quoteStore } from '../../lib/quoteStore.js'
import ItemDrawing from './ItemDrawing.jsx'

const ProductViews = lazy(() => import('./ProductViews.jsx'))
const t = content.category
const keyOf = (item) => `item:${item.slug}`

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

// Filler span per breakpoint for a remainder (literal classes so Tailwind sees them).
const FILL_BASE = { 0: 'hidden', 1: 'block' } // 2 columns
const FILL_MD = { 0: 'md:hidden', 1: 'md:block md:col-span-2', 2: 'md:block md:col-span-1' } // 3 columns
const FILL_LG = { 0: 'lg:hidden', 1: 'lg:block lg:col-span-3', 2: 'lg:block lg:col-span-2', 3: 'lg:block lg:col-span-1' } // 4 columns
export const fillerClass = (n) => `${FILL_BASE[n % 2]} ${FILL_MD[n % 3]} ${FILL_LG[n % 4]}`

function ItemCard({ item, code, Hc, setSlot, touch, live }) {
  const ref = useRef(null)
  const key = keyOf(item)
  const has3D = !!item.model

  useEffect(() => {
    if (!touch || !has3D) return
    const io = new IntersectionObserver(([e]) => e.isIntersecting && spinStore.kick(key), { threshold: 0.65 })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [touch, has3D, key])

  const spin = has3D
    ? {
        onPointerEnter: (e) => e.pointerType === 'mouse' && spinStore.set(key, true),
        onPointerLeave: () => spinStore.set(key, false),
        onClick: () => touch && spinStore.kick(key, 1400),
      }
    : {}

  return (
    <li id={item.slug} ref={ref} className="scroll-mt-[calc(var(--chrome-h)+1rem)]" {...spin}>
      <article className="group flex h-full flex-col bg-paper transition-colors duration-300 hover:bg-white">
        <div className="relative aspect-[4/3] w-full overflow-hidden border-b border-steel-300/70">
          <div className="bp-grid bp-grid-fade absolute inset-0 opacity-70" aria-hidden />
          {has3D ? (
            <>
              <img
                src={`/products/items/${item.model}.webp`}
                alt={t.itemAlt(item.name)}
                width="1200"
                height="900"
                loading="lazy"
                decoding="async"
                className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-300 ${live ? 'opacity-0' : 'opacity-100'}`}
              />
              <div ref={(el) => setSlot(key, el)} className="absolute inset-0" aria-hidden />
            </>
          ) : item.photo ? (
            <img src={item.photo} alt={t.photoAlt(item.name)} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <>
              <ItemDrawing kind={item.drawing} label={`DWG ${code}`} className="absolute inset-0 h-full w-full p-[6%]" />
              <span className="label-mono absolute top-2 right-2 rounded-xs border border-dashed border-steel-300 bg-paper/85 px-1.5 py-0.5 text-[9px] text-steel-500 sm:text-[10px]">
                {t.photoComing}
              </span>
            </>
          )}
          {item.group && (
            <span className="label-mono absolute top-2 left-2 rounded-xs border border-steel-300 bg-paper/85 px-1.5 py-0.5 text-[9px] text-steel-700 sm:text-[10px]">
              {t.groups[item.group]}
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
          <span className="font-mono text-[11px] text-red">{code}</span>
          <Hc className="font-display text-[0.98rem] leading-tight font-[760] [font-stretch:110%] sm:text-[1.05rem]">{item.name}</Hc>
          {item.spec && <p className="label-mono mt-auto pt-1 text-[10px] text-steel-500">{item.spec}</p>}
        </div>
      </article>
    </li>
  )
}

/**
 * @param category  category object (products.js `categories` entry)
 * @param Hc        card heading element
 */
export default function ItemGrid({ category, Hc = 'h3' }) {
  const items = useMemo(() => itemsOf(category.slug), [category.slug])
  const entries = useMemo(
    () => items.filter((i) => i.model && itemModels[i.model]).map((i) => ({ key: keyOf(i), ...itemModels[i.model] })),
    [items],
  )
  const grid = useRef(null)
  const slotsRef = useRef({})
  const [slots, setSlots] = useState(null)
  const [glFailed, setGlFailed] = useState(false)
  const ready = useSyncExternalStore(spinStore.subscribe, spinStore.getReady, spinStore.getReady)
  const lenis = useLenis()

  const profile = useMemo(() => ({ touch: !hasFinePointer(), reduced: prefersReducedMotion(), webgl: hasWebGL(), quality: partDetail() }), [])
  const setSlot = useCallback((key, el) => {
    if (el) slotsRef.current[key] = el
  }, [])
  useEffect(() => {
    setSlots({ ...slotsRef.current })
  }, [])

  const allowed = useGLGate('items', grid, { enabled: profile.webgl && entries.length > 0 && !glFailed })
  const live3D = allowed && !!slots
  useGLHold('items', live3D)

  // Deep link (/products/<category>#<item>): scroll to the card once the route has settled
  // (RouteLifecycle jumps to the top and refreshes ScrollTrigger first).
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1))
    if (!id || !items.some((i) => i.slug === id)) return
    const timer = setTimeout(() => {
      const el = document.getElementById(id)
      if (el) scrollToTarget(lenis, el, { offset: -100, duration: 0.8 })
    }, 450)
    return () => clearTimeout(timer)
  }, [items, lenis])

  return (
    <div ref={grid} className="relative">
      <ul className="grid grid-cols-2 gap-px border border-steel-300 bg-steel-300 md:grid-cols-3 lg:grid-cols-4">
        {items.map((item, i) => (
          <ItemCard
            key={item.slug}
            item={item}
            code={t.itemCode(category.code, i)}
            Hc={Hc}
            setSlot={setSlot}
            touch={profile.touch}
            live={live3D && !!ready[keyOf(item)]}
          />
        ))}
        <li className={`${fillerClass(items.length)} bg-paper-2`}>
          <div className="relative flex h-full min-h-40 flex-col justify-end gap-2 overflow-hidden p-4 sm:p-5">
            <div className="bp-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden />
            <p className="label-mono relative flex items-center gap-2 text-red">
              <span className="size-1.5 rounded-full bg-red" aria-hidden />
              {t.notListed}
            </p>
            <p className="relative max-w-[30ch] text-small text-steel-700">{t.notListedText}</p>
            <Link to="/custom" onClick={() => quoteStore.set(category.slug)} className="label-mono relative inline-flex items-center gap-2 text-ink hover:text-red">
              {t.notListedCta} <span aria-hidden>→</span>
            </Link>
          </div>
        </li>
      </ul>
      {live3D && entries.length > 0 && (
        <Boundary onFail={() => setGlFailed(true)}>
          <Suspense fallback={null}>
            <ProductViews entries={entries} slots={slots} container={grid} touch={profile.touch} quality={profile.quality} reduced={profile.reduced} />
          </Suspense>
        </Boundary>
      )}
    </div>
  )
}
