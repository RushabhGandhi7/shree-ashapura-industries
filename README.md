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

Import the repo in Vercel and keep the defaults: framework Vite, build `npm run build`, output `dist`.
`vercel.json` adds the SPA rewrite and long-cache headers for hashed assets. Vercel compresses files automatically.

**Before launch, set the real domain.** Search the project for `shreeashapura.in` and replace it in:
- `index.html` (canonical URL, Open Graph, JSON-LD)
- `public/robots.txt`
- `public/sitemap.xml`

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
| Gallery list | `src/data/gallery.js` (images in `public/gallery/`) |
| 3D part dimensions (ISO-style tables) | `src/three/specs.js` |
| Colours, fonts, spacing tokens | `@theme` in `src/styles/index.css` |
| SEO, Open Graph, LocalBusiness data | `index.html` |

Anything marked `// PLACEHOLDER` is sample content to replace (now only the gallery photos).

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

### Swap the photos
1. Put the photos in `public/gallery/`. JPG or WebP, about 1600 px on the long edge, compressed to roughly 200–400 KB each.
2. Edit `src/data/gallery.js`. For each photo give `src`, its real `width` and `height` in pixels (this stops layout jumps), `alt` text describing the photo, and a short `caption`.
3. Delete the `placeholder-*.svg` files.

The gallery is a masonry grid with a lightbox (arrow keys, swipe, Esc).

### Social share image
`public/og-image.jpg` (1200×630) is a screenshot of the hero. Replace it with any 1200×630 JPG if you like.

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
