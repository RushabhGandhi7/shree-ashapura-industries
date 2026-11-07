// Builds the favicon and touch icons from the logo mark (src/components/ui/logoMark.js):
//   public/favicon.svg, public/favicon-48.png, public/apple-touch-icon.png (180 px)
//   node scripts/brand-icons.mjs
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import sharp from 'sharp'

const { MARK } = await import(pathToFileURL(path.resolve('src/components/ui/logoMark.js')).href)
const [x, y, w, h] = MARK.viewBox.split(/\s+/).map(Number)
const INK = '#1E1F21'
const RED = '#C8102E'
const PAPER = '#F6F4EF'

/** Square icon: mark centred with `pad` (fraction of side) on an optional background. */
const icon = (pad, bg) => {
  const side = Math.max(w, h) / (1 - 2 * pad)
  const ox = x - (side - w) / 2
  const oy = y - (side - h) / 2
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${ox.toFixed(2)} ${oy.toFixed(2)} ${side.toFixed(2)} ${side.toFixed(2)}">${
    bg ? `<rect x="${ox}" y="${oy}" width="${side}" height="${side}" fill="${bg}"/>` : ''
  }<path fill="${INK}" d="${MARK.d}"/><circle fill="${RED}" cx="${MARK.dot.cx}" cy="${MARK.dot.cy}" r="${MARK.dot.r}"/></svg>`
}

fs.writeFileSync('public/favicon.svg', icon(0.04))
await sharp(Buffer.from(icon(0.06, PAPER))).resize(48, 48).png().toFile('public/favicon-48.png')
await sharp(Buffer.from(icon(0.14, PAPER))).resize(180, 180).png().toFile('public/apple-touch-icon.png')
console.log('favicon.svg, favicon-48.png, apple-touch-icon.png written')
