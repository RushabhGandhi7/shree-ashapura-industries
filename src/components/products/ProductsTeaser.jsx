import { Link } from 'react-router'
import { content } from '../../data/content.js'
import ProductGrid from './ProductGrid.jsx'

const t = content.teasers.products

/** Home: the 8 product lines as compact live 3D cards (same grid as /products), each linking to its page. */
export default function ProductsTeaser() {
  return (
    <section id="products" aria-labelledby="products-teaser-title" className="relative section-y bg-paper">
      <div className="bp-grid bp-grid-fade pointer-events-none absolute inset-0 opacity-60" aria-hidden />
      <div className="container-x relative">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="label-mono mb-6 flex items-center gap-3 text-steel-700">
              <span className="h-px w-8 bg-red" aria-hidden />
              {t.label}
            </p>
            <h2 id="products-teaser-title" className="text-h2 max-w-[16ch]">
              {t.title}
            </h2>
            <p className="mt-4 max-w-[48ch] text-steel-700">{t.lead}</p>
          </div>
          <Link to="/products" className="label-mono inline-flex items-center gap-2 text-ink hover:text-red">
            {t.cta} <span aria-hidden>→</span>
          </Link>
        </div>
        <ProductGrid compact className="mt-10 md:mt-14" />
      </div>
    </section>
  )
}
