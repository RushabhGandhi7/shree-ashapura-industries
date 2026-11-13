import { useCallback, useEffect, useRef, useState } from 'react'
import { content } from '../../data/content.js'
import SectionHead from '../ui/SectionHead.jsx'
import { gallery, hasRealPhotos, realPhotos, renders, unitVideo } from '../../data/gallery.js'
import VideoSlot from '../ui/VideoSlot.jsx'
import { useLenis } from '../../lib/smoothScroll.jsx'

const t = content.gallery

function Lightbox({ index, onClose, onStep }) {
  const lenis = useLenis()
  const dialog = useRef(null)
  const touch = useRef(null)
  const item = gallery[index]

  useEffect(() => {
    const prev = document.activeElement
    lenis?.stop()
    document.documentElement.style.overflow = 'hidden'
    dialog.current?.querySelector('[data-autofocus]')?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') onStep(1)
      else if (e.key === 'ArrowLeft') onStep(-1)
      else if (e.key === 'Tab') {
        const f = dialog.current.querySelectorAll('button')
        const first = f[0]
        const last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) (e.preventDefault(), last.focus())
        else if (!e.shiftKey && document.activeElement === last) (e.preventDefault(), first.focus())
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.documentElement.style.overflow = ''
      lenis?.start()
      prev?.focus?.()
    }
  }, [lenis, onClose, onStep])

  return (
    <div
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-label={item.caption}
      className="fixed inset-0 z-[75] flex flex-col bg-ink/92 text-paper backdrop-blur-sm motion-safe:animate-[sa-fade_.25s_ease-out]"
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touch.current == null) return
        const dx = e.changedTouches[0].clientX - touch.current
        if (Math.abs(dx) > 50) onStep(dx < 0 ? 1 : -1)
        touch.current = null
      }}
    >
      <div className="container-x flex h-16 shrink-0 items-center justify-between">
        <p className="label-mono text-steel-300">{t.count(index, gallery.length)}</p>
        <button type="button" data-autofocus onClick={onClose} className="label-mono -mr-2 rounded-xs px-2 py-2 text-paper hover:text-red-tint">
          {t.close} ✕
        </button>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 md:px-20" onClick={(e) => e.target === e.currentTarget && onClose()}>
        {/* low-res photos sit on a blurred copy of themselves instead of being blown up */}
        {item.small && (
          <img src={item.src} alt="" aria-hidden className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-30 blur-2xl" />
        )}
        <img
          key={item.src}
          src={item.src}
          alt={item.alt}
          width={item.width}
          height={item.height}
          style={{ maxWidth: `min(100%, ${Math.round(item.width * 1.5)}px)`, maxHeight: `min(100%, ${Math.round(item.height * 1.5)}px)` }}
          className="relative h-auto w-auto rounded-xs object-contain shadow-2xl motion-safe:animate-[sa-fade_.3s_ease-out]"
        />
        <button
          type="button"
          onClick={() => onStep(-1)}
          aria-label={t.prev}
          className="absolute top-1/2 left-2 grid size-12 -translate-y-1/2 place-items-center rounded-full border border-paper/30 bg-ink/40 text-xl hover:border-paper md:left-6"
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => onStep(1)}
          aria-label={t.next}
          className="absolute top-1/2 right-2 grid size-12 -translate-y-1/2 place-items-center rounded-full border border-paper/30 bg-ink/40 text-xl hover:border-paper md:right-6"
        >
          →
        </button>
      </div>
      <p className="container-x shrink-0 py-5 text-center font-mono text-small tracking-[0.1em] text-steel-300 uppercase">
        {item.caption}
        {item.small && <span className="ml-3 text-steel-500">· {t.lowRes}</span>}
      </p>
    </div>
  )
}

// Image grids (12 columns on lg): 4 per row; a short last row is spread evenly (3 left ->
// 4 columns each, 2 -> 6, 1 -> 12) and an odd count fills the phone row. Literal classes.
const REST_LG = { 1: 'lg:col-span-12', 2: 'lg:col-span-6', 3: 'lg:col-span-4' }
function spreadClass(count, i) {
  const rest = count % 4
  const lg = rest && i >= count - rest ? REST_LG[rest] : 'lg:col-span-3'
  const sm = count % 2 && i === count - 1 ? 'col-span-2' : ''
  return `${sm} ${lg}`.trim()
}

function BlockTitle({ children, count }) {
  return (
    <h3 className="label-mono mt-10 mb-4 flex items-center gap-3 text-steel-700 first:mt-0">
      <span className="h-px w-6 bg-red" aria-hidden />
      {children}
      {count != null && <span className="text-steel-500">· {String(count).padStart(2, '0')}</span>}
    </h3>
  )
}

/** A block of lightbox images (renders or real photos); `offset` = index of the first one in `gallery`. */
function ImageBlock({ items, offset, onOpen, crop }) {
  return (
    <ul className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-12">
      {items.map((g, k) => (
        <li key={g.src} className={spreadClass(items.length, k)}>
          <button
            type="button"
            onClick={() => onOpen(offset + k)}
            className={`group relative block w-full overflow-hidden rounded-xs border border-steel-300 bg-paper ${g.small ? 'bp-grid p-6' : ''}`}
          >
            <img
              src={g.src}
              alt={g.alt}
              width={g.width}
              height={g.height}
              loading="lazy"
              decoding="async"
              style={g.small ? { maxWidth: g.width } : undefined}
              className={`mx-auto block w-full ${crop && !g.small ? 'aspect-[4/3] object-cover' : 'h-auto'} transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-[1.045] motion-reduce:transition-none`}
            />
            <span className="sr-only">{t.open}: </span>
            {/* caption strip: always readable, no dark overlay on light renders */}
            <span className={`relative flex items-center justify-between gap-3 border-t border-steel-300 bg-paper px-3 py-2 text-left ${g.small ? '-mx-6 -mb-6 mt-6' : ''}`}>
              <span className="label-mono line-clamp-2 text-[10px] text-steel-700 group-hover:text-red">{g.caption}</span>
              <span className="label-mono text-[10px] text-steel-500" aria-hidden>
                {String(offset + k + 1).padStart(2, '0')}
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}

/** Slot frame: a blueprint placeholder with a mono title, or the real media inside. */
function SlotCard({ title, children }) {
  return (
    <li className="overflow-hidden rounded-xs border border-steel-300 bg-paper">
      <div className="relative aspect-video overflow-hidden">
        <div className="bp-grid absolute inset-0 opacity-60" aria-hidden />
        {children}
      </div>
      <p className="label-mono border-t border-steel-300 px-3 py-2 text-[10px] text-steel-700">{title}</p>
    </li>
  )
}

const PlaceholderMark = ({ kind }) => (
  <svg viewBox="0 0 160 90" className="absolute inset-0 m-auto h-1/2 w-1/2 text-steel-500" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden>
    <rect x="20" y="10" width="120" height="70" rx="2" strokeDasharray="4 3" />
    {kind === 'video' ? <path d="M72 32v26l22-13Z" fill="currentColor" stroke="none" opacity=".55" /> : <path d="M34 70l28-26 18 16 14-12 32 22M98 30a6 6 0 1 0 0 .1" />}
  </svg>
)

export default function Gallery({ h1 = false } = {}) {
  const H = h1 ? 'h1' : 'h2'
  const [open, setOpen] = useState(null)
  const close = useCallback(() => setOpen(null), [])
  const step = useCallback((d) => setOpen((i) => (i + d + gallery.length) % gallery.length), [])
  // the unit walkthrough dropped into public/gallery/real/ fills the first video slot
  const videos = t.videos.map((v, i) => (i === 0 && !v.src && unitVideo ? { ...v, src: unitVideo.src, poster: unitVideo.poster } : v))

  return (
    <section id="gallery" aria-labelledby="gallery-title" className="relative section-y bg-paper-2">
      <div className="container-x">
        <SectionHead id="gallery-title" as={H} label={t.label} titleClassName="text-h2" title={t.title} aside={<p className="max-w-[44ch]">{t.lead}</p>} />

        {/* every grid has full rows: renders / photos spread a short last row, slots are 4 */}
        <BlockTitle count={renders.length}>{t.blocks.parts}</BlockTitle>
        <ImageBlock items={renders} offset={0} onOpen={setOpen} />

        {hasRealPhotos && (
          <>
            <BlockTitle count={realPhotos.length}>{t.blocks.real}</BlockTitle>
            <ImageBlock items={realPhotos} offset={renders.length} onOpen={setOpen} crop />
          </>
        )}

        <BlockTitle count={videos.length}>{t.blocks.videos}</BlockTitle>
        <ul className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          {videos.map((v) => (
            <SlotCard key={v.key} title={v.title}>
              <VideoSlot src={v.src} poster={v.poster} label={t.videoLabel(v.title)} coming={t.videoComing} placeholder={<PlaceholderMark kind="video" />} />
            </SlotCard>
          ))}
        </ul>

        <BlockTitle count={t.photos.length}>{t.blocks.photos}</BlockTitle>
        <ul className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          {t.photos.map((ph) => (
            <SlotCard key={ph.key} title={ph.title}>
              {ph.src ? (
                <img src={ph.src} alt={ph.alt} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <>
                  <PlaceholderMark kind="photo" />
                  <span className="label-mono absolute top-2 right-2 rounded-xs border border-dashed border-steel-300 bg-paper/90 px-2 py-1 text-[10px] text-steel-700">{t.photoComing}</span>
                </>
              )}
            </SlotCard>
          ))}
        </ul>
      </div>
      {open !== null && <Lightbox index={open} onClose={close} onStep={step} />}
    </section>
  )
}
