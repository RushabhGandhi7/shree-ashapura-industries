import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import staticShell from './scripts/static-shell.js'

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

// No manual chunking: three / R3F / drei are only reachable through lazy imports
// (hero, cards, exploded, customiser, lab), so they split into async chunks.
export default defineConfig({
  plugins: [react(), tailwindcss(), preloadFonts(), staticShell()],
  build: {
    chunkSizeWarningLimit: 1100,
  },
})
