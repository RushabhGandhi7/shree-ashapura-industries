import { content } from '../../data/content.js'
import SectionHead from '../ui/SectionHead.jsx'
import { whatsappHref } from '../../lib/contact.js'
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

      <div className="container-x relative mt-px">
        <div className="relative flex flex-col gap-5 overflow-hidden border border-t-0 border-steel-300 bg-paper-2 p-5 sm:p-7 md:flex-row md:items-center md:justify-between">
          <div className="bp-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden />
          <div className="relative">
            <p className="label-mono mb-2 flex items-center gap-2 text-red">
              <span className="size-1.5 rounded-full bg-red" aria-hidden />
              {t.custom.tag}
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
