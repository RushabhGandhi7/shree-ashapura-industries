import { Link } from 'react-router'
import { content } from '../../data/content.js'
import SectionHead from '../ui/SectionHead.jsx'
import ProductGrid from './ProductGrid.jsx'

const t = content.teasers.products

/** Home: the 8 product lines as compact live 3D cards (same grid as /products), each linking to its page. */
export default function ProductsTeaser() {
  return (
    <section id="products" aria-labelledby="products-teaser-title" className="relative section-y bg-paper">
      <div className="bp-grid bp-grid-fade pointer-events-none absolute inset-0 opacity-60" aria-hidden />
      <div className="container-x relative">
        <SectionHead
          id="products-teaser-title"
          label={t.label}
          title={t.title}
          aside={
            <>
              <p className="max-w-[44ch]">{t.lead}</p>
              <Link to="/products" className="label-mono mt-4 inline-flex items-center gap-2 text-ink hover:text-red">
                {t.cta} <span aria-hidden>→</span>
              </Link>
            </>
          }
        />
        <ProductGrid compact />
      </div>
    </section>
  )
}
