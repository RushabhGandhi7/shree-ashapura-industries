import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import galleryManifest from './scripts/gallery-manifest.js'

// Preload the Latin subsets of the two fonts the hero needs for first paint (the LCP
// headline is set in Archivo), so text renders in the brand face without a late swap.
function preloadFonts() {
  const wanted = [/archivo-latin-wdth-normal-.*\.woff2$/, /instrument-sans-latin-wdth-normal-.*\.woff2$/]
  return {
    name: 'preload-fonts',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        const files = Object.keys(ctx.bundle ?? {}).filter((f) => wanted.some((re) => re.test(f)))
        const tags = files.map((f) => `<link rel="preload" href="/${f}" as="font" type="font/woff2" crossorigin>`).join('\n    ')
        return html.replace('</title>', `</title>\n    ${tags}`)
      },
    },
  }
}

// Every page ships prerendered HTML (scripts/prerender.mjs), so the app's JS does not need to
// run before first paint. The entry is fetched and executed only once the page has loaded
// AND the browser has actually painted it (first-contentful-paint), plus a frame; at most 3 s
// in. (Chrome can hold the first paint for preloaded fonts until after load, so load alone is
// not enough.) This way downloading and evaluating React + GSAP on a slow phone
// never competes with painting the prerendered page, its fonts or its LCP image.
function deferEntry() {
  return {
    name: 'defer-entry',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        const re = /<script type="module" crossorigin src="([^"]+)"><\/script>/
        const m = html.match(re)
        if (!m) throw new Error('defer-entry: entry <script> not found')
        const src = m[1]
        const boot = `<script type="module">
      const start = () => import(${JSON.stringify(src)})
      let go = () => ((go = () => {}), start())
      const loaded = new Promise((r) => (document.readyState === 'complete' ? r() : addEventListener('load', r, { once: true })))
      const painted = new Promise((r) => {
        try {
          new PerformanceObserver((l, o) => l.getEntries().some((e) => e.name === 'first-contentful-paint') && (o.disconnect(), r())).observe({ type: 'paint', buffered: true })
        } catch (e) { r() }
      })
      Promise.all([loaded, painted]).then(() => requestAnimationFrame(() => setTimeout(() => go())))
      setTimeout(() => go(), 3000)
    </script>`
        // the entry's static imports would otherwise be modulepreloaded at parse time and
        // compete with the fonts and the LCP image for bandwidth
        return html.replace(re, boot).replace(/\s*<link rel="modulepreload"[^>]*>/g, '')
      },
    },
  }
}

// No manual chunking: three / R3F / drei are only reachable through lazy imports
// (hero, cards, exploded, customiser, lab), so they split into async chunks.
export default defineConfig({
  plugins: [react(), tailwindcss(), preloadFonts(), deferEntry(), galleryManifest()],
  build: {
    chunkSizeWarningLimit: 1100,
  },
})
