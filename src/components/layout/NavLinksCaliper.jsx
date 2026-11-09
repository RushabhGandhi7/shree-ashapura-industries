// Desktop nav links with the "caliper" indicator: a thin red dimension bracket (|—|) that
// springs under the hovered link (or the active one) via a shared layoutId, with a mono
// readout of the measured link width. Lazy chunk: Framer's layout features (domMax) load
// only on xl screens, after first paint; NavLinksPlain renders the same list until then.
import { memo, useLayoutEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router'
import { LazyMotion, domMax, m } from 'framer-motion'
import { content } from '../../data/content.js'
import { useReducedMotion } from '../../hooks/useReducedMotion.js'
import { navLinkClass } from './Navbar.jsx'

const t = content.nav
const spring = { type: 'spring', stiffness: 500, damping: 38, mass: 0.6 }
const INSET = 12 // px: the bracket sits inside the link's px-3 padding

const isActive = (to, pathname) => pathname === to || pathname.startsWith(`${to}/`)

function NavLinksCaliper() {
  const { pathname } = useLocation()
  const reduced = useReducedMotion()
  const [hovered, setHovered] = useState(null)
  const [width, setWidth] = useState('')
  const links = useRef([])

  const active = t.links.findIndex((l) => isActive(l.to, pathname))
  const target = hovered ?? (active >= 0 ? active : null)

  useLayoutEffect(() => {
    const el = target === null ? null : links.current[target]
    if (el) setWidth((el.getBoundingClientRect().width - INSET * 2).toFixed(1))
  }, [target])

  return (
    <LazyMotion features={domMax} strict>
      <ul className="flex items-center gap-1" onMouseLeave={() => setHovered(null)} onBlur={() => setHovered(null)}>
        {t.links.map((l, i) => (
          <li key={l.to} onMouseEnter={() => setHovered(i)} onFocus={() => setHovered(i)}>
            <NavLink to={l.to} ref={(el) => (links.current[i] = el)} className={navLinkClass}>
              <span className="label-mono text-[0.6rem] text-steel-500 group-hover:text-red" aria-hidden>
                0{i + 1}
              </span>
              {l.label}
              {target === i && (
                <m.span
                  layoutId="nav-caliper"
                  transition={reduced ? { duration: 0 } : spring}
                  className="pointer-events-none absolute bottom-0.5 text-red"
                  style={{ left: INSET, right: INSET }}
                  aria-hidden
                >
                  {/* |—| : end ticks + line */}
                  <span className="absolute inset-x-0 top-0 h-px bg-current" />
                  <span className="absolute top-[-3px] left-0 h-[7px] w-px bg-current" />
                  <span className="absolute top-[-3px] right-0 h-[7px] w-px bg-current" />
                  <span className="label-mono absolute top-[3px] left-1/2 -translate-x-1/2 text-[8px] leading-none tracking-[0.08em] tabular-nums">
                    {width}
                  </span>
                </m.span>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </LazyMotion>
  )
}

// memo: the navbar re-renders when it condenses; the caliper must not re-measure / re-animate then.
export default memo(NavLinksCaliper)
