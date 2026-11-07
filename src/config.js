// Site-wide config. SITE_URL is the public origin used in canonical links, Open Graph /
// Twitter images, JSON-LD, sitemap.xml and robots.txt.
//   Browser build: Vite inlines import.meta.env.VITE_SITE_URL at build time.
//   Node scripts (sitemap, prerender): read process.env.VITE_SITE_URL.
// Set VITE_SITE_URL in Vercel (Project → Settings → Environment Variables) once the real
// domain is connected, then redeploy.
const DEFAULT_SITE_URL = 'https://shreeashapuraindustries.vercel.app'

const fromVite = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SITE_URL : undefined
const fromNode = globalThis.process?.env?.VITE_SITE_URL

export const SITE_URL = (fromVite || fromNode || DEFAULT_SITE_URL).trim().replace(/\/+$/, '')
