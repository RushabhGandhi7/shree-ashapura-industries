import { Component, Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import { content } from '../data/content.js'
import { categories } from '../data/products.js'
import { findPage } from '../routes.js'
import { whatsappHref, telHref } from '../lib/contact.js'
import { dprCap, hasWebGL, isLowEnd, isSmallScreen, prefersReducedMotion } from '../lib/device.js'
import Seo from '../layout/Seo.jsx'
import Breadcrumbs from '../components/ui/Breadcrumbs.jsx'
import Button from '../components/ui/Button.jsx'
import SectionHead from '../components/ui/SectionHead.jsx'
import MonoLabel from '../components/ui/MonoLabel.jsx'
import { PhoneIcon, WhatsAppIcon } from '../components/ui/Icons.jsx'
import QuoteCTA from '../components/quote/QuoteCTA.jsx'
import { quoteStore } from '../lib/quoteStore.js'
import NotFound from './NotFound.jsx'
import { useGLGate, useGLHold } from '../lib/glGate.js'

const CategoryStage = lazy(() => import('../components/products/CategoryStage.jsx'))
const t = content.category

class Boundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

function Related({ current }) {
  const i = categories.findIndex((c) => c.slug === current)
  const list = [1, 2, 3].map((k) => categories[(i + k) % categories.length])
  return (
    <section aria-labelledby="related-title" className="relative section-y bg-paper-2">
      <div className="container-x">
        <SectionHead id="related-title" titleClassName="text-h3" title={t.related} />
        <ul className="grid gap-px border border-steel-300 bg-steel-300 sm:grid-cols-3">
          {list.map((c) => (
            <li key={c.slug}>
              <Link to={`/products/${c.slug}`} className="shine group flex h-full bg-paper hover:bg-white max-sm:items-center sm:flex-col">
                <img src={c.image} alt="" width="1200" height="900" loading="lazy" decoding="async" className="aspect-[4/3] w-full border-steel-300/70 object-contain max-sm:w-32 max-sm:shrink-0 max-sm:border-r sm:border-b" />
                <span className="flex flex-1 items-center justify-between gap-3 p-4">
                  <span className="font-display text-[1.05rem] leading-tight font-[760] [font-stretch:110%]">{c.name}</span>
                  <span className="label-mono text-steel-700 group-hover:text-red">{t.view} →</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default function Category() {
  // Kept from the first render: during the exit fade the URL already points elsewhere.
  const [slug] = useState(useParams().slug)
  const c = categories.find((x) => x.slug === slug)
  const profile = useMemo(
    () => ({ three: hasWebGL() && !prefersReducedMotion(), detail: isSmallScreen() || isLowEnd() ? 'low' : 'high', dpr: dprCap() }),
    [],
  )
  const [ready, setReady] = useState(false)
  const stageBox = useRef(null)
  const allowed = useGLGate('category', stageBox, { enabled: profile.three })
  useGLHold('category', allowed)
  useEffect(() => {
    if (!allowed) setReady(false)
  }, [allowed])
  if (!c) return <NotFound slug={slug} />
  const page = findPage(`/products/${c.slug}`)

  return (
    <>
      <Seo page={page} />
      <Breadcrumbs crumbs={page.crumbs} />
      <section aria-labelledby="category-title" className="relative pb-16 pt-8 md:pb-24 md:pt-12">
        <div className="bp-grid bp-grid-fade pointer-events-none absolute inset-0 opacity-60" aria-hidden />
        <div className="container-x relative grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <p className="font-mono text-body font-medium text-red">{c.code}</p>
            <h1 id="category-title" className="mt-3 text-display-lg">
              {c.name}
            </h1>
            <p className="mt-5 max-w-[44ch] text-body-lg text-steel-700">{c.blurb}</p>
            <div className="mt-8 flex flex-wrap gap-2.5">
              <Button href={whatsappHref(t.quoteMsg(c.name))} icon={<WhatsAppIcon />}>
                {t.quote}
              </Button>
              <Button href={telHref()} variant="outline" icon={<PhoneIcon />}>
                {t.call}
              </Button>
            </div>
          </div>
          {/* 3D stage over the rendered image (the image stays as fallback / first paint) */}
          <div ref={stageBox} className="relative aspect-[4/3] overflow-hidden rounded-xs border border-steel-300 bg-paper lg:col-span-7">
            <img
              src={c.image}
              alt={t.imageAlt(c.name)}
              width="1200"
              height="900"
              fetchPriority="high"
              className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-500 ${ready ? 'opacity-0' : 'opacity-100'}`}
            />
            {allowed && (
              <Boundary>
                <Suspense fallback={null}>
                  <CategoryStage category={c} detail={profile.detail} dpr={profile.dpr} onReady={() => setReady(true)} />
                </Suspense>
              </Boundary>
            )}
            <span className="label-mono absolute right-3 bottom-3 rounded-xs border border-steel-300 bg-paper/85 px-1.5 py-0.5 text-[10px] text-steel-700">
              {c.callout}
            </span>
          </div>
        </div>
      </section>

      <section aria-labelledby="items-title" className="relative section-y bg-paper pt-0!">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <h2 id="items-title" className="label-mono mb-4 font-medium [font-stretch:100%] text-steel-500">
              {t.items}
            </h2>
            <ul className="grid gap-x-8 border-t border-steel-300 sm:grid-cols-2">
              {c.items.map((item, i) => (
                <li key={item} className="flex items-baseline gap-3 border-b border-steel-300 py-3">
                  <span className="font-mono text-[11px] text-steel-500">{String(i + 1).padStart(2, '0')}</span>
                  <span className="font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <aside className="space-y-8 lg:col-span-4">
            {c.materials.length > 0 && (
              <div>
                <h2 className="label-mono mb-3 font-medium [font-stretch:100%] text-steel-500">{t.materials}</h2>
                <ul className="flex flex-wrap gap-1.5">
                  {c.materials.map((m) => (
                    <li key={m}>
                      <MonoLabel>{m}</MonoLabel>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {c.notes.length > 0 && (
              <div>
                <h2 className="label-mono mb-3 font-medium [font-stretch:100%] text-steel-500">{t.notes}</h2>
                <ul className="space-y-1.5">
                  {c.notes.map((n) => (
                    <li key={n} className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-red" aria-hidden />
                      {n}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="border border-steel-300 bg-paper-2 p-5">
              <p className="text-small text-steel-700">{t.custom}</p>
              <Link to="/custom" onClick={() => quoteStore.set(c.slug)} className="label-mono mt-3 inline-flex items-center gap-2 text-ink hover:text-red">
                {t.customCta} <span aria-hidden>→</span>
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <Related current={c.slug} />
      <QuoteCTA initial={c.slug} />
    </>
  )
}
