# CLAUDE.md — Shree Ashapura Industries website

Premium, motion-heavy marketing website for **Shree Ashapura Industries**, a fastener manufacturer in Mumbai.

## Client
Shree Ashapura Industries, manufacturers of: all kinds of fasteners (screws, nuts, bolts, washers), precision turned components, press components, plastic moulded components, and special items in all types of furniture kits.

- **Address:** Gala No. 24/25, Agrawal Industrial Estate, Near Dahisar Petrol Pump, S.V. Road, Dahisar (E), Mumbai - 400068
- **Phone/WhatsApp:** +91 70215 80583
  - Call link: `tel:+917021580583`
  - WhatsApp link: `https://wa.me/917021580583` (no leading 0)
- **Landline:** 022-2089 1665
- **Email:** ashapura56@gmail.com
- **Logo:** red triangular "SA" mark. The client will supply the file later; until then use a clean SVG placeholder wordmark.

## Concept: "Precision in motion"
Feels like a machined object crossed with an engineering blueprint. Tight, exact, mechanical, premium. Motion must be purposeful and tied to manufacturing (threads, rotation, assembly, exploded views, dimension lines), never random decoration.

## Design rules (strict)
- **Light theme only.** Base: warm white / cream (around `#F6F4EF`) with steel greys. Accent: logo red (approx `#C8102E`). Ink: near-black charcoal.
- **NO dark blue anywhere.** No dark-mode hero. No navy, no midnight-blue gradients.
- **Typography:** one distinctive display face plus one clean text face (Google Fonts, self-hosted via fontsource). Avoid Inter / Roboto / Arial defaults. Consider a technical mono for dimension labels.
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
- English only, but put **all copy in `src/data/content.js`** so a Hindi/Gujarati layer can be added later.
- Products are placeholders. Put all products, categories, materials and sizes in **`src/data/products.js`** so they can be swapped easily. Mark placeholder text with a `// PLACEHOLDER` comment.
- 3D fastener models are generated **procedurally in code** (no external model files for now) and driven by parameters (type, head, diameter, length, pitch, finish) so they can be re-skinned later.

## Performance and quality
- Many visitors use mid-range Android phones. Lazy-load all 3D. Cap devicePixelRatio. Pause rendering when offscreen.
- Provide a lighter fallback (static/CSS or reduced 3D) on low-end devices and for `prefers-reduced-motion`.
- Lighthouse performance target **85+ on mobile** for non-3D sections.
- Fully responsive from **360px** up.
- Accessible: semantic HTML, focus states, alt text, reduced motion respected.
- Use **Context7** to check current docs for GSAP, R3F and drei before using their APIs.
- Use **Playwright** to screenshot desktop (1440) and mobile (390) after each section, and fix visual issues without being asked.

## Page sections, in order
1. **Intro loader** — thread being cut along a rod.
2. **Hero** — scroll-driven 3D bolt threading into a plate.
3. **What we make** — 7 category cards with 3D spin on hover.
4. **Exploded view** — bolt / washer / nut separate on scroll with drawn dimension lines.
5. **Customisation showcase** — visual only: switch head, thread, finish; 3D morphs live; "Request a custom order" button opens WhatsApp with a prefilled message.
6. **Manufacturing process** — horizontal scroll: wire coil, heading, thread rolling, heat treatment, plating, inspection.
7. **Industries + Why us** — animated counters, placeholder copy.
8. **Gallery** — placeholder images for now.
9. **Contact** — enquiry form that opens WhatsApp/mailto prefilled, map embed, address, call button.

**Extras:** hex-nut custom cursor (desktop only), magnetic buttons, metallic shine sweep on cards, drifting blurred parts in the background, gear dividers between sections.

## Workflow
- Work in phases. After each phase, summarise what was built and what remains.
