import { content } from '../../data/content.js'
import SectionHead from '../ui/SectionHead.jsx'
import ProductGrid from './ProductGrid.jsx'

const t = content.products

export default function Products({ h1 = false } = {}) {
  const H = h1 ? 'h1' : 'h2'

  return (
    <section id="products" aria-labelledby="products-title" className="relative section-y bg-paper">
      <div className="bp-grid bp-grid-fade pointer-events-none absolute inset-0 opacity-60" aria-hidden />
      <div className="container-x relative">
        <SectionHead
          id="products-title"
          as={H}
          label={t.label}
          title={t.title}
          aside={
            <>
              <p className="max-w-[44ch]">{t.lead}</p>
              <p className="mt-3 max-w-[44ch]">{t.catalogue.kits}</p>
              {/* range + materials from the catalogue: mono spec lines, text only */}
              <dl className="label-mono mt-4 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-ink">
                <dt className="text-steel-500">{t.catalogue.rangeLabel}</dt>
                <dd>{t.catalogue.range}</dd>
                <dt className="text-steel-500">{t.catalogue.materialsLabel}</dt>
                <dd>{t.catalogue.materials.join(' · ')}</dd>
              </dl>
              {/* Both hints are in the markup and CSS picks one by pointer type (same media query
                  as hasFinePointer), so the prerendered page already shows the right one and
                  the cards below never move when React renders. */}
              <p className="label-mono mt-4 text-steel-500">
                <span className="hidden [@media(hover:hover)_and_(pointer:fine)]:inline">{t.hint}</span>
                <span className="[@media(hover:hover)_and_(pointer:fine)]:hidden">{t.hintTouch}</span>
              </p>
            </>
          }
        />

        <ProductGrid Hc={h1 ? 'h2' : 'h3'} />
      </div>
    </section>
  )
}
