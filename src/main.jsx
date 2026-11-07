import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import './styles/index.css'
import { router } from './router.jsx'

// The prerendered HTML (scripts/prerender.mjs) already painted this page; Hero skips its
// fade-in then. Its head tags are replaced by the ones React renders (see layout/Seo.jsx).
window.__saShell = !!document.getElementById('sa-shell')
document.querySelectorAll('head [data-seo]').forEach((n) => n.remove())
if ('scrollRestoration' in history) history.scrollRestoration = 'manual'

// Dev: count live WebGL contexts, so the route leak check can see canvases that were not released.
if (import.meta.env.DEV) {
  window.__glContexts = 0
  const get = HTMLCanvasElement.prototype.getContext
  HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
    const ctx = get.call(this, type, ...rest)
    if (ctx && /webgl/.test(type) && !this.__counted) {
      this.__counted = true
      window.__glContexts++
      this.addEventListener('webglcontextlost', () => window.__glContexts--, { once: true })
    }
    return ctx
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
