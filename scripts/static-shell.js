// Build-time static first paint.
//
// The site is client-rendered, so without this nothing paints until the main JS has
// downloaded and run (≈ 3.5 s on a throttled phone). This plugin writes a static copy of
// the hero's text column into #root, generated from src/data/content.js (copy stays
// single-sourced), using the same Tailwind classes as Hero.jsx so React's first render
// replaces it with an identical layout. On first visits (intro loader) a static frame of
// the loader is shown instead. React's createRoot().render() clears the shell on mount.
// The hero poster is included as an <img> (public/hero-poster.svg, a copy of HeroPoster):
// it is the largest element at first paint, so it becomes the LCP and the later React
// render (inline SVG poster, not LCP-eligible) does not push LCP back.
import { pathToFileURL } from 'node:url'
import path from 'node:path'

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const PHONE = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>'
const WA = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.2a9.7 9.7 0 0 0-8.3 14.7L2.3 21.8l5-1.3A9.7 9.7 0 1 0 12 2.2Zm0 17.7c-1.5 0-3-.4-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 19.9Z"/></svg>'

// Keep these in sync with Button.jsx / MonoLabel.jsx / Hero.jsx.
const BTN =
  'shine group/btn relative inline-flex items-center justify-center gap-2.5 rounded-xs font-sans font-semibold tracking-[0.01em] whitespace-nowrap select-none h-10 px-4 text-small min-[380px]:h-12 min-[380px]:px-6 min-[380px]:text-body md:h-14 md:px-8 md:text-body-lg'
const PRIMARY = 'bg-red text-paper shadow-[0_1px_0_rgb(0_0_0/0.15),0_8px_24px_-12px_rgb(200_16_46/0.6)]'
const OUTLINE = 'border border-ink text-ink bg-transparent'

function shellHTML(content, company) {
  const h = content.hero
  const l = content.loader
  const tel = `tel:${company.phone.e164}`
  const wa = `https://wa.me/${company.phone.wa}?text=${encodeURIComponent(content.whatsappMessages.general)}`
  return `<div id="sa-shell">
      <div class="sa-shell-loader fixed inset-0 z-[90] bg-paper"><div class="bp-grid absolute inset-0"></div>
        <div class="absolute inset-x-0 top-1/2 -translate-y-1/2 px-5"><div class="relative mx-auto flex w-full max-w-[44rem] justify-between"><p class="label-mono text-steel-700">${esc(l.status)}</p><p class="label-mono text-red">${esc(l.spec)}</p></div></div>
      </div>
      <section class="sa-shell-hero relative"><div class="relative flex h-[100svh] flex-col overflow-hidden bg-paper pt-[var(--nav-h)] md:block">
        <div class="bp-grid bp-grid-fade pointer-events-none absolute inset-0"></div>
        <div class="container-x relative z-10 pt-6 md:flex md:h-full md:items-center md:pt-0"><div class="md:max-w-[min(38rem,46%)] md:pb-16">
          <div><span class="label-mono inline-flex items-center gap-2 rounded-xs border bg-paper/80 px-2 py-1 text-steel-700 border-steel-300"><span class="size-1.5 rounded-full bg-red"></span>${esc(h.eyebrow)}</span></div>
          <p class="display-wide mt-5 text-[clamp(2.6rem,1.2rem+5.6vw,6.9rem)] leading-[0.92] tracking-[-0.03em] md:mt-8 md:max-lg:text-[3.3rem]" role="heading" aria-level="1">
            <span class="block overflow-hidden pb-[0.06em]"><span class="block">${esc(h.title[0])}</span></span>
            <span class="block overflow-hidden pb-[0.06em]"><span class="block text-red">${esc(h.title[1])}</span></span>
          </p>
          <div class="mt-5 hidden h-6 md:block"></div>
          <p class="mt-4 max-w-[44ch] text-[0.95rem] leading-relaxed text-steel-700 max-md:[@media(max-height:780px)]:hidden md:mt-6 md:text-body-lg">${esc(h.lead)}</p>
          <div class="mt-5 flex gap-2.5 md:mt-9 md:gap-3">
            <a href="${tel}" class="${BTN} ${PRIMARY}"><span class="relative z-[2] inline-flex items-center gap-2.5">${PHONE}${esc(h.callCta)}</span></a>
            <a href="${esc(wa)}" class="${BTN} ${OUTLINE}"><span class="relative z-[2] inline-flex items-center gap-2.5">${WA}${esc(h.whatsappCta)}</span></a>
          </div>
        </div></div>
        <div class="relative min-h-0 flex-1 md:absolute md:inset-0"><div class="absolute inset-0 flex items-center justify-center md:left-[42%]">
          <img src="/hero-poster.svg" alt="" width="600" height="720" fetchpriority="high" decoding="async" class="h-[88%] w-auto max-w-full md:h-[78%]">
        </div></div>
      </div></section>
    </div>`
}

export default function staticShell() {
  return {
    name: 'static-shell',
    apply: 'build',
    async transformIndexHtml(html) {
      const mod = await import(pathToFileURL(path.resolve('src/data/content.js')).href + `?t=${Date.now()}`)
      return html.replace('<div id="root"></div>', `<div id="root">${shellHTML(mod.content, mod.company)}</div>`)
    },
  }
}
