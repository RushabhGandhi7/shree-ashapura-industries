import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import './styles/index.css'
import { router } from './router.jsx'

// The prerendered HTML (scripts/prerender.mjs) already painted this page; the home hero
// skips its fade-in then. Its head tags are replaced by the ones React renders (see layout/Seo.jsx).
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
      const canvas = this
      canvas.__counted = true
      window.__glContexts++
      window.__glMax = Math.max(window.__glMax ?? 0, window.__glContexts) // peak concurrent contexts (QA)
      const done = () => {
        if (canvas.__released) return
        canvas.__released = true
        window.__glContexts--
      }
      // count a release at loseContext() time (the webglcontextlost event arrives later)
      const getExt = ctx.getExtension.bind(ctx)
      ctx.getExtension = (name) => {
        const ext = getExt(name)
        if (ext && name === 'WEBGL_lose_context' && !ext.__wrapped) {
          const lose = ext.loseContext.bind(ext)
          ext.loseContext = () => (done(), lose())
          ext.__wrapped = true
        }
        return ext
      }
      canvas.addEventListener('webglcontextlost', done, { once: true })
    }
    return ctx
  }
}

// Render only once the first route's lazy chunk has resolved. createRoot() clears the
// prerendered page on its first commit; rendering earlier would commit an empty route and
// leave the screen blank until the chunk arrives (and repaint the LCP element late).
function whenRouterReady() {
  if (router.state.initialized) return Promise.resolve()
  return new Promise((resolve) => {
    const off = router.subscribe((s) => {
      if (!s.initialized) return
      off()
      resolve()
    })
  })
}

whenRouterReady().then(() =>
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  ),
)
