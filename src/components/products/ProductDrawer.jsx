import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { content, company } from '../../data/content.js'
import { telHref, whatsappHref } from '../../lib/contact.js'
import { scrollToTarget, useLenis } from '../../lib/smoothScroll.jsx'
import { quoteStore } from '../../lib/quoteStore.js'
import { useMediaQuery, useReducedMotion } from '../../hooks/useReducedMotion.js'
import Button from '../ui/Button.jsx'
import MonoLabel from '../ui/MonoLabel.jsx'
import { PhoneIcon, WhatsAppIcon } from '../ui/Icons.jsx'

const t = content.products.drawer
const ease = [0.16, 1, 0.3, 1]

/** Category detail: side sheet on desktop, bottom sheet on phones. */
export default function ProductDrawer({ category, onClose }) {
  const lenis = useLenis()
  const reduced = useReducedMotion()
  const wide = useMediaQuery('(min-width: 768px)')
  const panel = useRef(null)
  const open = !!category

  useEffect(() => {
    if (!open) return
    const prev = document.activeElement
    lenis?.stop()
    document.documentElement.style.overflow = 'hidden'
    requestAnimationFrame(() => panel.current?.querySelector('[data-autofocus]')?.focus())
    const onKey = (e) => {
      if (e.key === 'Escape') return onClose()
      if (e.key !== 'Tab' || !panel.current) return
      const f = panel.current.querySelectorAll('a[href], button:not([disabled])')
      const first = f[0]
      const last = f[f.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.documentElement.style.overflow = ''
      lenis?.start()
      prev?.focus?.()
    }
  }, [open, lenis, onClose])

  const d = reduced ? 0 : 1
  const from = wide ? { x: '100%' } : { y: '100%' }
  const to = wide ? { x: 0 } : { y: 0 }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70]">
          <motion.button
            type="button"
            aria-label={t.close}
            tabIndex={-1}
            className="absolute inset-0 h-full w-full cursor-default bg-ink/30 backdrop-blur-[2px]"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 * d }}
          />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-title"
            data-lenis-prevent
            className="absolute inset-x-0 bottom-0 flex max-h-[88svh] flex-col overflow-hidden rounded-t-sm border-t border-steel-300 bg-paper md:inset-y-0 md:right-0 md:left-auto md:max-h-none md:w-[min(32rem,100%)] md:rounded-none md:border-t-0 md:border-l"
            initial={from}
            animate={to}
            exit={from}
            transition={{ duration: 0.55 * d, ease }}
          >
            <div className="bp-grid pointer-events-none absolute inset-x-0 top-0 h-40 opacity-60 [mask-image:linear-gradient(#000,transparent)]" aria-hidden />
            <header className="relative flex items-start justify-between gap-4 px-6 pt-6 pb-4 md:px-8 md:pt-8">
              <div>
                <p className="font-mono text-body font-medium text-red">{category.code}</p>
                <h2 id="drawer-title" className="mt-2 text-h3">
                  {category.name}
                </h2>
              </div>
              <button
                type="button"
                data-autofocus
                onClick={onClose}
                className="label-mono -mr-2 inline-flex items-center gap-2 rounded-xs px-2 py-2 text-steel-700 hover:text-red"
              >
                {t.close}
                <span aria-hidden className="relative block size-3">
                  <span className="absolute top-1/2 left-0 h-px w-3 rotate-45 bg-current" />
                  <span className="absolute top-1/2 left-0 h-px w-3 -rotate-45 bg-current" />
                </span>
              </button>
            </header>

            <div className="relative flex-1 space-y-7 overflow-y-auto px-6 pb-6 md:px-8">
              <div className="relative -mx-6 aspect-[4/3] overflow-hidden border-y border-steel-300 bg-paper md:-mx-8">
                <img
                  src={category.image}
                  alt={t.imageAlt(category.name)}
                  width="1200"
                  height="900"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
                <span className="label-mono absolute right-3 bottom-3 rounded-xs border border-steel-300 bg-paper/85 px-1.5 py-0.5 text-[10px] text-steel-700">
                  {category.callout}
                </span>
              </div>

              <p className="text-steel-700">{category.blurb}</p>

              <section aria-labelledby="drawer-items">
                <h3 id="drawer-items" className="label-mono mb-3 font-medium [font-stretch:100%] text-steel-500">
                  {t.items}
                </h3>
                <ul className="grid gap-x-6 border-t border-steel-300 sm:grid-cols-2">
                  {category.items.map((item, i) => (
                    <li key={item} className="flex items-baseline gap-3 border-b border-steel-300 py-2 text-small">
                      <span className="font-mono text-[11px] text-steel-500">{String(i + 1).padStart(2, '0')}</span>
                      <span className="font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {category.materials.length > 0 && (
                <section aria-labelledby="drawer-materials">
                  <h3 id="drawer-materials" className="label-mono mb-3 font-medium [font-stretch:100%] text-steel-500">
                    {t.materials}
                  </h3>
                  <ul className="flex flex-wrap gap-1.5">
                    {category.materials.map((m) => (
                      <li key={m}>
                        <MonoLabel>{m}</MonoLabel>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {category.notes.length > 0 && (
                <ul className="space-y-1 text-small text-ink">
                  {category.notes.map((n) => (
                    <li key={n} className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-red" aria-hidden />
                      {n}
                    </li>
                  ))}
                </ul>
              )}

              <p className="label-mono text-steel-500">{t.custom}</p>
            </div>

            <footer className="relative grid gap-2 border-t border-steel-300 bg-paper px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:grid-cols-[1fr_auto] md:px-8">
              <Button href={whatsappHref(t.enquireMsg(category.name))} icon={<WhatsAppIcon />} magnetic={false} className="w-full">
                {t.enquire}
              </Button>
              <Button href={telHref()} variant="outline" icon={<PhoneIcon />} magnetic={false} aria-label={`Call ${company.phone.display}`}>
                {company.phone.display}
              </Button>
              <button
                type="button"
                onClick={() => {
                  quoteStore.set(category.slug)
                  onClose()
                  setTimeout(() => scrollToTarget(lenis, 'quote'), 80)
                }}
                className="label-mono py-2 text-left text-ink underline decoration-red underline-offset-4 hover:text-red sm:col-span-2"
              >
                {content.quote.fromDrawer} →
              </button>
            </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
