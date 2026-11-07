import { useCallback, useEffect, useRef, useState } from 'react'
import { content } from '../../data/content.js'
import { gallery } from '../../data/gallery.js'
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
        <img
          key={item.src}
          src={item.src}
          alt={item.alt}
          width={item.width}
          height={item.height}
          className="max-h-full max-w-full rounded-xs object-contain shadow-2xl motion-safe:animate-[sa-fade_.3s_ease-out]"
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
      <p className="container-x shrink-0 py-5 text-center font-mono text-small tracking-[0.1em] text-steel-300 uppercase">{item.caption}</p>
    </div>
  )
}

export default function Gallery() {
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
            <h2 id="gallery-title" className="text-h2">
              {t.title}
            </h2>
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
                className="group relative block w-full overflow-hidden rounded-xs border border-steel-300 bg-paper"
              >
                <img
                  src={g.src}
                  alt={g.alt}
                  width={g.width}
                  height={g.height}
                  loading="lazy"
                  decoding="async"
                  className="block h-auto w-full transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-[1.045] motion-reduce:transition-none"
                />
                <span className="sr-only">{t.open}: </span>
                <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-ink/70 to-transparent px-3 pt-8 pb-2.5 text-left opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 max-md:opacity-100">
                  <span className="label-mono text-paper">{g.caption}</span>
                  <span className="label-mono text-paper/80" aria-hidden>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      {open !== null && <Lightbox index={open} onClose={close} onStep={step} />}
    </section>
  )
}
