// Static frame of the intro loader, inserted by scripts/prerender.mjs into the prerendered
// Home page (first visits only; CSS shows it while html.is-loading). The rest of every
// prerendered page is React's own render, snapshotted by the prerenderer, so it needs no
// hand-written copy here.
import { pathToFileURL } from 'node:url'
import path from 'node:path'

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** Static frame of the intro loader, inserted into the prerendered Home (first visits only; CSS shows it while html.is-loading). */
export async function loaderFrameHTML() {
  const mod = await import(pathToFileURL(path.resolve('src/data/content.js')).href + `?t=${Date.now()}`)
  const l = mod.content.loader
  // Same box as Loader.jsx <Stage> at t = 0: the rod, axis and logo animate in from nothing,
  // so the first frame is the two labels above the (empty) rod box and the "L" label + "000"
  // counter below it. The counter is the largest text, so it is the LCP element: painting it
  // from HTML keeps first-visit LCP at first paint. Keep the rod constants in sync with Loader.jsx.
  const L = 640
  const D = 64
  const PAD = 24
  return `<div class="sa-shell-loader fixed inset-0 z-[90] bg-paper"><div class="bp-grid absolute inset-0"></div>
        <div class="absolute inset-x-0 top-1/2 -translate-y-1/2 px-5"><div class="relative mx-auto w-full max-w-[44rem]">
          <div class="absolute inset-x-0 bottom-full mb-3 flex items-end justify-between gap-4"><p class="label-mono text-steel-700">${esc(l.status)}</p><p class="label-mono text-red">${esc(l.spec)}</p></div>
          <svg viewBox="${-PAD} ${-PAD - 22} ${L + PAD * 2} ${D + PAD * 2 + 44}" class="block w-full overflow-visible" aria-hidden="true"></svg>
          <div class="absolute inset-x-0 top-full mt-4 flex items-end justify-between gap-4"><p class="label-mono text-steel-500">L ${L / 4}</p><p class="font-mono text-[clamp(2.5rem,8vw,4.5rem)] leading-none font-medium tracking-[-0.04em] text-ink tabular-nums" aria-hidden="true">000</p></div>
        </div></div>
      </div>`
}

