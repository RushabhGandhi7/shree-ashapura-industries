# CLAUDE.md — Shree Ashapura Industries website

Premium, motion-heavy marketing website for **Shree Ashapura Industries**, a fastener manufacturer in Mumbai.

## Client
> **Real client content lives in [`client-assets/CLIENT_FACTS.md`](client-assets/CLIENT_FACTS.md).** It is the source of truth for copy, products, capability and contact details; its OVERRIDES win. Never invent numbers or claims; CONFIRM items carry `// CONFIRM` in code.

Shree Ashapura Industries, manufacturers of: all kinds of fasteners (screws, nuts, bolts, washers), precision turned components, press components, plastic moulded components, and special items in all types of furniture kits.

- **Address:** Gala No. 24 & 25, Agarwal Co-op. Industrial Estate Ltd., 121 S.V. Road, near Dahisar Petrol Pump, Dahisar (East), Mumbai 400068
- **Phone/WhatsApp:** +91 70215 80583
  - Call link: `tel:+917021580583`
  - WhatsApp link: `https://wa.me/917021580583` (no leading 0)
- **Landline:** 022-2089 1665
- **Email:** ashapura56@gmail.com, b_jaan@hotmail.com
- **Logo (master file):** `public/brand/sa-logo.svg` is the client's real logo (traced "SA": black shapes plus a pure red `#FF0000` dot). The client has **no original logo file**, so this SVG is the master; a backup copy lives in `client-assets/brand/`. **Never replace it with a redraw, and never recolour or reshape it** (the red dot stays `#FF0000`, not the site accent). `scripts/brand-icons.mjs` derives everything from it: `src/components/ui/logoMark.js` (inlined in the navbar, footer and loader), the favicons and the touch/manifest icons. Keep clear space around the mark equal to the dot's diameter, and use it on light backgrounds only.

## Concept: "Precision in motion"
Feels like a machined object crossed with an engineering blueprint. Tight, exact, mechanical, premium. Motion must be purposeful and tied to manufacturing (threads, rotation, assembly, exploded views, dimension lines), never random decoration.

## Design rules (strict)
- **Light theme only.** Base: warm white / cream (`--color-paper #F6F4EF`) with steel greys. Accent: red (`--color-red #C8102E`; the logo's own dot stays `#FF0000`). Ink: near-black charcoal (`--color-ink #1C1D1F`). Tokens: `@theme` in `src/styles/index.css`.
- **NO dark blue anywhere.** No dark-mode hero. No navy, no midnight-blue gradients.
- **Typography:** Archivo (display), Instrument Sans (text), IBM Plex Mono (dimension labels), self-hosted via fontsource. Avoid Inter / Roboto / Arial.
- **Blueprint motifs:** fine grid lines, dimension arrows, callout labels like "M8 x 1.25", "Ø12", "L 40".
- Premium and uncluttered; generous whitespace; strong hierarchy.

## Stack
- React + Vite (pick JavaScript or TypeScript and stay consistent)
- GSAP + ScrollTrigger
- Lenis smooth scroll
- React Three Fiber + drei + three
- Framer Motion for UI transitions
- Tailwind CSS
- Deploy target: Vercel

## Content rules
- English only, but put **all copy in `src/data/content.js`** so a Hindi/Gujarati layer can be added later. No hardcoded user-facing strings in components.
- **All products**, categories, materials, sizes, finishes and customers live in **`src/data/products.js`** (real client lists since Phase 7A). Mark sample text `// PLACEHOLDER` and unconfirmed client facts `// CONFIRM`.
- **No catalogue photos on the site**, ever (`client-assets/catalogue.pdf` is a shape reference only). Product images are our own renders: `public/products/*.webp` (transparent posters) and `*.jpg` (opaque) from `npm run render:products` (`scripts/render-products.mjs`, Playwright on `/lab?render=<slug>`). Configurator poster: `node scripts/render-posters.mjs` (re-run when that scene changes). The home hero still `public/posters/hero-still.webp` is a one-off render (10F); its scene is gone.
- **Site URL** is one constant, `SITE_URL` in `src/config.js`, from `VITE_SITE_URL`, default `https://shreeashapuraindustries.vercel.app`. There is no custom domain yet; `shreeashapura.in` is **not** the client's domain, never use it.
- **Capability numbers** (units 24 & 25 only): 5 cold-heading machines (1.6 to 7.5 mm), 8 thread-rolling machines (3 to 50 mm), 4 slotting/BT machines (4 to 55 mm). Single source: `MACHINE_COUNTS` (= `machines`) in `content.js`. Never mention units 31, 35, Sarita or length machines. Since phase 11 a secondary list (Traub A25, drilling and tapping, grinding, milling, lathe, drum polish, welding) is shown on /manufacturing only (`capability.extra`), without changing the counts.
- **Heat treatment and plating:** "via approved partners" `// CONFIRM`. Finishes allowed for high tensile and brass `// CONFIRM` (`src/data/materialFinishes.js`).
- **Customers** are shown as styled text wordmarks (`customers` in `products.js`, names from `CUSTOMER_NAMES` in `content.js`, `SHOW_CUSTOMERS = true`), each with a `logo` field (null for now) for real files later.
- 3D fastener models are generated **procedurally in code** (no external model files for now) and driven by parameters (type, head, diameter, length, pitch, finish) so they can be re-skinned later.

## Performance and quality
- Many visitors use mid-range Android phones. Lazy-load all 3D. Cap devicePixelRatio. Pause rendering when offscreen.
- Provide a lighter fallback (static/CSS or reduced 3D) on low-end devices and for `prefers-reduced-motion`.
- Lighthouse performance target **85+ on mobile** for non-3D sections.
- Fully responsive from **360px** up.
- Accessible: semantic HTML, focus states, alt text, reduced motion respected.
- Use **Context7** to check current docs for GSAP, R3F and drei before using their APIs.
- Use **Playwright** to screenshot desktop (1440) and mobile (390) after each section, and fix visual issues without being asked.

## Page sections (original concept; now split across routes, see Current status)
1. **Intro loader** — thread being cut along a rod.
2. **Hero** — static since 10F: copy + pre-rendered bolt-in-plate still (was a scroll-driven 3D bolt threading into a plate).
3. **What we make** — 7 category cards with 3D spin on hover, plus a plain "made to your drawing" tile (castors removed in phase 11).
4. **Exploded view** — removed in 10F.
5. **Customisation showcase** — visual only: switch head, thread, finish; 3D morphs live; "Request a custom order" button opens WhatsApp with a prefilled message.
6. **Manufacturing process** — horizontal scroll: wire coil, heading, thread rolling, heat treatment, plating, inspection.
7. **Industries + Why us** — animated counters, placeholder copy.
8. **Gallery** — placeholder images for now.
9. **Contact** — enquiry form that opens WhatsApp/mailto prefilled, map embed, address, call button.

**Extras:** hex-nut custom cursor (desktop only), magnetic buttons, metallic shine sweep on cards, drifting blurred parts in the background, gear dividers between sections.

## Workflow
- Work in phases. After each phase, summarise what was built and what remains.

## 3D part library (src/three)
- Use `<Fastener type head diameter length pitch finish detail />` (or `Bolt`, `Nut`, `Washer`, `Screw`, `Bracket`, `TurnedPart`, `MouldedClip`, `FurnitureConnector`) from `src/three/Fastener.jsx`. Never hand-build fastener meshes in sections.
- Units: 1 = 10 mm, Y is the part axis, origin on the bearing face. Angle convention: `x = r·sin φ, z = r·cos φ`. Thread phase `v = y/P − φ/2π`, shared by external and internal threads so parts mate. Rotating a bolt by α while lifting α/2π·P is a physically correct screw motion.
- `detail: 'low'` on phones / low-end devices (fewer segments plus a standard material). Geometry is memoised in `buildPart`, and materials are shared per (finish, role, quality).
- Finishes live in `src/data/products.js` (`finishes`). Dimension tables live in `src/three/specs.js`.
- Inspect parts at `/lab` (deep links: `/lab?type=nut&head=wing&finish=brass&normals=1`).

## Current status (2026-11-14, after Phase 11)
Built from the code, not from notes. Last commit before this refresh: `c70c1ae`.

### Completed phases
- **1 Foundation**: Vite + React 19 (JavaScript), Tailwind v4 `@theme`, fonts, Lenis + GSAP, layout, cursor, magnetic buttons, gear dividers, drifting parts.
- **2 Hero**: (replaced in 10F) pinned scroll scene, bolt threading into a tapped plate.
- **3 3D library + `/lab`**: procedural parts in `src/three/` (real helical threads, hex heads, recesses), `Fastener` API, `/lab` inspector (internal, `noindex`).
- **4 Categories + exploded view**: category cards with hover spin; the exploded view was removed in 10F.
- **5 Configurator + manufacturing**: `/custom` customiser (head, size, pitch, length, material, finish; WhatsApp enquiry from the title block); horizontal-scroll process with SVG vignettes.
- **6–7B Content**: loader, quality (ISO, in-process, instruments, PPAP, Lean, policy), capability ranges, about, industries + counters, customers marquee, gallery, contact, quote CTA, real client content (7A), SEO + JSON-LD (7B).
- **8A Multi-page routing + prerender**: React Router 7 lazy routes, per-route SEO in `src/routes.js`, `scripts/prerender.mjs` writes static HTML for every route (16 pages since phase 11), sitemap/robots, Vercel config.
- **8B Configurator top view**: live SVG top view (`customise/TopView.jsx`) sharing proportions with the 3D heads via `three/headGeometry.js`.
- **8C Safari scroll-drift fix**: `SyncCanvasRect` in `products/ProductViews.jsx` writes the live canvas rect each frame so drei Views stop drifting; `scripts/check-view-drift.mjs` measures it. Same commit: `SITE_URL` from `VITE_SITE_URL`.
- **9A**: live 3D product cards on Home (`ProductsTeaser` reuses the shared-canvas grid), finishes by material (`data/materialFinishes.js`: swatches, spec, DWG code and WhatsApp text all read it), footer wordmark removed.
- **9C Dead space**: footer, quote, about and category paddings trimmed; /quality Lean and /about CEO quote go full width under their grids; /contact map fills the column; gallery fallback is a regular grid (renders 4 per row, drawings 3 per row) plus a compact "video coming soon" strip. Rule: no gap over 160 px between sections at 1440.
- **10C Footer divider**: company-name dimension line between the footer company block and the link columns (48 px above / below); bottom bar is the copyright line only.
- **10 Blueprint navbar + spacing system**: nav is always visible (no auto-hide), shrinks 72 → 54 px past 80 px (logo scales, sub-line folds, blur + 1 px steel border); `--nav-h` stays 72 px for layout. Caliper indicator (`layout/NavLinksCaliper.jsx`, lazy, xl only, Framer `layoutId` + `domMax`) springs under the hovered / active link with its measured width. Scroll progress dimension line (`layout/NavProgress.jsx`, `useScrollProgress`: Lenis `scroll` event, window listener only when Lenis is absent). Mobile menu is a slide-down panel with 01–07 labels and Call / WhatsApp at the bottom. Spacing scale in `@theme` (`--spacing-section-sm/md/lg` 48 / 64 / 96, `--spacing-head` 48); `section-y` uses it, and every section boundary is one gap: same tone → the next section drops its top padding; tint change → half in each band; last section + footer → half each (CSS in `index.css` after `@utility section-y`). QuoteCTA, AboutStory, category items and the Home customers strip are `section-y` too, so the rules see them. `ui/SectionHead.jsx` = label + title + baseline-aligned aside, always 48 px above content. `lib/reveal.js` `revealOnce()` = one-shot reveal that snaps to the end state if unreachable / reduced motion (Capability, DimensionLine). Gallery real-photo mode uses the same grid, the last card spans the rest of its row. Footer product links: even 2 / 4-column grid.
- **10D Performance**: no blank flash (`main.jsx` renders only after the first lazy route resolves); entry JS starts after `load` + first-contentful-paint (`deferEntry` in `vite.config.js`, 3 s cap, no modulepreload) so the prerendered page and its LCP paint first; static loader frame matches the loader's first frame; 3D takes the WebGL gate only after load + idle (posters until then); `StudioEnvironment` built with three directly (drei's HDR/EXR loaders gone, renders pixel-identical); customiser + category stage render from `gsap.ticker` via `three/TickerLoop.jsx`; geometry cache LRU 64; PageTransition uses WAAPI (Framer only in the mobile menu / caliper); vendor chunks `react`, `gsap`, `three` and a build assert that no 3D code is in the entry graph. Mobile Lighthouse (median before → single runs after the first-paint fixes): / 84 → 95-96, /products 83 → 93, /custom 77 → 91-93; LCP 3.9-4.4 s → 2.3-2.6 s.
- **10E 3D quality + no layout shift**: DPR `min(devicePixelRatio, 2)` (1.5 only on low-end phones under 640 px), antialias on except low-end phones, full part detail except under 640 px (`lib/device.js` `maxDpr`, `dprCap`, `glAntialias`, `partDetail`); product cards now full detail with a 256 environment. Every 3D placeholder is a render of its own live scene's first frame, fitted with the same rule as the camera, so poster -> canvas is an opacity crossfade only: product posters `npm run render:products` (1600×1200, transparent, framed exactly like the live card; opaque `.jpg` copies for og:image, JSON-LD and the gallery); configurator poster `node scripts/render-posters.mjs` (captures the camera's fitted rect from the dev build at 2×; `public/posters/`). The products hint is CSS-picked, so the desktop-snapshotted prerender matches phones. Shared canvas: canvas document offset cached (resize, body/canvas ResizeObserver, ScrollTrigger refresh, fonts) and the viewport rect derived from scroll each ticker frame. `scripts/static-shell.js` is only the loader frame now (the hero shell was dead code).
- **11 Catalogue content**: castors category removed (7 lines; 3D castor builder and /lab presets kept; `/products/castors` redirects to `/products`). Category 1 renamed "Screws, Bolts & Nuts" (slug unchanged); every category's `items` from the new catalogue. `content.products.catalogue`: range "M2 – M14 · #2 – #14 · L 3 – 100 mm", materials text list, kits line, shown in the /products head (range also in the /manufacturing Capability head). `capability.extra`: secondary machines list under the chart on /manufacturing. 8th grid tile `CustomCard` (links to /custom) replaces the separate callout strip under the /products grid. Facts awaiting the client are single `// CONFIRM` constants at the top of `content.js` (`FIRM_NAME`, `FOUNDED`, `ADDRESS`, `PHONES`, `EMAILS`, `MACHINE_COUNTS`, `CUSTOMER_NAMES`, `LEADER`, `ISO_TEXT`, `PPAP_TEXT`, `LEAN_TEXT`); every string reads them. Log: `CONFIRM.md`.
- **10F Static hero, no exploded view**: hero (`components/hero/Hero.jsx`) is a plain `section-y bg-paper` section (top padding = chrome + `--section-y`): same eyebrow, headline, EST. 1990 line, lead and Call / WhatsApp buttons (one-shot GSAP entrance after the loader, no ScrollTrigger), `DriftingParts` with CSS drift only, and `public/posters/hero-still.webp` (seated bolt-in-plate, 1860×1600, rendered once from the old scene) with a CSS-only hover tilt (`.hero-still`, fine pointers, motion allowed). Removed: HeroScene, HeroDimensions, TorqueReadout, `components/exploded/`, `heroStore`, `explodedStore`, `TappedPlate` / `plate` builder, `heroBolt`, `content.exploded` and the hero scene copy, old hero posters. Home: Hero → ProductsTeaser → GearDivider → Capability → QualityTeaser → Customers → QuoteCTA; no pins on `/`.
- **9B Logo**: client master `public/brand/sa-logo.svg` inlined via generated `ui/logoMark.js` in navbar, mobile menu, footer and loader; favicons / touch / manifest icons from `scripts/brand-icons.mjs`.

### Routes
`/` Home · `/products` · `/products/:slug` (7 lines from `categories`; `/products/castors` 301 → `/products` in vercel.json, serve-dist and the router) · `/custom` · `/manufacturing` · `/quality` · `/about` · `/gallery` · `/contact` · `*` styled 404 (with "Did you mean") · `/lab` outside the layout. Tree: `src/router.jsx`; SEO + JSON-LD: `src/routes.js`.

### Key folders
- `src/pages/` one file per route · `src/layout/` RootLayout, PageTransition (Framer `LazyMotion`, opacity), RouteLifecycle, Seo
- `src/components/<section>/` sections · `src/components/ui/` Logo, Button, DimensionLine, GearDivider, MonoLabel, Section
- `src/three/` part builders (`parts.js`, `parts-extra.js`, `lib/`), `materials.js`, `specs.js`, `headGeometry.js`, `categoryFit.js`, `StudioEnvironment.jsx`
- `src/lib/` `smoothScroll.jsx`, `glGate.js`, `device.js` (quality profile), `contact.js` (tel / wa.me / mailto builders), small stores (`spinStore`, `quoteStore`)
- `src/data/` `content.js`, `products.js`, `materialFinishes.js`, `gallery.js` · `scripts/` prerender, sitemap, serve-dist, render-products, brand-icons, gallery-manifest, check-view-drift

### Scroll and 3D architecture
- **One rAF loop**: a single Lenis instance (`autoRaf: false`) is driven by `gsap.ticker`; Lenis `scroll` calls `ScrollTrigger.update`. Reduced motion: no Lenis, native scroll, no pins, static 3D.
- **Shared canvas**: the product grid (Products page and Home teaser) is ONE `<Canvas>` with eight drei `<View>`s portalled into card slots; it renders on the GSAP tick only when dirty and on screen. Always-animated canvases (customiser, category stage) use `TickerLoop` (gsap.ticker, paused when the tab is hidden).
- **WebGL gate** (`lib/glGate.js`): at most one live WebGL context per page. Sections register with `useGLGate`; the most-visible one owns it; handoff is two-phase (`useGLHold`), and `useReleaseGL` force-loses the context on unmount so two never overlap (Safari / phone context limits). `window.__glContexts` / `__glMax` count them. No section gets the gate before load + first idle.
- **Route change**: window jumps to top, each section's `useGSAP` context reverts its pins/triggers on unmount, `RouteLifecycle` calls `ScrollTrigger.refresh()` after two frames and again after fonts load, and sets `window.__pageReady` for the prerenderer.
- **Navbar**: fixed, outside `<main>` and PageTransition (keep transforms off its ancestors). Condensed state and the progress line both come from `useScrollProgress` (Lenis); never add window scroll listeners for scroll UI while Lenis exists.
- **Spacing**: vertical rhythm only from the `@theme` scale (`section-y`, `mb-head`, `p*-section-*`); new section headers use `SectionHead`; new scroll reveals use `revealOnce`.
- **Leak check (dev)**: `RouteLifecycle` stores triggers / pin spacers / GL contexts per route on first visit (`window.__routeBaseline`) and warns `[route-leak]` on mismatch.
- Screens under 640 px get `detail="low"`; DPR up to 2; lazy 3D chunks (three only loads on Home, Products, Category, Custom).

### Commands
`npm run dev` (5173) · `npm run build` (vite build → sitemap → prerender) · `npm run preview` (Vercel-like server on 4173) · `npm run build:spa` · `npm run render:products` · `node scripts/brand-icons.mjs` · `node scripts/check-view-drift.mjs <outDir> [tag] [baseUrl] [route]`.

### Health check (2026-11-09)
- `npm run build`: passes, 16 pages prerendered, sitemap 15 URLs (phase 11).
- ScrollTrigger baseline (every route visited twice by in-app links, desktop Chromium): triggers and pin spacers identical on revisit for all routes; peak WebGL contexts 1. Dead-space audit at 1440: no band over 160 px between sections on any route, no grid row with columns more than 160 px apart.

### Half-finished or risky
- Prerender on Vercel (`@sparticuz/chromium` via `playwright-core`) has **never been tested on a real Vercel build**; fallback is `vercel build` locally + `deploy --prebuilt`.
- `.claude/launch.json` "preview" runs `vite preview`, not `npm run preview` (no cleanUrls / 404.html behaviour).
- Real workshop photos and the unit video are not supplied; the gallery shows renders and blueprint drawings until `public/gallery/real/` is filled.
- Customer logos not supplied (wordmarks shown). Working hours hidden (`hours: null`).
- `public/llms.txt` and the `<noscript>` text in `index.html` repeat contact, capability and partner facts by hand: update them when `content.js` changes.
- Console noise: a three.js `THREE.Clock` deprecation (from R3F).
- First load: the app JS starts only after `load` + first paint (3 s cap); on a slow phone the page is interactive a little later than before, while painting sooner.
- `Process.jsx` intro panel keeps its own header layout (it lives inside the pinned horizontal track), not `SectionHead`.
- Large lazy chunk: `three` (three + R3F + drei) ~255 kB gzip, loaded only on 3D routes after idle.

### Open items: `// CONFIRM` (client to confirm; catalogue conflicts in `CONFIRM.md`)
- [ ] ISO 9001:2015 certificate details (number, body, validity): `content.js` `company.iso`, `hero.eyebrow`, `quality.lead`, `quality.isoBadge`, `industries.iso`, `about.facts`; seal in `quality/Quality.jsx`
- [ ] Machine counts and ranges (5 / 8 / 4 machines): `content.js` `machines` and the heading, slotting, rolling stations
- [ ] Heat treatment and plating "via approved partners": `content.js` station `spec`, `tag`, `text` and `pages.manufacturing` (also in `public/llms.txt`)
- [ ] Finishes for high tensile 8.8 / 10.9 and brass: `materialFinishes.js`
- [ ] Customiser options (heads, sizes, grades, finishes are illustrative): `products.js` `customiser`, `content.js` `customise.note`
- [ ] EPDM in plastic materials: `products.js` plastic-components
- [ ] Industries list (derived from customers): `content.js` `industries.lead`, `industries.list`
- [ ] Working hours (hidden until supplied): `content.js` `contact.hours`

### Open items: `// PLACEHOLDER`
- [ ] Drifting background parts layout: `components/DriftingParts.jsx` `LAYOUT`
