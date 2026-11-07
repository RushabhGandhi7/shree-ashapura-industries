import { useEffect, useRef } from 'react'
import { NavLink } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { content, company } from '../../data/content.js'
import { telHref, whatsappHref } from '../../lib/contact.js'
import { useLenis } from '../../lib/smoothScroll.jsx'
import { useReducedMotion } from '../../hooks/useReducedMotion.js'
import Logo from '../ui/Logo.jsx'
import Button from '../ui/Button.jsx'
import { PhoneIcon, WhatsAppIcon } from '../ui/Icons.jsx'

const t = content.nav
const ease = [0.16, 1, 0.3, 1]

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

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="mobile-menu"
          ref={panel}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="bp-grid fixed inset-0 z-[60] flex flex-col xl:hidden"
          initial={{ clipPath: 'inset(0 0 100% 0)' }}
          animate={{ clipPath: 'inset(0 0 0% 0)' }}
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: 0.6 * d, ease }}
        >
          <div className="container-x flex h-[var(--nav-h)] items-center justify-between">
            <Logo />
            <button
              type="button"
              onClick={onClose}
              aria-label={t.closeMenu}
              className="relative -mr-2 grid size-11 place-items-center rounded-xs"
            >
              <span className="relative block size-6" aria-hidden>
                <span className="absolute top-1/2 left-0 h-[1.5px] w-6 rotate-45 bg-ink" />
                <span className="absolute top-1/2 left-0 h-[1.5px] w-6 -rotate-45 bg-red" />
              </span>
            </button>
          </div>

          <nav aria-label={t.label} className="container-x flex flex-1 flex-col justify-center">
            <ul className="border-t border-steel-300">
              {t.links.map((l, i) => (
                <motion.li
                  key={l.to}
                  className="border-b border-steel-300"
                  initial={{ opacity: 0, y: 24 * d }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 * d, delay: (0.15 + i * 0.05) * d, ease }}
                >
                  <NavLink
                    to={l.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-baseline justify-between gap-4 py-3 font-display text-[clamp(1.6rem,7vw,2.6rem)] leading-none font-[760] tracking-[-0.02em] [font-stretch:118%] active:text-red ${isActive ? 'text-red' : ''}`
                    }
                  >
                    {l.label}
                    <span className="label-mono text-steel-500" aria-hidden>
                      0{i + 1}
                    </span>
                  </NavLink>
                </motion.li>
              ))}
            </ul>
          </nav>

          <motion.div
            className="container-x grid gap-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] xs:grid-cols-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 * d, delay: 0.4 * d }}
          >
            <Button href={telHref()} variant="outline" icon={<PhoneIcon />} magnetic={false} className="w-full">
              {company.phone.display}
            </Button>
            <Button
              href={whatsappHref(content.whatsappMessages.general)}
              icon={<WhatsAppIcon />}
              magnetic={false}
              className="w-full"
            >
              {t.whatsapp}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
