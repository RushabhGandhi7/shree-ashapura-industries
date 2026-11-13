// Catalogue check (phase 12B): items per category in content.js `catalogueItems` against the
// client's list, and every item name present in its built, prerendered category page.
//   npm run build && node scripts/count-catalogue.mjs
// Exits 1 on any mismatch.
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const ROOT = path.resolve(import.meta.dirname, '..')
const { catalogueItems } = await import(pathToFileURL(path.join(ROOT, 'src/data/content.js')).href)
const { categories, itemModels } = await import(pathToFileURL(path.join(ROOT, 'src/data/products.js')).href)

// From the client's catalogue (phase 12B brief): named items + unnamed "new solutions" parts.
const EXPECTED = {
  'screws-fasteners': { named: 26, unnamed: 0 }, // 12 screws + 7 bolts + 7 nuts
  washers: { named: 5, unnamed: 0 },
  'plastic-components': { named: 10, unnamed: 4 },
  'brackets-press-parts': { named: 7, unnamed: 0 },
  'brass-parts': { named: 5, unnamed: 0 },
  'studs-pins-turned': { named: 6, unnamed: 0 },
  'furniture-fittings': { named: 10, unnamed: 2 },
}
const UNNAMED = new Set(['cream-nylon-ring', 'brown-two-hole-plate', 'cream-nylon-disc', 'black-moulded-part', 'metal-cup', 'zinc-cam-housing'])

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
let fail = 0
const rows = []
for (const c of categories) {
  const items = catalogueItems.filter((i) => i.category === c.slug)
  const unnamed = items.filter((i) => UNNAMED.has(i.slug)).length
  const exp = EXPECTED[c.slug]
  const okCount = exp && items.length - unnamed === exp.named && unnamed === exp.unnamed
  let html = ''
  try {
    html = await readFile(path.join(ROOT, 'dist/products', `${c.slug}.html`), 'utf8')
  } catch {
    console.error(`missing dist/products/${c.slug}.html (run npm run build first)`)
    process.exit(1)
  }
  const missing = items.filter((i) => !html.includes(esc(i.name)) || !html.includes(`id="${i.slug}"`)).map((i) => i.name)
  const models = items.filter((i) => i.model)
  const badModels = models.filter((i) => !itemModels[i.model]).map((i) => i.model)
  if (!okCount || missing.length || badModels.length) fail++
  rows.push([c.code, c.name, items.length, `${items.length - unnamed} named + ${unnamed} unnamed`, models.length, missing.length ? `MISSING: ${missing.join(', ')}` : 'all on page', okCount ? 'count ok' : `EXPECTED ${exp?.named} + ${exp?.unnamed}`, badModels.length ? `BAD MODEL ${badModels}` : ''])
}
const orphans = catalogueItems.filter((i) => !categories.some((c) => c.slug === i.category)).map((i) => i.slug)
if (orphans.length) fail++
const dupes = catalogueItems.length - new Set(catalogueItems.map((i) => i.slug)).size
if (dupes) fail++

console.log('code  category                          items  split                   3D  page check     count')
for (const r of rows) console.log(`${r[0]}    ${r[1].padEnd(32)}  ${String(r[2]).padStart(5)}  ${r[3].padEnd(22)}  ${String(r[4]).padStart(2)}  ${r[5].padEnd(13)}  ${r[6]} ${r[7]}`)
console.log(`total ${catalogueItems.length} items · ${catalogueItems.filter((i) => i.model).length} with 3D · ${UNNAMED.size} unnamed (CONFIRM name)${orphans.length ? ` · ORPHANS ${orphans}` : ''}${dupes ? ` · ${dupes} DUPLICATE SLUGS` : ''}`)
if (fail) {
  console.error('catalogue check FAILED')
  process.exit(1)
}
console.log('catalogue check passed')
