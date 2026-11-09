import { useEffect, useRef } from 'react'
import { NavLink } from 'react-router'
import { AnimatePresence, LazyMotion, m } from 'framer-motion'
import { content, company } from '../../data/content.js'
import { telHref, whatsappHref } from '../../lib/contact.js'
import { useLenis } from '../../lib/smoothScroll.jsx'
import { useReducedMotion } from '../../hooks/useReducedMotion.js'
import Logo from '../ui/Logo.jsx'
import Button from '../ui/Button.jsx'
import { PhoneIcon, WhatsAppIcon } from '../ui/Icons.jsx'

const t = content.nav
const ease = [0.16, 1, 0.3, 1]
// domAnimation only (shared with PageTransition): the full `motion` component would pull in
// Framer's gesture + layout features (~34 KB gzip) on every page below xl.
const features = () => import('../../layout/motion-features.js').then((r) => r.default)

export default function MobileMenu({ open, onClose, returnFocusRef }) {
  const lenis = useLenis()
  const reduced = useReducedMotion()
  const panel = useRef(null)

  // Lock scroll, trap focus, close on Escape.
  useEffect(() => {
    if (!open) return
    lenis?.stop()
    document.documentElement.style.overflow = 'hidden'
    const prev = document.activeElement
    requestAnimationFrame(() => panel.current?.querySelector('button, a')?.focus())

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
      ;(returnFocusRef?.current ?? prev)?.focus?.()
    }
  }, [open, lenis, onClose, returnFocusRef])

  const d = reduced ? 0 : 1

  // Slide-down panel from under the bar; reduced motion: opacity only.
  const panelMotion = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.15 } }
    : { initial: { y: '-100%' }, animate: { y: 0 }, exit: { y: '-100%' }, transition: { duration: 0.5, ease } }

  return (
    <LazyMotion features={features} strict>
      <AnimatePresence>
        {open && (
          <div key="menu" className="fixed inset-0 z-[60] xl:hidden">
            {/* scrim over the page below the panel; click closes */}
            <m.div
              className="absolute inset-0 bg-ink/25"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 * d }}
              onClick={onClose}
              aria-hidden
            />
            <m.div
              id="mobile-menu"
              ref={panel}
              role="dialog"
              aria-modal="true"
              aria-label={t.menuLabel}
              className="absolute inset-x-0 top-0 flex max-h-[100svh] flex-col overflow-y-auto border-b border-steel-300 bg-paper shadow-[0_24px_48px_-24px_rgb(28_29_31/0.35)]"
              {...panelMotion}
            >
              <div className="bp-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden />
              <div className="container-x relative flex h-[var(--nav-h)] shrink-0 items-center justify-between">
                <Logo />
                <button type="button" onClick={onClose} aria-label={t.closeMenu} className="relative -mr-2 grid size-11 place-items-center rounded-xs">
                  <span className="relative block size-6" aria-hidden>
                    <span className="absolute top-1/2 left-0 h-[1.5px] w-6 rotate-45 bg-ink" />
                    <span className="absolute top-1/2 left-0 h-[1.5px] w-6 -rotate-45 bg-red" />
                  </span>
                </button>
              </div>

              <nav aria-label={t.label} className="container-x relative">
                <ul className="border-t border-steel-300">
                  {t.links.map((l, i) => (
                    <m.li
                      key={l.to}
                      className="border-b border-steel-300"
                      initial={{ opacity: 0, y: -8 * d }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 * d, delay: (0.12 + i * 0.035) * d, ease }}
                    >
                      <NavLink
                        to={l.to}
                        onClick={onClose}
                        className={({ isActive }) =>
                          `group flex items-baseline gap-4 py-3.5 font-display text-[clamp(1.35rem,5.5vw,1.9rem)] leading-none font-[760] tracking-[-0.02em] [font-stretch:118%] active:text-red ${isActive ? 'text-red' : 'text-ink'}`
                        }
                      >
                        <span className="label-mono w-6 shrink-0 text-[0.7rem] text-steel-500 group-[.text-red]:text-red" aria-hidden>
                          0{i + 1}
                        </span>
                        {l.label}
                      </NavLink>
                    </m.li>
                  ))}
                </ul>
              </nav>

              <div className="container-x relative grid gap-3 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] xs:grid-cols-2">
                <Button href={telHref()} variant="outline" icon={<PhoneIcon />} magnetic={false} className="w-full" aria-label={`${t.call} ${company.phone.display}`}>
                  {company.phone.display}
                </Button>
                <Button href={whatsappHref(content.whatsappMessages.general)} icon={<WhatsAppIcon />} magnetic={false} className="w-full">
                  {t.whatsapp}
                </Button>
              </div>
            </m.div>
          </div>
        )}
      </AnimatePresence>
    </LazyMotion>
  )
}
