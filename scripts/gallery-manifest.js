// Virtual module `virtual:gallery-real`: lists real photos and the unit video dropped
// into public/gallery/real/, so the gallery switches to them automatically.
//
//   public/gallery/real/*.jpg|jpeg|png|webp|avif   photos (any name; sorted by file name)
//   public/gallery/real/captions.json              optional { "file.jpg": { "alt": "...", "caption": "..." } }
//   public/gallery/real/unit-video.mp4|webm         optional unit walkthrough video
//   public/gallery/real/unit-video-poster.jpg|webp  optional poster for the video
//
// Width / height are read with sharp at build (and on change in dev).
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const DIR = path.resolve('public/gallery/real')
const ID = 'virtual:gallery-real'
const RID = '\0' + ID
const IMG = /\.(jpe?g|png|webp|avif)$/i
const LOW_RES = 1000 // long edge below this is flagged "small" (never upscaled)

const tidy = (f) =>
  f
    .replace(/\.[^.]+$/, '')
    .replace(/^\d+[-_ ]*/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase())

async function scan() {
  if (!fs.existsSync(DIR)) return { photos: [], video: null }
  const files = fs.readdirSync(DIR).sort()
  let captions = {}
  try {
    captions = JSON.parse(fs.readFileSync(path.join(DIR, 'captions.json'), 'utf8'))
  } catch {}
  const photos = []
  for (const f of files) {
    if (!IMG.test(f) || f.startsWith('unit-video-poster')) continue
    try {
      const { width, height } = await sharp(path.join(DIR, f)).metadata()
      const c = captions[f] ?? {}
      photos.push({
        src: `/gallery/real/${encodeURIComponent(f)}`,
        width,
        height,
        alt: c.alt ?? tidy(f),
        caption: c.caption ?? tidy(f),
        small: Math.max(width, height) < LOW_RES,
        kind: 'photo',
      })
    } catch (e) {
      console.warn(`[gallery] skipped ${f}: ${e.message}`)
    }
  }
  const vid = files.find((f) => /^unit-video\.(mp4|webm)$/i.test(f))
  const poster = files.find((f) => /^unit-video-poster\.(jpe?g|png|webp)$/i.test(f))
  return {
    photos,
    video: vid ? { src: `/gallery/real/${vid}`, type: `video/${vid.split('.').pop().toLowerCase()}`, poster: poster ? `/gallery/real/${poster}` : null } : null,
  }
}

export default function galleryManifest() {
  return {
    name: 'gallery-manifest',
    resolveId: (id) => (id === ID ? RID : null),
    async load(id) {
      if (id !== RID) return null
      return `export default ${JSON.stringify(await scan())}`
    },
    configureServer(server) {
      server.watcher.add(DIR)
      server.watcher.on('all', (_, file) => {
        if (!file.startsWith(DIR)) return
        const mod = server.moduleGraph.getModuleById(RID)
        if (mod) server.moduleGraph.invalidateModule(mod)
        server.ws.send({ type: 'full-reload' })
      })
    },
  }
}
