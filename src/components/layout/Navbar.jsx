import { Suspense, lazy, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { content, company } from '../../data/content.js'
import { telHref, whatsappHref } from '../../lib/contact.js'
import Logo from '../ui/Logo.jsx'
import Button from '../ui/Button.jsx'
import { PhoneIcon, WhatsAppIcon } from '../ui/Icons.jsx'
import NavProgress, { useScrollProgress } from './NavProgress.jsx'

// Framer Motion only ships with the menu (loaded on first open, prefetched when idle) and
// with the desktop caliper indicator (loaded when idle on xl screens). The main bundle and
// the first paint use the plain link list below.
const loadMenu = () => import('./MobileMenu.jsx')
const MobileMenu = lazy(loadMenu)
const NavLinksCaliper = lazy(() => import('./NavLinksCaliper.jsx'))

const t = content.nav
const CONDENSE_AT = 80 // px scrolled before the bar shrinks

export const navLinkClass = ({ isActive }) =>
  `group relative inline-flex items-baseline gap-1.5 px-3 py-2 xl:max-2xl:px-2 text-small font-medium transition-colors hover:text-red ${isActive ? 'is-active text-red' : 'text-ink'}`

/** The desktop links without the caliper (first paint, prerender, until the chunk loads). */
export function NavLinksPlain() {
  return (
    <ul className="flex items-center gap-1">
      {t.links.map((l, i) => (
        <li key={l.to}>
          <NavLink to={l.to} end={l.to === '/'} className={navLinkClass}>
            <span className="label-mono text-[0.6rem] text-steel-500 group-hover:text-red" aria-hidden>
              0{i + 1}
            </span>
            {l.label}
          </NavLink>
        </li>
      ))}
    </ul>
  )
}

export default function Navbar() {
  const { pathname } = useLocation()
  const [condensed, setCondensed] = useState(false)
  const [open, setOpen] = useState(false)
  const [menuLoaded, setMenuLoaded] = useState(false)
  const [caliper, setCaliper] = useState(false)
  const menuBtn = useRef(null)
  const header = useRef(null)

  useEffect(() => {
    if (open) setMenuLoaded(true)
  }, [open])
  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((f) => setTimeout(f, 2500))
    idle(() => {
      loadMenu()
      if (window.matchMedia('(min-width: 80rem)').matches) setCaliper(true)
    })
  }, [])

  // Always visible; shrinks once the page has scrolled past CONDENSE_AT (state flips only
  // when crossing, so scrolling does not re-render the bar).
  useScrollProgress((y) => setCondensed(y > CONDENSE_AT))

  // Publish the header's live height as --header-h (and the expanded height as
  // --header-h-max): the ruler, the hero padding, pinned stages and scroll padding read them.
  // The bar's height transition fires the observer every frame, so the ruler follows it.
  useLayoutEffect(() => {
    const el = header.current
    const root = document.documentElement.style
    const write = () => {
      const h = el.getBoundingClientRect().height
      root.setProperty('--header-h', `${h}px`)
      if (el.dataset.condensed !== 'true') root.setProperty('--header-h-max', `${h}px`)
    }
    write()
    const ro = new ResizeObserver(write)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // New page: close the menu.
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <>
      <a
        href="#main"
        className="sr-only-focusable fixed top-3 left-3 z-[80] rounded-xs bg-ink px-4 py-2 text-small text-paper"
      >
        {content.skipLink}
      </a>

      {/* Fixed, outside <main> and the page transition: no transformed ancestor. */}
      {/* No border of its own: the scroll ruler's track (NavProgress, fixed right under the
          header) is the header's bottom edge, so there is only ever one line. */}
      <header
        ref={header}
        data-condensed={condensed}
        className={`fixed inset-x-0 top-0 z-[var(--z-header)] transition-[background-color,backdrop-filter] duration-300 ease-[var(--ease-out)] motion-reduce:transition-none ${
          condensed ? 'bg-paper/85 backdrop-blur-md' : 'bg-transparent'
        }`}
      >
        <div
          className={`container-x flex items-center justify-between gap-2 transition-[height] duration-300 ease-[var(--ease-out)] motion-reduce:transition-none sm:gap-6 xl:max-2xl:gap-4 ${
            condensed ? 'h-[calc(var(--nav-h)*0.75)]' : 'h-[var(--nav-h)]'
          }`}
        >
          <Link to="/" className="-ml-1 p-1">
            <Logo condensed={condensed} />
            <span className="sr-only">, home</span>
          </Link>

          <nav aria-label={t.label} className="hidden xl:block">
            {caliper ? (
              <Suspense fallback={<NavLinksPlain />}>
                <NavLinksCaliper />
              </Suspense>
            ) : (
              <NavLinksPlain />
            )}
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
                {/* 8 nav links: at xl (1280–1535) the Call button is icon-only so the bar fits */}
                <span className="xl:max-2xl:sr-only">{t.call}</span>
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
              className="relative -mr-2 grid size-11 place-items-center rounded-xs xl:hidden"
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
      <NavProgress />

      {menuLoaded && (
        <Suspense fallback={null}>
          <MobileMenu open={open} onClose={() => setOpen(false)} returnFocusRef={menuBtn} />
        </Suspense>
      )}
    </>
  )
}
