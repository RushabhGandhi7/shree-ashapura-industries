import { Link } from 'react-router'
import { content } from '../data/content.js'
import { categories } from '../data/products.js'
import { notFoundPage } from '../routes.js'
import Seo from '../layout/Seo.jsx'

const t = content.notFound

// Edit distance, for "Did you mean …" on a mistyped product line.
const dist = (a, b) => {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 1; j <= b.length; j++) d[0][j] = j
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
  return d[a.length][b.length]
}

/** Styled 404. With `slug` (an unknown /products/:slug) it suggests the closest product line. */
export default function NotFound({ slug }) {
  // only suggest a close match (a typo), not any product line
  const best = slug ? [...categories].sort((a, b) => dist(slug, a.slug) - dist(slug, b.slug))[0] : null
  const guess = best && dist(slug, best.slug) <= Math.max(2, Math.round(best.slug.length * 0.3)) ? best : null
  return (
    <>
      <Seo page={notFoundPage} />
      <section aria-labelledby="nf-title" className="relative min-h-[80svh] pt-[calc(var(--nav-h)+3rem)] pb-20">
        <div className="bp-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden />
        <div className="container-x relative grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="label-mono text-red">{t.code}</p>
            <h1 id="nf-title" className="mt-4 text-display-xl">
              {t.title[0]} <span className="text-red">{t.title[1]}</span>
            </h1>
            <p className="mt-6 max-w-[44ch] text-body-lg text-steel-700">{slug ? t.category(slug) : t.lead}</p>
            {guess && (
              <p className="mt-4 text-body-lg">
                {t.didYouMean}{' '}
                <Link to={`/products/${guess.slug}`} className="font-semibold text-red underline underline-offset-4">
                  {guess.name}
                </Link>
                ?
              </p>
            )}
            <Link to="/" className="label-mono mt-8 inline-flex items-center gap-2 text-ink hover:text-red">
              ← {t.home}
            </Link>
          </div>
          {/* a hex nut with no thread: the missing part */}
          <svg viewBox="0 0 200 200" className="w-full max-w-[18rem] text-ink lg:col-span-5 lg:justify-self-end" aria-hidden>
            <path d="M100 20 L169 60 V140 L100 180 L31 140 V60 Z" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="100" cy="100" r="34" fill="none" stroke="var(--color-red)" strokeWidth="2" strokeDasharray="6 6" />
            <path d="M20 100 H70 M130 100 H180" stroke="var(--color-steel-500)" strokeDasharray="4 6" />
            <text x="100" y="106" textAnchor="middle" className="font-mono" fontSize="14" fill="var(--color-red)">
              404
            </text>
          </svg>
        </div>
        <div className="container-x relative mt-16 grid gap-10 sm:grid-cols-2">
          <div>
            <p className="label-mono mb-3 text-steel-500">{t.links}</p>
            <ul className="space-y-2">
              {content.nav.links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="font-medium hover:text-red">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="label-mono mb-3 text-steel-500">{content.footer.productsTitle}</p>
            <ul className="space-y-2">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link to={`/products/${c.slug}`} className="font-medium hover:text-red">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  )
}
