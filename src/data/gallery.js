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
  src: c.image,
  width: 1200,
  height: 900,
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
// Without photos: renders with a machine-area drawing after every third one.
const fallback = renders.flatMap((r, i) => (i % 3 === 2 && drawings[(i - 2) / 3] ? [r, drawings[(i - 2) / 3]] : [r]))
export const gallery = hasRealPhotos ? [...real.photos, ...renders] : fallback
export const unitVideo = real.video
