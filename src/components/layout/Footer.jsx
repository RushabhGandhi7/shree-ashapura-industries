import { content, company } from '../../data/content.js'
import { telHref, whatsappHref, mailtoHref } from '../../lib/contact.js'
import { useLenis, scrollToTarget } from '../../lib/smoothScroll.jsx'
import Logo from '../ui/Logo.jsx'
import DimensionLine from '../ui/DimensionLine.jsx'
import { ArrowUp } from '../ui/Icons.jsx'

const t = content.footer

export default function Footer() {
  const lenis = useLenis()
  const year = new Date().getFullYear()

  const go = (e, id) => {
    e.preventDefault()
    scrollToTarget(lenis, id)
  }

  return (
    <footer className="relative overflow-hidden border-t border-steel-300 bg-paper-2">
      <div className="bp-grid bp-grid-fade pointer-events-none absolute inset-0 opacity-70" aria-hidden />

      <div className="container-x relative pt-20 pb-10 md:pt-28">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Logo />
            <p className="mt-6 max-w-[38ch] text-steel-700">{t.blurb}</p>
          </div>

          <div className="md:col-span-3">
            <h2 className="label-mono mb-4 font-medium [font-stretch:100%] text-steel-500">{t.addressTitle}</h2>
            <address className="not-italic leading-relaxed text-ink">
              {company.address.lines.map((l) => (
                <span key={l} className="block">
                  {l}
                </span>
              ))}
            </address>
          </div>

          <div className="md:col-span-2">
            <h2 className="label-mono mb-4 font-medium [font-stretch:100%] text-steel-500">{t.contactTitle}</h2>
            <dl className="space-y-3 text-small">
              <div>
                <dt className="text-steel-700">{t.mobile}</dt>
                <dd className="flex flex-col">
                  <a href={telHref()} className="font-medium whitespace-nowrap hover:text-red">
                    {company.phone.display}
                  </a>
                  <a
                    href={whatsappHref(content.whatsappMessages.general)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-red hover:text-red-deep"
                  >
                    {content.nav.whatsapp} →
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-steel-700">{t.landline}</dt>
                <dd>
                  <a href={telHref(company.landline.e164)} className="font-medium hover:text-red">
                    {company.landline.display}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-steel-700">{t.email}</dt>
                <dd>
                  <a href={mailtoHref()} className="font-medium break-all hover:text-red">
                    {company.email}
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          <nav aria-label="Footer" className="md:col-span-2">
            <h2 className="label-mono mb-4 font-medium [font-stretch:100%] text-steel-500">{t.linksTitle}</h2>
            <ul className="space-y-2 text-small">
              {content.nav.links.map((l) => (
                <li key={l.id}>
                  <a href={`#${l.id}`} onClick={(e) => go(e, l.id)} className="font-medium hover:text-red">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Oversized wordmark measured by a dimension line, title block style */}
        <div className="@container mt-20 md:mt-28">
          <DimensionLine length="100%" label={company.name.toUpperCase()} tone="steel" />
          <p
            className="display-wide mt-4 text-[13.4cqi] leading-[0.85] tracking-[-0.04em] text-ink select-none"
            aria-hidden
          >
            ASHAPURA<span className="text-red">.</span>
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-steel-300 pt-6 text-small text-steel-700 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {company.name}. {t.rights}
          </p>
          <p className="label-mono text-steel-500">{t.drawingNo}</p>
          <a href="#top" onClick={(e) => go(e, 'top')} className="inline-flex items-center gap-2 font-medium text-ink hover:text-red">
            {t.backToTop} <ArrowUp />
          </a>
        </div>
      </div>
    </footer>
  )
}
