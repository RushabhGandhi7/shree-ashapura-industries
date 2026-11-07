import { useId, useState, useSyncExternalStore } from 'react'
import { content } from '../../data/content.js'
import { categories } from '../../data/products.js'
import { quoteStore } from '../../lib/quoteStore.js'
import { whatsappHref } from '../../lib/contact.js'
import Button from '../ui/Button.jsx'
import { WhatsAppIcon } from '../ui/Icons.jsx'

const t = content.quote
const OTHER = 'other'

/** "Request a custom quote": pick a product line (preselected from a drawer), add details, send on WhatsApp. */
export default function QuoteCTA({ initial } = {}) {
  const stored = useSyncExternalStore(quoteStore.subscribe, quoteStore.get)
  const [touched, setTouched] = useState(false)
  // On a category page the band starts on that category until the visitor picks another.
  const selected = !touched && initial ? initial : stored
  const [details, setDetails] = useState('')
  const id = useId()
  const current = selected ?? OTHER
  const name = categories.find((c) => c.slug === current)?.name ?? t.other
  const href = whatsappHref(t.message({ category: name, details: details.trim() }))

  return (
    <section id="quote" aria-labelledby="quote-title" className="relative overflow-hidden border-y border-steel-300 bg-paper-2 py-16 md:py-24">
      <div className="bp-grid pointer-events-none absolute inset-0 opacity-50" aria-hidden />
      <div className="container-x relative grid gap-10 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-5">
          <h2 id="quote-title" className="text-h2 max-w-[14ch]">
            {t.title[0]} <span className="text-red">{t.title[1]}</span>
          </h2>
          <p className="mt-5 max-w-[42ch] text-steel-700">{t.lead}</p>
        </div>

        <div className="space-y-6 lg:col-span-7">
          <fieldset>
            <legend className="label-mono mb-3 text-steel-500">{t.categoryLabel}</legend>
            <div className="flex flex-wrap gap-1.5">
              {[...categories.map((c) => [c.slug, c.name]), [OTHER, t.other]].map(([slug, label]) => (
                <button
                  key={slug}
                  type="button"
                  aria-pressed={current === slug}
                  onClick={() => (setTouched(true), quoteStore.set(slug === OTHER ? null : slug))}
                  className={`rounded-xs border px-3 py-2 text-small transition-colors duration-200 ${
                    current === slug ? 'border-ink bg-ink text-paper' : 'border-steel-300 bg-paper text-ink hover:border-ink'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor={id} className="label-mono mb-2 flex items-baseline justify-between text-steel-500">
              <span>{t.detailsLabel}</span>
              <span className="text-[10px]">{t.optional}</span>
            </label>
            <input
              id={id}
              type="text"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={t.detailsHint}
              className="h-12 w-full rounded-xs border border-steel-300 bg-paper px-4 text-body placeholder:text-steel-500 focus:border-ink focus:outline-none"
            />
          </div>

          <Button href={href} target="_blank" rel="noopener noreferrer" icon={<WhatsAppIcon />} size="lg" className="max-sm:w-full">
            {t.cta}
          </Button>
        </div>
      </div>
    </section>
  )
}
