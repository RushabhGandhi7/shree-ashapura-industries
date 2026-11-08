// Route list + per-page SEO data. Plain data (no React), so the build scripts
// (scripts/prerender.mjs, scripts/sitemap.mjs) can import it in Node too.
import { company, content } from './data/content.js'
import { categories } from './data/products.js'
import { SITE_URL } from './config.js'

export const SITE = SITE_URL // from VITE_SITE_URL (src/config.js)
const P = content.pages

const page = (path, key, extra = {}) => ({
  path,
  title: P[key].title,
  description: P[key].description,
  crumbs: path === '/' ? [] : [{ name: P[key].crumb, path }],
  image: '/products/og-products.jpg',
  ...extra,
})

export const pages = [
  page('/', 'home', { priority: 1 }),
  page('/products', 'products', { priority: 0.9 }),
  ...categories.map((c) => ({
    path: `/products/${c.slug}`,
    title: P.category.title(c),
    description: P.category.description(c),
    crumbs: [
      { name: P.products.crumb, path: '/products' },
      { name: c.name, path: `/products/${c.slug}` },
    ],
    image: c.image,
    category: c.slug,
    priority: 0.8,
  })),
  page('/custom', 'custom', { priority: 0.8 }),
  page('/manufacturing', 'manufacturing', { priority: 0.7 }),
  page('/quality', 'quality', { priority: 0.7 }),
  page('/about', 'about', { priority: 0.6 }),
  page('/gallery', 'gallery', { priority: 0.5 }),
  page('/contact', 'contact', { priority: 0.8 }),
]

export const notFoundPage = { path: '/404', title: P.notFound.title, description: P.notFound.description, crumbs: [{ name: P.notFound.crumb, path: '/404' }], image: '/products/og-products.jpg', noindex: true }

export const findPage = (pathname) => pages.find((p) => p.path === (pathname.replace(/\/+$/, '') || '/'))

export const fullTitle = (p) => (p.path === '/' ? p.title : `${p.title}${P.titleSuffix}`)

/** JSON-LD objects for a page. */
export function structuredData(p) {
  const business = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE}/#business`,
    name: company.name,
    slogan: company.tagline,
    description: P.home.description,
    foundingDate: String(company.founded),
    url: `${SITE}/`,
    image: `${SITE}/products/og-products.jpg`,
    logo: `${SITE}/brand/sa-logo.png`,
    telephone: company.phone.e164,
    email: company.emails[0],
    address: {
      '@type': 'PostalAddress',
      streetAddress: company.address.street,
      addressLocality: company.address.locality,
      addressRegion: 'Maharashtra',
      postalCode: company.address.postalCode,
      addressCountry: 'IN',
    },
    contactPoint: [
      { '@type': 'ContactPoint', telephone: company.phone.e164, email: company.emails[0], contactType: 'sales', availableLanguage: ['en', 'hi', 'gu'] },
      { '@type': 'ContactPoint', telephone: company.landline.e164, email: company.emails[1], contactType: 'customer service' },
    ],
    areaServed: 'IN',
  }
  const out = [business]
  if (p.crumbs?.length && !p.noindex)
    out.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [{ name: P.home_crumb, path: '/' }, ...p.crumbs].map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: `${SITE}${c.path === '/' ? '/' : c.path}` })),
    })
  if (p.path === '/products')
    out.push({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: P.products.crumb,
      itemListElement: categories.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, url: `${SITE}/products/${c.slug}`, image: `${SITE}${c.image}` })),
    })
  const cat = p.category && categories.find((c) => c.slug === p.category)
  if (cat)
    out.push({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: cat.name,
      itemListElement: cat.items.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'Product',
          name: item,
          category: cat.name,
          image: `${SITE}${cat.image}`,
          brand: { '@type': 'Brand', name: company.name },
          manufacturer: { '@id': `${SITE}/#business` },
          ...(cat.materials.length ? { material: cat.materials.join(', ') } : {}),
        },
      })),
    })
  return out
}
