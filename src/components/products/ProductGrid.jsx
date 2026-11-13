// The 8 category cards with live 3D (one shared canvas, drei Views), used on /products
// and on Home. Each card shows its pre-rendered WebP (public/products/) as a poster until
// its live view has drawn a frame. The canvas mounts only while the grid holds the page's
// WebGL slot (src/lib/glGate.js: near the viewport, at most one canvas per page).
import { Component, Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { Link } from 'react-router'
import { content } from '../../data/content.js'
import { categories } from '../../data/products.js'
import { spinStore } from '../../lib/spinStore.js'
import { useGLGate, useGLHold } from '../../lib/glGate.js'
import { hasFinePointer, hasWebGL, partDetail, prefersReducedMotion } from '../../lib/device.js'

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

function Card({ c, setSlot, touch, live, Hc, eager, compact }) {
  const ref = useRef(null)

  // Touch devices: one turn when the card scrolls into view.
  useEffect(() => {
    if (!touch) return
    const io = new IntersectionObserver(([e]) => e.isIntersecting && spinStore.kick(c.slug), { threshold: 0.65 })
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
            className={`display-wide pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 leading-none text-steel-100/70 select-none ${compact ? 'text-[3rem] sm:text-[4.5rem]' : 'text-[4.5rem]'}`}
            aria-hidden
          >
            {c.code}
          </span>
          {/* poster: the pre-rendered image of the same parts, until the live view has drawn */}
          <img
            src={c.image}
            alt=""
            width="1600"
            height="1200"
            loading={eager ? 'eager' : 'lazy'}
            fetchPriority={eager ? 'high' : undefined}
            decoding="async"
            className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-300 ${live ? 'opacity-0' : 'opacity-100'}`}
          />
          <div ref={(el) => setSlot(c.slug, el)} className="absolute inset-0" aria-hidden />
          <span className="label-mono absolute right-2 bottom-2 rounded-xs border border-steel-300 bg-paper/85 px-1.5 py-0.5 text-[10px] text-steel-700 sm:right-3 sm:bottom-3">
            {c.callout}
          </span>
        </div>

        <div className={`flex flex-1 flex-col gap-2 ${compact ? 'p-3 sm:p-4' : 'p-4 sm:p-5'}`}>
          <span className="font-mono text-small font-medium text-red">{c.code}</span>
          <Hc className={compact ? 'font-display text-[0.98rem] leading-tight font-[760] [font-stretch:110%] sm:text-[1.1rem]' : 'text-[1.15rem] leading-tight sm:text-h3'}>{c.name}</Hc>
          {!compact && <p className="text-small leading-relaxed text-steel-700">{c.blurb}</p>}
          {!compact && (
            <span className="label-mono mt-auto inline-flex items-center gap-2 pt-2 text-ink group-hover:text-red">
              {t.open}
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </span>
          )}
        </div>
      </Link>
    </li>
  )
}

/**
 * @param compact  Home: two columns on phones, no blurb
 * @param Hc       card heading element
 */
export default function ProductGrid({ compact = false, Hc = 'h3', className = '' }) {
  const grid = useRef(null)
  const slotsRef = useRef({})
  const [slots, setSlots] = useState(null)
  const [glFailed, setGlFailed] = useState(false)
  const ready = useSyncExternalStore(spinStore.subscribe, spinStore.getReady, spinStore.getReady)

  const profile = useMemo(
    () => ({
      touch: !hasFinePointer(),
      reduced: prefersReducedMotion(),
      webgl: hasWebGL(),
      quality: partDetail(),
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

  const allowed = useGLGate('products', grid, { enabled: profile.webgl && !glFailed })
  const live3D = allowed && !!slots
  useGLHold('products', live3D)

  return (
    <div ref={grid} className={`relative ${className}`}>
      <ul className={`grid gap-px border border-steel-300 bg-steel-300 lg:grid-cols-4 ${compact ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}>
        {categories.map((c, i) => (
          <Card key={c.slug} c={c} Hc={Hc} eager={i < 2} compact={compact} setSlot={setSlot} touch={profile.touch} live={live3D && !!ready[c.slug]} />
        ))}
      </ul>
      {live3D && (
        <Boundary onFail={() => setGlFailed(true)}>
          <Suspense fallback={null}>
            <ProductViews slots={slots} container={grid} touch={profile.touch} quality={profile.quality} reduced={profile.reduced} />
          </Suspense>
        </Boundary>
      )}
    </div>
  )
}

