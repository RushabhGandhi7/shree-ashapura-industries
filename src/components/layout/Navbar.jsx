import { useEffect, useRef, useState } from 'react'
import { content, company } from '../../data/content.js'
import { telHref, whatsappHref } from '../../lib/contact.js'
import { useLenis, scrollToTarget } from '../../lib/smoothScroll.jsx'
import Logo from '../ui/Logo.jsx'
import Button from '../ui/Button.jsx'
import { PhoneIcon, WhatsAppIcon } from '../ui/Icons.jsx'
import { Suspense, lazy } from 'react'

// Framer Motion only ships with the menu, loaded on first open (prefetched when idle).
const loadMenu = () => import('./MobileMenu.jsx')
const MobileMenu = lazy(loadMenu)

const t = content.nav

export default function Navbar() {
  const lenis = useLenis()
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [open, setOpen] = useState(false)
  const lastY = useRef(0)
  const [menuLoaded, setMenuLoaded] = useState(false)
  useEffect(() => {
    if (open) setMenuLoaded(true)
  }, [open])
  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((f) => setTimeout(f, 2500))
    idle(() => loadMenu())
  }, [])
  const menuBtn = useRef(null)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 8)
      // Hide when scrolling down past the fold, show on any upward scroll.
      if (y > 480 && y > lastY.current + 4) setHidden(true)
      else if (y < lastY.current - 4 || y < 480) setHidden(false)
      lastY.current = y
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const go = (e, id) => {
    e.preventDefault()
    setOpen(false)
    scrollToTarget(lenis, id)
    history.replaceState(null, '', id === 'top' ? location.pathname : `#${id}`)
  }

  return (
    <>
      <a
        href="#main"
        className="sr-only-focusable fixed top-3 left-3 z-[80] rounded-xs bg-ink px-4 py-2 text-small text-paper"
      >
        {content.skipLink}
      </a>

      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[transform,background-color,box-shadow] duration-500 ease-[var(--ease-out)] ${
          hidden && !open ? '-translate-y-full' : 'translate-y-0'
        } ${scrolled ? 'bg-paper/85 shadow-[0_1px_0_var(--color-steel-300)] backdrop-blur-md' : 'bg-transparent'}`}
      >
        <div className="container-x flex h-[var(--nav-h)] items-center justify-between gap-6">
          <a href="#top" onClick={(e) => go(e, 'top')} className="-ml-1 p-1">
            <Logo />
            <span className="sr-only">, back to top</span>
          </a>

          <nav aria-label={t.label} className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {t.links.map((l, i) => (
                <li key={l.id}>
                  <a
                    href={`#${l.id}`}
                    onClick={(e) => go(e, l.id)}
                    className="group relative inline-flex items-baseline gap-1.5 px-3 py-2 text-small font-medium text-ink transition-colors hover:text-red"
                  >
                    <span className="label-mono text-[0.6rem] text-steel-500 group-hover:text-red" aria-hidden>
                      0{i + 1}
                    </span>
                    {l.label}
                    <span
                      className="absolute inset-x-3 bottom-1 h-px origin-left scale-x-0 bg-red transition-transform duration-300 ease-[var(--ease-out)] group-hover:scale-x-100"
                      aria-hidden
                    />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 sm:flex">
              <Button
                href={telHref()}
                variant="outline"
                size="sm"
                icon={<PhoneIcon size={16} />}
                aria-label={`${t.call} ${company.phone.display}`}
              >
                {t.call}
              </Button>
              <Button href={whatsappHref(content.whatsappMessages.general)} size="sm" icon={<WhatsAppIcon size={16} />}>
                {t.whatsapp}
              </Button>
            </div>
            {/* Compact WhatsApp on phones */}
            <a
              href={whatsappHref(content.whatsappMessages.general)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t.whatsapp}
              className="grid size-11 place-items-center rounded-xs bg-red text-paper sm:hidden"
            >
              <WhatsAppIcon size={20} />
            </a>

            <button
              ref={menuBtn}
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={t.openMenu}
              className="relative -mr-2 grid size-11 place-items-center rounded-xs lg:hidden"
            >
              <span className="flex w-6 flex-col items-end gap-[5px]" aria-hidden>
                <span className="h-[1.5px] w-6 bg-ink" />
                <span className="h-[1.5px] w-4 bg-red" />
                <span className="h-[1.5px] w-6 bg-ink" />
              </span>
            </button>
          </div>
        </div>
      </header>

      {menuLoaded && (
        <Suspense fallback={null}>
          <MobileMenu open={open} onClose={() => setOpen(false)} onNavigate={go} returnFocusRef={menuBtn} />
        </Suspense>
      )}
    </>
  )
}
