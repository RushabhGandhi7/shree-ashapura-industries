// Gallery items. Real photos dropped into public/gallery/real/ are picked up
// automatically (scripts/gallery-manifest.js → virtual:gallery-real) and shown first.
// Until then the gallery shows our own product renders (public/products/, made by
// `npm run render:products`) and blueprint drawings of the machine areas.
// Never use images from the printed catalogue.
import real from 'virtual:gallery-real'
import { categories, variants } from './products.js'
import { content } from './content.js'

const t = content.gallery

const partName = (p) => {
  const v = variants[p.type] ?? {}
  return v[p.head] ?? Object.values(v)[0] ?? p.type
}
const renders = categories.map((c) => ({
  // the opaque copy: the .webp poster is transparent (it sits over the card's grid)
  src: c.image.replace(/\.webp$/, '.jpg'),
  width: 1600,
  height: 1200,
  alt: t.renderAlt(c.name, [...new Set(c.parts.map(partName))].join(', ')),
  caption: t.renderCaption(c.name),
  kind: 'render',
}))
const drawings = t.illustrations.map((i) => ({
  src: `/gallery/illustrations/${i.file}.svg`,
  width: 1600,
  height: 1200,
  alt: i.alt,
  caption: i.caption,
  kind: 'drawing',
}))

export const hasRealPhotos = real.photos.length > 0
// Without photos: the renders (one per category), then the 3 machine-area drawings. All
// are 4:3; Gallery.jsx lays them out 4 per row (a short last row spread out), then 3 drawings.
const fallback = [...renders, ...drawings]
export const gallery = hasRealPhotos ? [...real.photos, ...renders] : fallback
export const unitVideo = real.video
