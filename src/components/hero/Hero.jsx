import { Component, Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { content, company } from '../../data/content.js'
import { telHref, whatsappHref } from '../../lib/contact.js'
import { heroStore, requestFrame, range } from '../../lib/heroStore.js'
import { dprCap, hasFinePointer, hasWebGL, isLowEnd, isSmallScreen, prefersReducedMotion } from '../../lib/device.js'
import Button from '../ui/Button.jsx'
import MonoLabel from '../ui/MonoLabel.jsx'
import DimensionLine from '../ui/DimensionLine.jsx'
import { PhoneIcon, WhatsAppIcon } from '../ui/Icons.jsx'
import DriftingParts from '../DriftingParts.jsx'
import HeroPoster from './HeroPoster.jsx'
import HeroDimensions from './HeroDimensions.jsx'
import TorqueReadout from './TorqueReadout.jsx'

const HeroScene = lazy(() => import('./HeroScene.jsx'))
const t = content.hero

/** Keeps the poster if the 3D chunk or WebGL fails. */
class SceneBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

const idle = (fn) => (window.requestIdleCallback ? requestIdleCallback(fn, { timeout: 1200 }) : setTimeout(fn, 200))

/** Resolves when the intro loader has finished (or immediately if it never ran). */
function onIntro(stage, fn) {
  const loading = document.documentElement.classList.contains('is-loading')
  const state = window.__saIntro
  if (!loading || state === stage || state === 'done') {
    fn()
    return () => {}
  }
  const ev = `sa:intro-${stage}`
  window.addEventListener(ev, fn, { once: true })
  return () => window.removeEventListener(ev, fn)
}

export default function Hero() {
  const section = useRef(null)
  const stage = useRef(null)
  const copy = useRef(null)
  const cue = useRef(null)
  const readout = useRef(null)
  const [mount3D, setMount3D] = useState(false)
  const [ready, setReady] = useState(false)

  // Device profile, decided once.
  const profile = useMemo(() => {
    const reduced = prefersReducedMotion()
    const small = isSmallScreen()
    const low = isLowEnd()
    return {
      reduced,
      small,
      low,
      webgl: hasWebGL(),
      detail: small || low ? 'low' : 'high',
      dpr: dprCap(),
      tilt: !reduced && !small && hasFinePointer(),
      parts: small ? 4 : 9,
    }
  }, [])

  // Mount the 3D scene after the intro, when the main thread is idle.
  useEffect(() => {
    if (!profile.webgl) return
    return onIntro('done', () => idle(() => setMount3D(true)))
  }, [profile.webgl])

  useEffect(() => {
    heroStore.onReady = () => setReady(true)
    return () => {
      heroStore.onReady = null
    }
  }, [])

  // Pin + scrubbed choreography; entrance of the copy.
  useGSAP(
    () => {
      if (profile.reduced) {
        heroStore.p = 1
        readout.current?.update(1)
        heroStore.onFrame?.(1)
        requestFrame()
        return
      }

      heroStore.p = 0
      readout.current?.update(0)

      const mm = gsap.matchMedia()
      mm.add({ desktop: '(min-width: 768px)', mobile: '(max-width: 767px)' }, (ctx) => {
        const { desktop } = ctx.conditions
        gsap.to(heroStore, {
          p: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: section.current,
            start: 'top top',
            end: desktop ? '+=220%' : '+=160%',
            pin: stage.current,
            scrub: 0.6,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
          onUpdate: () => {
            const p = heroStore.p
            readout.current?.update(p)
            heroStore.onFrame?.(p)
            if (cue.current) cue.current.style.opacity = String(1 - range(p, 0, 0.04))
            requestFrame()
          },
        })
      })

      // Copy entrance: lines rise out of their masks once the loader reveals the page.
      const q = gsap.utils.selector(copy)
      gsap.set(q('[data-line]'), { yPercent: 105 })
      gsap.set(q('[data-fade]'), { autoAlpha: 0, y: 16 })
      const cleanup = onIntro('reveal', () => {
        gsap
          .timeline({ defaults: { ease: 'expo.out' } })
          .to(q('[data-line]'), { yPercent: 0, duration: 1.1, stagger: 0.09 })
          .to(q('[data-fade]'), { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.07 }, 0.25)
      })
      const fonts = document.fonts?.ready.then(() => ScrollTrigger.refresh())
      return () => {
        cleanup()
        mm.revert()
        void fonts
      }
    },
    { scope: section },
  )

  // Desktop tilt: pointer position -> target tilt; the canvas damps toward it.
  useEffect(() => {
    if (!profile.tilt) return
    const el = stage.current
    const move = (e) => {
      heroStore.pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      heroStore.pointer.y = (e.clientY / window.innerHeight) * 2 - 1
      requestFrame()
    }
    const leave = () => {
      heroStore.pointer.x = 0
      heroStore.pointer.y = 0
      requestFrame()
    }
    el.addEventListener('pointermove', move, { passive: true })
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
    }
  }, [profile.tilt])

  const partsTrigger = useMemo(
    () => ({ trigger: section, start: 'top top', end: profile.small ? '+=160%' : '+=220%' }),
    [profile.small],
  )

  return (
    <section id="top" ref={section} aria-labelledby="hero-title" className="relative">
      <div ref={stage} className="relative flex h-[100svh] flex-col overflow-hidden bg-paper pt-[var(--nav-h)] md:block">
        <div className="bp-grid bp-grid-fade pointer-events-none absolute inset-0" aria-hidden />
        <DriftingParts count={profile.parts} scrollTrigger={profile.reduced ? null : partsTrigger} />

        {/* Copy */}
        <div ref={copy} className="container-x relative z-10 pt-6 md:flex md:h-full md:items-center md:pt-0">
          <div className="md:max-w-[min(38rem,46%)] md:pb-16">
            <div data-fade>
              <MonoLabel dot>{t.eyebrow}</MonoLabel>
            </div>
            <h1 id="hero-title" className="display-wide mt-5 text-[clamp(2.6rem,1.2rem+5.6vw,6.9rem)] leading-[0.92] tracking-[-0.03em] md:mt-8">
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
            <p
              data-fade
              className="mt-4 max-w-[44ch] text-[0.95rem] leading-relaxed text-steel-700 max-md:[@media(max-height:780px)]:hidden md:mt-6 md:text-body-lg"
            >
              {t.lead}
            </p>
            <div data-fade className="mt-5 flex gap-2.5 md:mt-9 md:gap-3">
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
        </div>

        {profile.small && (
          <div className="container-x relative z-10 mt-5">
            <TorqueReadout ref={readout} compact />
          </div>
        )}

        {/* 3D stage: poster -> lazy canvas, with projected dimensions and the readout */}
        <div className="relative min-h-0 flex-1 md:absolute md:inset-0">
          <div
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 md:left-[42%] ${ready ? 'opacity-0' : 'opacity-100'}`}
            aria-hidden={ready || undefined}
          >
            <HeroPoster seated={profile.reduced} className="h-[88%] w-auto max-w-full md:h-[78%]" />
          </div>
          {mount3D && (
            <SceneBoundary>
              <Suspense fallback={null}>
                <HeroScene dpr={profile.dpr} detail={profile.detail} tilt={profile.tilt} lowEnd={profile.low} />
              </Suspense>
            </SceneBoundary>
          )}
          <div className={`transition-opacity duration-500 ${ready ? 'opacity-100' : 'opacity-0'}`}>
            <HeroDimensions compact={profile.small} />
          </div>
          {!profile.small && <TorqueReadout ref={readout} className="absolute right-[var(--gutter)] bottom-8" />}
        </div>

        {/* Scroll cue */}
        {!profile.reduced && (
          <div
            ref={cue}
            className="label-mono pointer-events-none absolute bottom-6 left-[var(--gutter)] z-10 hidden items-center gap-3 text-steel-700 md:flex"
            aria-hidden
          >
            <span className="relative block h-10 w-px overflow-hidden bg-steel-300">
              <span className="absolute inset-x-0 top-0 h-1/2 animate-[sa-cue_1.8s_var(--ease-machine)_infinite] bg-red" />
            </span>
            {t.scrollCue}
          </div>
        )}
      </div>
    </section>
  )
}
