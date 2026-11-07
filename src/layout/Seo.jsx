// Per-page head tags. React 19 hoists <title>/<meta>/<link> into <head>. Every node is
// tagged data-seo: the prerendered copies are removed in main.jsx before React mounts,
// so tags are replaced, never duplicated.
import { SITE, fullTitle, structuredData } from '../routes.js'

export default function Seo({ page }) {
  const url = `${SITE}${page.path === '/' ? '/' : page.path}`
  const title = fullTitle(page)
  const image = `${SITE}${page.image}`
  return (
    <>
      <title data-seo="">{title}</title>
      <meta data-seo="" name="description" content={page.description} />
      {page.noindex ? <meta data-seo="" name="robots" content="noindex" /> : <link data-seo="" rel="canonical" href={url} />}
      <meta data-seo="" property="og:type" content="website" />
      <meta data-seo="" property="og:site_name" content="Shree Ashapura Industries" />
      <meta data-seo="" property="og:title" content={title} />
      <meta data-seo="" property="og:description" content={page.description} />
      <meta data-seo="" property="og:url" content={url} />
      <meta data-seo="" property="og:image" content={image} />
      <meta data-seo="" property="og:locale" content="en_IN" />
      <meta data-seo="" name="twitter:card" content="summary_large_image" />
      <meta data-seo="" name="twitter:title" content={title} />
      <meta data-seo="" name="twitter:description" content={page.description} />
      <meta data-seo="" name="twitter:image" content={image} />
      {structuredData(page).map((d, i) => (
        <script key={i} data-seo="" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(d) }} />
      ))}
    </>
  )
}
