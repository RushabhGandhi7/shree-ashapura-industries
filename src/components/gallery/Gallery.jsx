import { useCallback, useEffect, useRef, useState } from 'react'
import { content } from '../../data/content.js'
import { gallery, unitVideo } from '../../data/gallery.js'
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

/** Unit walkthrough slot: blueprint poster until public/gallery/real/unit-video.mp4 exists. */
function UnitVideo() {
  const v = t.video
  const [play, setPlay] = useState(false)
  return (
    <figure className="relative mt-3 overflow-hidden rounded-xs border border-steel-300 bg-paper md:mt-4">
      <div className="relative aspect-video md:aspect-[21/9]">
        {unitVideo && play ? (
          <video className="absolute inset-0 h-full w-full bg-ink object-contain" controls autoPlay playsInline preload="none" poster={unitVideo.poster ?? undefined}>
            <source src={unitVideo.src} type={unitVideo.type} />
          </video>
        ) : (
          <>
            {unitVideo?.poster ? (
              <img src={unitVideo.poster} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <div className="bp-grid absolute inset-0" aria-hidden />
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
              {unitVideo ? (
                <button
                  type="button"
                  onClick={() => setPlay(true)}
                  aria-label={v.play}
                  className="grid size-20 place-items-center rounded-full bg-red text-paper shadow-[0_12px_32px_-12px_rgb(200_16_46/0.7)] transition-transform hover:scale-105"
                >
                  <svg viewBox="0 0 24 24" className="ml-1 size-8" fill="currentColor" aria-hidden>
                    <path d="M7 4.5v15l12-7.5z" />
                  </svg>
                </button>
              ) : (
                <span className="grid size-20 place-items-center rounded-full border-2 border-dashed border-steel-500 text-steel-500" aria-hidden>
                  <svg viewBox="0 0 24 24" className="ml-1 size-8" fill="currentColor">
                    <path d="M7 4.5v15l12-7.5z" />
                  </svg>
                </span>
              )}
              <div>
                <p className="font-display text-[1.3rem] font-[760] [font-stretch:115%]">{v.title}</p>
                <p className="label-mono mt-1 text-steel-500">{unitVideo ? v.text : v.soon}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </figure>
  )
}

export default function Gallery({ h1 = false } = {}) {
  const H = h1 ? 'h1' : 'h2'
  const [open, setOpen] = useState(null)
  const close = useCallback(() => setOpen(null), [])
  const step = useCallback((d) => setOpen((i) => (i + d + gallery.length) % gallery.length), [])

  return (
    <section id="gallery" aria-labelledby="gallery-title" className="relative section-y bg-paper-2">
      <div className="container-x">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="label-mono mb-6 flex items-center gap-3 text-steel-700">
              <span className="h-px w-8 bg-red" aria-hidden />
              {t.label}
            </p>
            <H id="gallery-title" className="text-h2">
              {t.title}
            </H>
          </div>
          <p className="max-w-[44ch] text-steel-700 md:col-span-5">{t.lead}</p>
        </div>

        {/* masonry via CSS columns: images keep their aspect ratio from width/height */}
        <ul className="mt-12 columns-2 gap-3 md:mt-16 md:gap-4 lg:columns-3">
          {gallery.map((g, i) => (
            <li key={g.src} className="mb-3 break-inside-avoid md:mb-4">
              <button
                type="button"
                onClick={() => setOpen(i)}
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
                  className="mx-auto block h-auto w-full transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-[1.045] motion-reduce:transition-none"
                />
                <span className="sr-only">{t.open}: </span>
                {/* caption strip: always readable, no dark overlay on light renders */}
                <span className={`relative flex items-center justify-between gap-3 border-t border-steel-300 bg-paper px-3 py-2 text-left ${g.small ? '-mx-6 -mb-6 mt-6' : ''}`}>
                  <span className="label-mono line-clamp-2 text-[10px] text-steel-700 group-hover:text-red">{g.caption}</span>
                  <span className="label-mono text-[10px] text-steel-500" aria-hidden>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>

        <UnitVideo />
      </div>
      {open !== null && <Lightbox index={open} onClose={close} onStep={step} />}
    </section>
  )
}
