# Shree Ashapura Industries: website

Marketing site for Shree Ashapura Industries (since 1990), manufacturer of fasteners and machine components for the lock and furniture industry, in Dahisar (East), Mumbai.
React + Vite, Tailwind CSS v4, GSAP + ScrollTrigger, Lenis, React Three Fiber + drei, Framer Motion. Deploys to Vercel.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173 (client-rendered, no prerender)
npm run build      # vite build -> sitemap/robots -> prerender every route into dist/
npm run preview    # serve dist/ like Vercel (cleanUrls, 404.html, Brotli) on http://localhost:4173
npm run build:spa  # vite build only (no prerender)
```

`/lab` is an internal page that shows every 3D part with controls (not linked, `noindex`). Deep links work, for example `/lab?type=nut&head=wing&finish=brass`.

## Pages

| Route | Page | Sections |
|---|---|---|
| `/` | Home | Hero (intro loader on a first visit only) · 8-category teaser · exploded view · capability teaser · quality teaser · customers marquee · quote CTA |
| `/products` | Products | 8 category cards (one shared 3D canvas) · custom banner · quote CTA |
| `/products/:slug` | Category (8 pages, from `products.js`) | 3D stage of the category's parts · items · materials · notes · WhatsApp quote (prefilled) · related lines · quote CTA. Unknown slug → 404 with "Did you mean …" |
| `/custom` | Custom orders | Configurator · how custom orders work · quote CTA |
| `/manufacturing` | Manufacturing | Process (horizontal scroll) · capability ranges (units 24 & 25) |
| `/quality` | Quality | ISO 9001:2015 · in-process checks · instruments · PPAP checklist · Lean · policy |
| `/about` | About | Story since 1990 · CEO · industries · why us · customers |
| `/gallery` | Gallery | Renders · machine drawings · real-photo slots · unit video |
| `/contact` | Contact | Enquiry form (WhatsApp / email) · map · address · quote CTA |
| anything else | 404 | Styled "part not found" with links |

### How it is put together

```
src/main.jsx              createRoot + RouterProvider (removes prerendered head tags first)
src/router.jsx            route tree; every page is a lazy chunk
src/routes.js             route list + per-page title / description / image / breadcrumbs, JSON-LD builders
                          (also read by scripts/sitemap.mjs and scripts/prerender.mjs)
src/layout/               RootLayout (navbar, footer, cursor, smooth scroll), PageTransition,
                          RouteLifecycle (scroll reset, ScrollTrigger.refresh, dev leak check), Seo
src/pages/                one file per route, composed from the sections in src/components/
scripts/prerender.mjs     renders every route in a headless browser, writes dist/<route>.html
scripts/sitemap.mjs       dist/sitemap.xml + robots.txt from src/routes.js
scripts/serve-dist.mjs    local server that behaves like Vercel (used by prerender and `npm run preview`)
```

- **Adding a page:** add the route in `src/router.jsx`, its SEO entry in `src/routes.js` (copy in `content.pages`), and a file in `src/pages/`. The sitemap and prerender pick it up from `routes.js`.
- **Adding a product line:** add it to `categories` in `src/data/products.js`; its page, sitemap entry, footer link and JSON-LD follow automatically. Run `npm run render:products` for its image.
- **SEO:** each page renders `<Seo>` (React 19 hoists the tags into `<head>`): title, description, canonical, Open Graph, Twitter, and JSON-LD (LocalBusiness everywhere, BreadcrumbList on inner pages, ItemList on `/products`, Product items on category pages).
- **Prerender:** `scripts/prerender.mjs` loads each route of the built site with reduced motion and WebGL off (no canvas or pinned layout is captured; the 3D stays client-only), keeps the head tags and page markup, and writes static HTML, so crawlers and WhatsApp / LinkedIn previews see the real page. React then renders over it on load.
- **Route changes:** pages fade out and in (Framer Motion `LazyMotion`, opacity only). The window jumps to the top between pages, every section's GSAP context is reverted on unmount (pins, triggers), `ScrollTrigger.refresh()` runs once the new page has laid out, and R3F releases each WebGL context when its canvas unmounts.
- **Leak check (dev):** `RouteLifecycle` records ScrollTriggers, pin spacers and live WebGL contexts per route on the first visit and warns `[route-leak]` in the console if a later visit differs. Inspect `window.__routeBaseline`.

## Deploy (Vercel)

`vercel.json` sets the framework (Vite), build (`npm run build`, which includes the prerender), output (`dist`), `cleanUrls` (so `/products` serves `products.html`), no trailing slashes, long-cache headers for hashed assets, a week's cache for `/products/` and `/gallery/`, and basic security headers. There is no SPA catch-all: unknown URLs get `404.html` with a real 404 status, and the app shows the styled 404 (with "Did you mean …" for mistyped product lines).

1. **Check the build locally:** `npm ci && npm run build && npm run preview`, open http://localhost:4173 and click through a few pages.
2. **Site URL:** everything (canonical, Open Graph / Twitter images, JSON-LD, sitemap, robots) reads `SITE_URL` from `src/config.js`, which comes from the `VITE_SITE_URL` environment variable and defaults to `https://shreeashapuraindustries.vercel.app`. When the real domain is connected, set `VITE_SITE_URL` (for example `https://www.example.in`, no trailing slash) under *Project → Settings → Environment Variables* for Production, then redeploy. See `.env.example`.
3. **Create the project:** Vercel dashboard → *Add New… → Project* → import the repo → keep the detected settings → *Deploy*; or `npx vercel` then `npx vercel --prod`.
4. **Prerender on Vercel:** the build image has no Playwright browser, so on Vercel (`VERCEL=1`) `scripts/prerender.mjs` launches `@sparticuz/chromium` through `playwright-core`. This path has not been tested on Vercel yet: check the build log for the `prerendered /…` lines on the first deploy. If launching fails the build fails (no silent SEO loss); the fallback is to build locally and upload the result: `npx vercel build --prod && npx vercel deploy --prebuilt --prod`.
5. **Add the domain:** *Project → Settings → Domains*, then set the DNS records Vercel shows. HTTPS is automatic.
6. **After deploy, check:**
   - view-source of a few pages shows their own `<title>` and content
   - the [Rich Results Test](https://search.google.com/test/rich-results)
   - a WhatsApp / LinkedIn link preview
   - Lighthouse (mobile)
   - submit `sitemap.xml` in Google Search Console
7. **Real photos later:** add files to `public/gallery/real/` (see the README there), commit and push; Vercel rebuilds and the gallery switches to them.

## Client content

The real facts (products, capability, quality, customers, contact) are in `client-assets/CLIENT_FACTS.md`; its OVERRIDES section wins.
Anything the client still has to confirm carries a `// CONFIRM` comment in `src/data/`: ISO certificate details, EPDM, the industries list, machine counts and ranges, heat treatment / plating partners, customiser options and working hours (hidden until supplied).
`client-assets/catalogue.pdf` is a shape reference only. No catalogue image is used on the site.

## Product images

`npm run render:products` renders each category's 3D parts from `/lab?render=<slug>` with Playwright and writes `public/products/<slug>.webp` (1200×900) plus `public/products/og-products.webp` (1200×630 collage). They are used in the product drawer, the JSON-LD catalogue and `llms.txt`. Re-run it after changing a category's `parts` or `pose`. It starts its own Vite server, or reuses one with `BASE_URL=http://localhost:5173 npm run render:products`. It needs Playwright's Chromium (`npx playwright install chromium`) or Google Chrome.

## Where things live

| What | File |
|---|---|
| All copy (every heading, label, button, message) | `src/data/content.js` |
| Company details (address, phones, emails, founding year) | `company` in `src/data/content.js` |
| Product categories (items, materials, notes, 3D parts), customers | `src/data/products.js` |
| Customiser options (heads, sizes, materials → allowed finishes) | `customiser` in `src/data/products.js` |
| Gallery | `src/data/gallery.js`; real photos / unit video go in `public/gallery/real/` (picked up automatically) |
| 3D part dimensions (ISO-style tables) | `src/three/specs.js` |
| Colours, fonts, spacing tokens | `@theme` in `src/styles/index.css` |
| SEO per page (titles, descriptions, JSON-LD) | `src/routes.js` + `content.pages` in `src/data/content.js` |

Anything marked `// PLACEHOLDER` is sample content to replace (today only the drifting-parts layout in `src/components/DriftingParts.jsx`). Open items are listed under "Open items" in `CLAUDE.md`.

### Swap the copy (or add Hindi / Gujarati)
Edit `src/data/content.js`. Components read only from `content`. To add a language, copy the `en` object to `hi` or `gu`, translate it, and point `content` at the locale you want (`export const content = locales.hi`), or add a switcher.

### Swap products
Every product the site lists is one entry in `catalogueItems` in `src/data/content.js`: `{ slug, name, category, group?, spec?, model?, drawing, photo }`. Category pages, the /products search, SEO text and the quote form all read it. To show a real photo of an item, put the file in `public/products/photos/` and set its `photo` path; until then the card shows a blueprint drawing (`drawing`, see `src/components/products/ItemDrawing.jsx`) or, if `model` is set, live 3D from `itemModels` in `src/data/products.js`. `npm run check:catalogue` (after a build) counts items per category and confirms each one is on its page.

The category cards themselves are `categories` in `src/data/products.js`: name, blurb, `materials`, `notes`. Each card's 3D model comes from `parts`, a list of part specs:

```js
parts: [{ type: 'bolt', head: 'hex', diameter: 10, length: 30, finish: 'zinc' }]
```

The available types and heads are listed in `variants` in the same file (screws, washers, brackets, inserts, studs, cotter pins, knurled axles, levellers and more). Use `/lab` to try combinations, then re-run `npm run render:products`.

### Customer logos
`customers` in `src/data/products.js` renders as text wordmarks. Add `logo: '/brand/customers/<file>.svg'` to a customer to show its logo instead. Set `SHOW_CUSTOMERS = false` to hide the strip.

### Logo
`public/brand/sa-logo.svg` is the client's real logo (traced; black shapes and a pure red `#FF0000` dot) and the **master file**: the client has no original, so never replace it with a redraw or recolour it. A backup copy is in `client-assets/brand/`.
`node scripts/brand-icons.mjs` derives everything from it: `src/components/ui/logoMark.js` (inlined in the navbar, mobile menu, footer and intro loader, original colours), `public/favicon.svg`, `favicon-32.png`, `apple-touch-icon.png` (180) and `icon-512.png` (used by `site.webmanifest`). Run `npm run render:products` afterwards to refresh the Open Graph collage header. The JSON-LD `logo` is `/brand/sa-logo.png`.
Rules: clear space around the mark equal to the red dot's diameter (built into `LogoMark`), light backgrounds only.

### Add real photos and the unit video
Drop photos into `public/gallery/real/` (JPG / WebP / PNG, about 1600 px on the long edge) and optionally a `captions.json` with alt text and captions; add `unit-video.mp4` (and `unit-video-poster.jpg`) for the walkthrough slot. `scripts/gallery-manifest.js` reads the folder at build time (and live in dev) with their real sizes, so the gallery switches over by itself. Photos under 1000 px are shown smaller rather than stretched. Full instructions: `public/gallery/real/README.txt`. Until photos exist, the gallery shows the product renders plus blueprint drawings of the machine areas (`public/gallery/illustrations/`). Never use images from the printed catalogue.

### Social share image
`public/products/og-products.jpg` (1200×630) is a collage of the product renders, rebuilt by `npm run render:products`. Each page's `image` in `src/routes.js` sets its `og:image` / `twitter:image` (category pages use their own render); change it there to use another image.

## How the 3D works

Every fastener is generated in code. There are no model files.
`<Fastener type head diameter length pitch finish detail />` is in `src/three/Fastener.jsx`, and the geometry builders are in `src/three/lib/` (real helical threads, chamfered hex heads, recesses).
The configurator on `/custom` also draws a live **top view** (SVG, `src/components/customise/TopView.jsx`). Its head proportions come from `src/three/headGeometry.js`, the same numbers `head()` in `src/three/parts.js` builds the 3D heads from, so the drawing and the model always match (checked to 0.01 % for every head at M5, M8 and M16). Change a head proportion there and both update.
Phones get `detail="low"` and a lighter material. All 3D canvases are lazy-loaded, cap the pixel ratio, and only render while visible or animating.

## Performance notes

- Main bundle is about 154 kB gzipped. Three.js (275 kB) and Framer Motion (47 kB) load lazily.
- Every route is prerendered, so the page paints before the JavaScript runs. On Home and Custom the bolt poster (`/hero-poster.svg`) is the largest element at first paint and is preloaded, so it stays the LCP; metric-matched fallback fonts (`src/styles/index.css`) stop the web-font swap from shifting the layout.
- Each page is its own chunk; three.js loads only on Home, Products, the category pages and Custom.
- Measured on a throttled phone profile (Slow 4G, 4× CPU), Phase 8A: LCP 2.3 s on Home, 2.4 s on Products, 2.2 s on Custom; CLS 0 to 0.02. Lighthouse mobile on those pages: Accessibility 100, Best Practices 100, SEO 100.

## Accessibility

Semantic landmarks with a skip link, visible focus rings, keyboard-operable drawer, lightbox and menu (focus trap, Esc), and labelled form fields with inline errors.
Text contrast is at least 4.5:1. Every animation has a `prefers-reduced-motion` fallback: no loader, no pins, static 3D, no smooth scroll.
