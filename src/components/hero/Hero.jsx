import { Component, Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { content, company } from '../../data/content.js'
import { telHref, whatsappHref } from '../../lib/contact.js'
import { heroStore, requestFrame, range } from '../../lib/heroStore.js'
import { dprCap, hasFinePointer, hasWebGL, isLowEnd, isSmallScreen, partDetail, prefersReducedMotion } from '../../lib/device.js'
import Button from '../ui/Button.jsx'
import MonoLabel from '../ui/MonoLabel.jsx'
import DimensionLine from '../ui/DimensionLine.jsx'
import { PhoneIcon, WhatsAppIcon } from '../ui/Icons.jsx'
import DriftingParts from '../DriftingParts.jsx'
import { useGLGate, useGLHold } from '../../lib/glGate.js'
import HeroDimensions from './HeroDimensions.jsx'
import TorqueReadout from './TorqueReadout.jsx'

const HeroScene = lazy(() => import('./HeroScene.jsx'))
const t = content.hero
// Poster renders of the hero scene (scripts/render-posters.mjs): rest pose, and the seated
// pose shown under reduced motion. Each is the camera's fitted rect grown by GROW (so the
// contact shadows are included); contain-fitted into the frame box and scaled up by GROW,
// the part lands exactly where the live camera draws it.
const GROW = 1.2
const POSTER = {
  rest: { src: '/posters/hero.webp', w: 1688, h: 2088 },
  seated: { src: '/posters/hero-seated.webp', w: 1860, h: 1600 },
}

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
  // Two readouts are always rendered (phone strip / desktop card) and CSS shows one, so the
  // prerendered page (snapshotted on desktop) has the same layout as phones once React runs.
  // `readout` drives both.
  const readoutSm = useRef(null)
  const readoutLg = useRef(null)
  const readout = useRef({
    update: (p) => {
      readoutSm.current?.update(p)
      readoutLg.current?.update(p)
    },
  })
  const stage3d = useRef(null)
  const frame = useRef(null)
  const readoutBox = useRef(null)
  const [introDone, setIntroDone] = useState(false)
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
      detail: partDetail(),
      dpr: dprCap(),
      tilt: !reduced && !small && hasFinePointer(),
      parts: small ? 4 : 9,
    }
  }, [])

  // Mount the 3D scene after the intro, when the main thread is idle, and only while this
  // section holds the page's single WebGL slot (src/lib/glGate.js).
  useEffect(() => {
    if (!profile.webgl) return
    return onIntro('done', () => idle(() => setIntroDone(true)))
  }, [profile.webgl])
  const allowed = useGLGate('hero', section, { enabled: profile.webgl })
  const mount3D = introDone && allowed
  useGLHold('hero', mount3D)
  useEffect(() => {
    if (!mount3D) setReady(false) // poster back while the canvas is away
  }, [mount3D])

  // Framing box for the camera, in canvas pixels: the `frame` element (the space the subject
  // may use) and the torque readout's box (the model is kept clear of it). Re-measured on
  // any size change; HeroScene fits the bolt + plate into it every frame.
  useEffect(() => {
    const canvasBox = stage3d.current
    const measure = () => {
      const c = canvasBox.getBoundingClientRect()
      const rel = (el) => {
        if (!el) return null
        const r = el.getBoundingClientRect()
        return { x0: r.left - c.left, y0: r.top - c.top, x1: r.right - c.left, y1: r.bottom - c.top }
      }
      heroStore.frame = { ...rel(frame.current), avoid: rel(readoutBox.current) }
      requestFrame()
    }
    measure()
    const ro = new ResizeObserver(measure)
    ;[canvasBox, frame.current, readoutBox.current].forEach((el) => el && ro.observe(el))
    return () => {
      ro.disconnect()
      heroStore.frame = null
    }
  }, [])

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
      // The headline is the LCP element. It only rises out of its mask when the intro
      // loader is covering the page; otherwise it paints immediately (fast LCP) and just
      // the smaller elements fade in.
      const withIntro = document.documentElement.classList.contains('is-loading')
      if (withIntro) gsap.set(q('[data-line]'), { yPercent: 105 })
      // after a static-shell paint the copy is already on screen: don't hide it again
      const fade = withIntro || !window.__saShell
      if (fade) gsap.set(q('[data-fade]'), { autoAlpha: 0, y: 16 })
      const cleanup = onIntro('reveal', () => {
        const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
        if (withIntro) tl.to(q('[data-line]'), { yPercent: 0, duration: 1.1, stagger: 0.09 })
        if (fade) tl.to(q('[data-fade]'), { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.07 }, withIntro ? 0.25 : 0.05)
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
      {/* Phones / tablets (< lg): copy first, 3D below, in one 100svh pinned stage.
          Desktop (lg+): copy left, 3D right; at least 100svh. The stage starts below the fixed
          header + scroll ruler (--chrome-h-max: their height at scroll 0). */}
      <div
        ref={stage}
        className="relative flex h-[100svh] flex-col overflow-hidden bg-paper pt-[var(--chrome-h-max)] lg:block lg:h-auto lg:min-h-[100svh]"
      >
        <div className="bp-grid bp-grid-fade pointer-events-none absolute inset-0" aria-hidden />
        <DriftingParts count={profile.parts} scrollTrigger={profile.reduced ? null : partsTrigger} />

        {/* Copy. On lg it is centred with auto margins in the space under the chrome: if it is
            taller than that space it grows downwards (never up under the header). */}
        <div
          ref={copy}
          className="container-x relative z-10 pt-[clamp(1rem,3svh,2.5rem)] lg:flex lg:min-h-[calc(100svh-var(--chrome-h-max))] lg:flex-col lg:pb-[clamp(1rem,4svh,3rem)]"
        >
          <div className="@container lg:my-auto lg:max-w-[min(38rem,46%)]">
            <div data-fade>
              <MonoLabel dot>{t.eyebrow}</MonoLabel>
            </div>
            <h1
              id="hero-title"
              className="display-wide mt-5 text-[clamp(2.6rem,min(1.2rem+5.6vw,12svh,14.5cqi),6.9rem)] leading-[0.92] tracking-[-0.03em] lg:mt-[clamp(1rem,3.5svh,2rem)]"
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
            <div data-fade className="mt-[clamp(0.75rem,2.5svh,1.25rem)] hidden md:block">
              <DimensionLine length="min(100%, 30rem)" label={t.tolerance} trigger="mount" delay={0.4} />
            </div>
            <p
              data-fade
              className="mt-4 max-w-[44ch] text-[0.95rem] leading-relaxed text-steel-700 max-md:[@media(max-height:780px)]:hidden md:mt-[clamp(0.75rem,2.5svh,1.5rem)] md:text-body-lg"
            >
              {t.lead}
            </p>
            <div data-fade className="mt-5 flex gap-2.5 md:mt-[clamp(1.25rem,4svh,2.25rem)] md:gap-3">
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
            {/* Scroll cue: in the copy flow under the CTAs, so it can never cover them. Hidden on
                phones, on short screens, and faded out once scrolling starts. */}
            {!profile.reduced && (
              <div
                ref={cue}
                className="label-mono pointer-events-none mt-[clamp(1.25rem,4svh,2.5rem)] hidden items-center gap-3 text-steel-700 md:flex [@media(max-height:640px)]:hidden"
                aria-hidden
              >
                <span className="relative block h-10 w-px overflow-hidden bg-steel-300">
                  <span className="absolute inset-x-0 top-0 h-1/2 animate-[sa-cue_1.8s_var(--ease-machine)_infinite] bg-red" />
                </span>
                {t.scrollCue}
              </div>
            )}
          </div>
        </div>

        <div className="container-x relative z-10 mt-5 md:hidden">
          <TorqueReadout ref={readoutSm} compact />
        </div>

        {/* 3D stage: poster -> lazy canvas, with projected dimensions and the readout.
            `frame` is the box the subject is fitted into: HeroScene fits the model into it
            (heroStore.frame) and the poster, a render of the same scene (public/posters, from
            scripts/render-posters.mjs), is contain-fitted into the same box, so the swap is an
            opacity crossfade with no size or position change. The box is laid out in CSS
            only (it stays clear of the readout, bottom-right with equal margins), so it is the
            same before and after the 3D loads. */}
        <div ref={stage3d} className="relative min-h-0 flex-1 lg:absolute lg:inset-0">
          <div
            ref={frame}
            className="pointer-events-none absolute inset-x-[var(--gutter)] top-3 bottom-3 md:right-[calc(var(--gutter)+15.5rem+0.75rem)] lg:top-[calc(var(--chrome-h-max)+clamp(1rem,3svh,2.5rem))] lg:bottom-[var(--gutter)] lg:left-[44%]"
            aria-hidden
          >
            <img
              src={(profile.reduced ? POSTER.seated : POSTER.rest).src}
              alt=""
              width={(profile.reduced ? POSTER.seated : POSTER.rest).w}
              height={(profile.reduced ? POSTER.seated : POSTER.rest).h}
              fetchPriority="high"
              decoding="async"
              style={{ transform: `scale(${GROW})` }}
              className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-700 ${ready ? 'opacity-0' : 'opacity-100'}`}
            />
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
          <div ref={readoutBox} className="absolute right-[var(--gutter)] bottom-[var(--gutter)] hidden md:block">
            <TorqueReadout ref={readoutLg} />
          </div>
        </div>
      </div>
    </section>
  )
}
