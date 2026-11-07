// Small static server for dist/ that behaves like Vercel with cleanUrls:
//   /products -> products.html, /products/brass-parts -> products/brass-parts.html,
//   unknown paths -> 404.html (status 404), Brotli for text assets.
//   node scripts/serve-dist.mjs [port]      (also used by scripts/prerender.mjs)
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import { pathToFileURL } from 'node:url'

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.txt': 'text/plain', '.xml': 'application/xml', '.json': 'application/json', '.mp4': 'video/mp4' }

export function serveDist({ root = path.resolve('dist'), port = 4175, spaFallback = false } = {}) {
  const cache = new Map()
  const isFile = (f) => f.startsWith(root) && fs.existsSync(f) && fs.statSync(f).isFile()
  const server = http.createServer((req, res) => {
    const p = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/\/+$/, '') || '/'
    let file = path.join(root, p === '/' ? 'index.html' : p)
    let status = 200
    if (!isFile(file)) file = path.join(root, `${p}.html`)
    if (!isFile(file)) {
      // during prerender every route renders from the SPA shell
      file = spaFallback ? path.join(root, '__spa.html') : path.join(root, '404.html')
      if (!spaFallback) status = 404
      if (!isFile(file)) file = path.join(root, 'index.html')
    }
    const type = TYPES[path.extname(file)] || 'application/octet-stream'
    res.statusCode = status
    res.setHeader('Content-Type', type)
    res.setHeader('Cache-Control', file.includes(`${path.sep}assets${path.sep}`) ? 'public, max-age=31536000, immutable' : 'no-cache')
    if (/text|javascript|json|xml|svg/.test(type) && String(req.headers['accept-encoding'] || '').includes('br')) {
      if (!cache.has(file)) cache.set(file, zlib.brotliCompressSync(fs.readFileSync(file)))
      res.setHeader('Content-Encoding', 'br')
      return res.end(cache.get(file))
    }
    res.end(fs.readFileSync(file))
  })
  return new Promise((resolve) => server.listen(port, () => resolve({ url: `http://localhost:${port}`, close: () => server.close() })))
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.argv[2] || 4174)
  serveDist({ port }).then(({ url }) => console.log(`serving dist on ${url} (cleanUrls, brotli)`))
}
