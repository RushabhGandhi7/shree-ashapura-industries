import { Link } from 'react-router'
import { content, company } from '../../data/content.js'
import { categories } from '../../data/products.js'
import { telHref, whatsappHref, mailtoHref } from '../../lib/contact.js'
import { useLenis, scrollToTarget } from '../../lib/smoothScroll.jsx'
import Logo from '../ui/Logo.jsx'
import DimensionLine from '../ui/DimensionLine.jsx'
import { ArrowUp } from '../ui/Icons.jsx'

const t = content.footer

export default function Footer() {
  const lenis = useLenis()
  const year = new Date().getFullYear()

  const toTop = (e) => {
    e.preventDefault()
    scrollToTarget(lenis, 0)
  }

  return (
    <footer className="relative overflow-hidden border-t border-steel-300 bg-paper-2">
      <div className="bp-grid bp-grid-fade pointer-events-none absolute inset-0 opacity-70" aria-hidden />

      <div className="container-x relative pt-section-sm pb-10 md:pt-section-md lg:pt-section-lg">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-12">
          <div className="sm:col-span-2 lg:col-span-5">
            <Logo size="footer" />
            <p className="mt-6 max-w-[38ch] text-steel-700">{t.blurb}</p>
          </div>

          <div className="lg:col-span-3">
            <h2 className="label-mono mb-4 font-medium [font-stretch:100%] text-steel-500">{t.addressTitle}</h2>
            <address className="not-italic leading-relaxed text-ink">
              {company.address.lines.map((l) => (
                <span key={l} className="block">
                  {l}
                </span>
              ))}
            </address>
          </div>

          <div className="lg:col-span-2">
            <h2 className="label-mono mb-4 font-medium [font-stretch:100%] text-steel-500">{t.contactTitle}</h2>
            <dl className="space-y-3 text-small">
              <div>
                <dt className="text-steel-700">{t.mobile}</dt>
                <dd className="flex flex-col">
                  <a href={telHref()} className="inline-block py-1 font-medium whitespace-nowrap hover:text-red">
                    {company.phone.display}
                  </a>
                  <a
                    href={whatsappHref(content.whatsappMessages.general)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block py-1 font-medium text-red hover:text-red-deep"
                  >
                    {content.nav.whatsapp} →
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-steel-700">{t.landline}</dt>
                <dd>
                  <a href={telHref(company.landline.e164)} className="inline-block py-1 font-medium hover:text-red">
                    {company.landline.display}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-steel-700">{t.email}</dt>
                <dd>
                  {company.emails.map((e) => (
                    <a key={e} href={mailtoHref({ to: e })} className="block py-1 font-medium [overflow-wrap:anywhere] hover:text-red">
                      {e}
                    </a>
                  ))}
                </dd>
              </div>
            </dl>
          </div>

          <nav aria-label="Footer" className="grid gap-10 sm:col-span-2 sm:grid-cols-2 lg:col-span-12 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <h2 className="label-mono mb-4 font-medium [font-stretch:100%] text-steel-500">{t.linksTitle}</h2>
              <ul className="space-y-2 text-small">
                <li>
                  <Link to="/" className="font-medium hover:text-red">
                    {content.pages.home_crumb}
                  </Link>
                </li>
                {content.nav.links.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="font-medium hover:text-red">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-9">
              <h2 className="label-mono mb-4 font-medium [font-stretch:100%] text-steel-500">{t.productsTitle}</h2>
              {/* even grid: 8 lines = 2 full rows of 4 on desktop, 4 rows of 2 below */}
              <ul className="grid grid-cols-2 gap-x-8 gap-y-2 text-small lg:grid-cols-4">
                {categories.map((c) => (
                  <li key={c.slug}>
                    <Link to={`/products/${c.slug}`} className="font-medium hover:text-red">
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>

        {/* company name on a dimension line, title block style */}
        <div className="mt-12 md:mt-16">
          <DimensionLine length="100%" label={company.name.toUpperCase()} tone="steel" />
        </div>

        <div className="mt-6 flex flex-col gap-4 border-t border-steel-300 pt-6 text-small text-steel-700 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {company.name}. {t.rights}
          </p>
          <p className="label-mono text-steel-500">{t.drawingNo}</p>
          <a href="#main" onClick={toTop} className="inline-flex items-center gap-2 font-medium text-ink hover:text-red">
            {t.backToTop} <ArrowUp />
          </a>
        </div>
      </div>
    </footer>
  )
}
