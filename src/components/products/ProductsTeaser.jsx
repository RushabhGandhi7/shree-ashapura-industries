import { Link } from 'react-router'
import { content } from '../../data/content.js'
import { categories } from '../../data/products.js'

const t = content.teasers.products

/** Home: the 8 product lines as light image cards (pre-rendered parts, no 3D), each linking to its page. */
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
        <ul className="mt-10 grid grid-cols-2 gap-px border border-steel-300 bg-steel-300 md:mt-14 lg:grid-cols-4">
          {categories.map((c) => (
            <li key={c.slug}>
              <Link to={`/products/${c.slug}`} className="shine group flex h-full flex-col bg-paper transition-colors hover:bg-white">
                <span className="relative block aspect-[4/3] overflow-hidden border-b border-steel-300/70">
                  <img
                    src={c.image}
                    alt=""
                    width="1200"
                    height="900"
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-contain transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-[1.05] motion-reduce:transition-none"
                  />
                </span>
                <span className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
                  <span className="font-mono text-[11px] text-red">{c.code}</span>
                  <span className="font-display text-[0.98rem] leading-tight font-[760] [font-stretch:110%] sm:text-[1.1rem]">{c.name}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
