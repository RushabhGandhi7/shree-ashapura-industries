# Shree Ashapura Industries: website

Marketing site for Shree Ashapura Industries (since 1990), manufacturer of fasteners and machine components for the lock and furniture industry, in Dahisar (East), Mumbai.
React + Vite, Tailwind CSS v4, GSAP + ScrollTrigger, Lenis, React Three Fiber + drei, Framer Motion. Deploys to Vercel.

## Run it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build in dist/
npm run preview   # serve the build locally
```

`/lab` is an internal page that shows every 3D part with controls (not linked, `noindex`). Deep links work, for example `/lab?type=nut&head=wing&finish=brass`.

## Deploy (Vercel)

`vercel.json` already sets the framework (Vite), build command (`npm run build`), output (`dist`), the SPA rewrite, long-cache headers for hashed assets, a week's cache for `/products/` and `/gallery/`, and basic security headers. Vercel serves real files before applying the rewrite, so `/sitemap.xml`, `/robots.txt` and `/llms.txt` are served as files. Vercel compresses responses automatically.

1. **Check the build locally:** `npm ci && npm run build`, then `npm run preview` and open http://localhost:4173.
2. **Set the real domain** before the first production deploy: search the project for `shreeashapura.in` and replace it in `index.html` (canonical, Open Graph, Twitter, JSON-LD), `public/robots.txt` and `public/sitemap.xml`. Update `<lastmod>` in the sitemap.
3. **Create the project**, either:
   - Vercel dashboard → *Add New… → Project* → import the Git repository → keep the detected settings → *Deploy*; or
   - CLI: `npx vercel` (links the folder and makes a preview deploy), then `npx vercel --prod`.
4. **Add the domain:** *Project → Settings → Domains* → add the domain, then set the DNS records Vercel shows at your registrar. HTTPS is issued automatically.
5. **After deploy, check:**
   - the [Rich Results Test](https://search.google.com/test/rich-results) on the live URL (LocalBusiness data)
   - the link preview (WhatsApp / LinkedIn) shows `products/og-products.jpg`
   - Lighthouse (mobile) in Chrome DevTools
   - `/lab` is reachable but `noindex`
   - submit `sitemap.xml` in Google Search Console
6. **Real photos later:** add files to `public/gallery/real/` (see the README there), commit and push; Vercel rebuilds and the gallery switches to them.

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
| SEO, Open Graph, LocalBusiness data | `index.html` |

Anything marked `// PLACEHOLDER` is sample content to replace (the logo, drifting-parts layout and the site URL).

### Swap the copy (or add Hindi / Gujarati)
Edit `src/data/content.js`. Components read only from `content`. To add a language, copy the `en` object to `hi` or `gu`, translate it, and point `content` at the locale you want (`export const content = locales.hi`), or add a switcher.

### Swap products
Edit `categories` in `src/data/products.js`: name, blurb, `items`, `materials`, `notes`. Each card's 3D model comes from `parts`, a list of part specs:

```js
parts: [{ type: 'bolt', head: 'hex', diameter: 10, length: 30, finish: 'zinc' }]
```

The available types and heads are listed in `variants` in the same file (screws, washers, brackets, inserts, castors, studs, cotter pins, levellers and more). Use `/lab` to try combinations, then re-run `npm run render:products`.

### Customer logos
`customers` in `src/data/products.js` renders as text wordmarks. Add `logo: '/brand/customers/<file>.svg'` to a customer to show its logo instead. Set `SHOW_CUSTOMERS = false` to hide the strip.

### Swap the logo
The logo is a placeholder SVG in `src/components/ui/Logo.jsx`, with the favicon in `public/favicon.svg` and the touch icon in `public/apple-touch-icon.png`.
Replace the `<svg>` in `Logo.jsx` with the client's mark (keep `aria-hidden` on it; the visible wordmark text stays for accessibility), then replace both icon files.

### Add real photos and the unit video
Drop photos into `public/gallery/real/` (JPG / WebP / PNG, about 1600 px on the long edge) and optionally a `captions.json` with alt text and captions; add `unit-video.mp4` (and `unit-video-poster.jpg`) for the walkthrough slot. `scripts/gallery-manifest.js` reads the folder at build time (and live in dev) with their real sizes, so the gallery switches over by itself. Photos under 1000 px are shown smaller rather than stretched. Full instructions: `public/gallery/real/README.txt`. Until photos exist, the gallery shows the product renders plus blueprint drawings of the machine areas (`public/gallery/illustrations/`). Never use images from the printed catalogue.

### Social share image
`public/products/og-products.jpg` (1200×630) is a collage of the product renders, rebuilt by `npm run render:products`. Swap the `og:image` / `twitter:image` URLs in `index.html` to use another image.

## How the 3D works

Every fastener is generated in code. There are no model files.
`<Fastener type head diameter length pitch finish detail />` is in `src/three/Fastener.jsx`, and the geometry builders are in `src/three/lib/` (real helical threads, chamfered hex heads, recesses).
Phones get `detail="low"` and a lighter material. All 3D canvases are lazy-loaded, cap the pixel ratio, and only render while visible or animating.

## Performance notes

- Main bundle is about 154 kB gzipped. Three.js (275 kB) and Framer Motion (47 kB) load lazily.
- `scripts/static-shell.js` writes a static copy of the hero into `index.html` at build time, so the page paints before the JavaScript runs. If you change the hero's layout classes in `Hero.jsx`, mirror them there. The copy itself is read from `content.js` automatically.
- Sections below the fold mount progressively after the hero (`src/App.jsx`).
- Measured on a throttled phone profile (Slow 4G, 4× CPU): FCP 1.5 s, LCP 1.6 s, TBT ≈ 230 ms, CLS 0. Lighthouse mobile: Accessibility 100, Best Practices 100, SEO 100.

## Accessibility

Semantic landmarks with a skip link, visible focus rings, keyboard-operable drawer, lightbox and menu (focus trap, Esc), and labelled form fields with inline errors.
Text contrast is at least 4.5:1. Every animation has a `prefers-reduced-motion` fallback: no loader, no pins, static 3D, no smooth scroll.
