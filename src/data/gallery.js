// Gallery items. Real photos dropped into public/gallery/real/ are picked up
// automatically (scripts/gallery-manifest.js → virtual:gallery-real) as their own block.
// Until then the gallery shows our own product renders (public/products/, made by
// `npm run render:products`), plus slots for shop floor videos and photos (content.js).
// Never use images from the printed catalogue.
import real from 'virtual:gallery-real'
import { categories, variants } from './products.js'
import { content } from './content.js'

const t = content.gallery

const partName = (p) => {
  const v = variants[p.type] ?? {}
  return v[p.head] ?? Object.values(v)[0] ?? p.type
}
export const renders = categories.map((c) => ({
  // the opaque copy: the .webp poster is transparent (it sits over the card's grid)
  src: c.image.replace(/\.webp$/, '.jpg'),
  width: 1600,
  height: 1200,
  alt: t.renderAlt(c.name, [...new Set(c.parts.map(partName))].join(', ')),
  caption: t.renderCaption(c.name),
  kind: 'render',
}))
// Real photos dropped into public/gallery/real/ (scripts/gallery-manifest.js).
export const realPhotos = real.photos
export const hasRealPhotos = realPhotos.length > 0
// The lightbox steps through every image on the page: our renders, then any real photos.
// (The machine-area line drawings left the gallery in phase 12D; /manufacturing still uses them.)
export const gallery = [...renders, ...realPhotos.map((p) => ({ ...p, kind: 'photo' }))]
export const unitVideo = real.video
