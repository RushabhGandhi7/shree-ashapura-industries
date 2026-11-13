import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { content, company } from '../../data/content.js'
import { telHref, whatsappHref } from '../../lib/contact.js'
import { isSmallScreen, prefersReducedMotion } from '../../lib/device.js'
import Button from '../ui/Button.jsx'
import MonoLabel from '../ui/MonoLabel.jsx'
import DimensionLine from '../ui/DimensionLine.jsx'
import { PhoneIcon, WhatsAppIcon } from '../ui/Icons.jsx'
import DriftingParts from '../DriftingParts.jsx'

const t = content.hero
// A still of the bolt seated in the tapped plate, rendered once from the former hero 3D scene
// at 2× (transparent WebP). Static: no canvas, no pin, no scroll timeline.
const STILL = { src: '/posters/hero-still.webp', w: 1860, h: 1600 }

/** Runs `fn` once the intro loader reveals the page (or now, if it never ran). */
function onIntroReveal(fn) {
  const state = window.__saIntro
  if (!document.documentElement.classList.contains('is-loading') || state === 'reveal' || state === 'done') {
    fn()
    return () => {}
  }
  window.addEventListener('sa:intro-reveal', fn, { once: true })
  return () => window.removeEventListener('sa:intro-reveal', fn)
}

export default function Hero() {
  const copy = useRef(null)

  // One-shot entrance of the copy (no ScrollTrigger). The headline is the LCP element: it only
  // rises out of its mask while the intro loader covers the page; otherwise it paints at once.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const q = gsap.utils.selector(copy)
      const withIntro = document.documentElement.classList.contains('is-loading')
      const fade = withIntro || !window.__saShell // after a prerendered paint the copy is already on screen
      if (withIntro) gsap.set(q('[data-line]'), { yPercent: 105 })
      if (fade) gsap.set(q('[data-fade]'), { autoAlpha: 0, y: 16 })
      return onIntroReveal(() => {
        const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
        if (withIntro) tl.to(q('[data-line]'), { yPercent: 0, duration: 1.1, stagger: 0.09 })
        if (fade) tl.to(q('[data-fade]'), { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.07 }, withIntro ? 0.25 : 0.05)
      })
    },
    { scope: copy },
  )

  return (
    <section id="top" aria-labelledby="hero-title" className="hero relative section-y overflow-hidden bg-paper">
      <div className="bp-grid bp-grid-fade pointer-events-none absolute inset-0" aria-hidden />
      <DriftingParts count={isSmallScreen() ? 4 : 9} />

      <div className="container-x relative z-10 grid items-center gap-y-8 lg:grid-cols-12 lg:gap-x-10">
        <div ref={copy} className="@container lg:col-span-6">
          <div data-fade>
            <MonoLabel dot>{t.eyebrow}</MonoLabel>
          </div>
          <h1
            id="hero-title"
            className="display-wide mt-5 text-[clamp(2.6rem,min(1.2rem+5.6vw,14.5cqi),6.9rem)] leading-[0.92] tracking-[-0.03em] lg:mt-8"
          >
            <span className="block overflow-hidden pb-[0.06em]">
              <span data-line className="block">
                {t.title[0]}
              </span>
            </span>
            <span className="block overflow-hidden pb-[0.06em]">
              <span data-line className="block text-red">
                {t.title[1]}
              </span>
            </span>
          </h1>
          <div data-fade className="mt-5 hidden md:block">
            <DimensionLine length="min(100%, 30rem)" label={t.tolerance} trigger="mount" delay={0.4} />
          </div>
          <p data-fade className="mt-4 max-w-[44ch] text-[0.95rem] leading-relaxed text-steel-700 md:mt-6 md:text-body-lg">
            {t.lead}
          </p>
          <div data-fade className="mt-6 flex gap-2.5 md:mt-9 md:gap-3">
            <Button
              href={telHref()}
              size="sm"
              icon={<PhoneIcon />}
              aria-label={`${t.callCta}: ${company.phone.display}`}
              className="min-[380px]:h-12 min-[380px]:px-6 min-[380px]:text-body md:h-14 md:px-8 md:text-body-lg"
            >
              {t.callCta}
            </Button>
            <Button
              href={whatsappHref(content.whatsappMessages.general)}
              variant="outline"
              size="sm"
              icon={<WhatsAppIcon />}
              className="min-[380px]:h-12 min-[380px]:px-6 min-[380px]:text-body md:h-14 md:px-8 md:text-body-lg"
            >
              {t.whatsappCta}
            </Button>
          </div>
        </div>

        <div className="hero-still lg:col-span-6">
          <img
            src={STILL.src}
            alt={t.posterAlt}
            width={STILL.w}
            height={STILL.h}
            fetchPriority="high"
            decoding="async"
            className="mx-auto block h-auto max-h-[42svh] w-auto max-w-full object-contain lg:max-h-[min(36rem,70svh)]"
          />
        </div>
      </div>
    </section>
  )
}
