// /products: every catalogue item by name, with a search box and product-line chips
// (phase 12B). The full list is in the markup (prerendered, crawlable); filtering is
// client-side. The chip state lives in ?c=<category slug> so a filtered view can be shared.
// No 3D here: items link to their card on the category page (/products/<category>#<slug>).
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { catalogueItems, content } from '../../data/content.js'
import { categories } from '../../data/products.js'
import SectionHead from '../ui/SectionHead.jsx'

const t = content.products.index
const nameOf = Object.fromEntries(categories.map((c) => [c.slug, c.name]))
const codeOf = Object.fromEntries(categories.map((c) => [c.slug, c.code]))
const counts = Object.fromEntries(categories.map((c) => [c.slug, catalogueItems.filter((i) => i.category === c.slug).length]))
const norm = (s) => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9#. ]+/g, ' ')

export default function CatalogueIndex() {
  const [params, setParams] = useSearchParams()
  const active = categories.some((c) => c.slug === params.get('c')) ? params.get('c') : null
  const [query, setQuery] = useState('')

  const list = useMemo(() => {
    const words = norm(query).split(/\s+/).filter(Boolean)
    return catalogueItems.filter((i) => {
      if (active && i.category !== active) return false
      const hay = norm(`${i.name} ${nameOf[i.category]} ${i.spec ?? ''} ${i.group ?? ''}`)
      return words.every((w) => hay.includes(w))
    })
  }, [query, active])

  const choose = (slug) =>
    setParams(
      (p) => {
        const n = new URLSearchParams(p)
        if (slug) n.set('c', slug)
        else n.delete('c')
        return n
      },
      { replace: true, preventScrollReset: true },
    )

  const chip = (on) =>
    `label-mono inline-flex h-9 items-center gap-2 rounded-xs border px-3 transition-colors ${on ? 'border-ink bg-ink text-paper' : 'border-steel-300 bg-paper text-ink hover:border-ink'}`

  return (
    <section id="catalogue" aria-labelledby="catalogue-title" className="relative section-y bg-paper-2">
      <div className="bp-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden />
      <div className="container-x relative">
        <SectionHead id="catalogue-title" label={t.label} title={t.title} aside={<p className="max-w-[44ch]">{t.lead}</p>} />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block w-full lg:max-w-sm">
            <span className="sr-only">{t.search}</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.placeholder}
              className="h-11 w-full rounded-xs border border-steel-300 bg-paper px-3.5 text-body outline-none placeholder:text-steel-500 focus-visible:border-ink"
            />
          </label>
          <p className="label-mono text-steel-500" aria-live="polite">
            {t.results(list.length, catalogueItems.length)}
          </p>
        </div>

        <div role="group" aria-label={t.filterLabel} className="mt-4 flex flex-wrap gap-1.5">
          <button type="button" aria-pressed={!active} onClick={() => choose(null)} className={chip(!active)}>
            {t.all} <span className="opacity-60">{catalogueItems.length}</span>
          </button>
          {categories.map((c) => (
            <button key={c.slug} type="button" aria-pressed={active === c.slug} onClick={() => choose(c.slug)} className={chip(active === c.slug)}>
              {c.name} <span className="opacity-60">{counts[c.slug]}</span>
            </button>
          ))}
        </div>

        {list.length > 0 ? (
          <ul className="mt-8 grid gap-x-8 border-t border-steel-300 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((i) => (
              <li key={i.slug} className="border-b border-steel-300">
                <Link to={`/products/${i.category}#${i.slug}`} className="group flex items-baseline gap-3 py-3 hover:text-red">
                  <span className="font-mono text-[11px] text-steel-500">{codeOf[i.category]}</span>
                  <span className="flex-1 font-medium">{i.name}</span>
                  {i.model && <span className="label-mono text-[10px] text-red">{t.model3d}</span>}
                  <span className="label-mono hidden text-[10px] text-steel-500 xl:inline">{nameOf[i.category]}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-8 border-t border-steel-300 pt-6 text-steel-700">
            {t.none}{' '}
            <Link to="/custom" className="label-mono text-ink hover:text-red">
              {t.noneCta} →
            </Link>
          </p>
        )}
      </div>
    </section>
  )
}
