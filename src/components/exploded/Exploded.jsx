import { Component, Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { content } from '../../data/content.js'
import { explodedStore, range } from '../../lib/explodedStore.js'
import { dprCap, hasWebGL, isLowEnd, isSmallScreen, prefersReducedMotion } from '../../lib/device.js'
import Annotations from '../annotate/Annotations.jsx'
import { useGLGate, useGLHold } from '../../lib/glGate.js'

const ExplodedScene = lazy(() => import('./ExplodedScene.jsx'))
const t = content.exploded

class Boundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

// When each part's annotations appear (scroll progress), used for the legend too.
const P_END = 0.8 // final pose: everything apart, all dimensions drawn
const PART_AT = [
  [0.14, 0.26],
  [0.38, 0.48],
  [0.5, 0.6],
]

const ITEMS = [
  { id: 'bolt', kind: 'leader', anchor: 'boltName', label: t.parts[0].name, sub: t.parts[0].std, at: PART_AT[0], dx: 42, dy: -28, len: 150 },
  { id: 'len', kind: 'dim', a: 'lenA', b: 'lenB', ea: 'lenEA', eb: 'lenEB', label: t.dims.len, at: [0.2, 0.34] },
  { id: 'dia', kind: 'dim', a: 'diaA', b: 'diaB', label: t.dims.dia, at: [0.26, 0.38] },
  { id: 'thr', kind: 'leader', anchor: 'thr', label: t.dims.thread, at: [0.3, 0.42], dx: 40, dy: 22, len: 104, tone: 'red' },
  { id: 'washer', kind: 'leader', anchor: 'washerName', label: t.parts[1].name, sub: t.parts[1].std, at: PART_AT[1], dx: 42, dy: -24, len: 150 },
  { id: 'wdia', kind: 'dim', a: 'wA', b: 'wB', ea: 'wEA', eb: 'wEB', label: t.dims.washer, at: [0.42, 0.54] },
  { id: 'nut', kind: 'leader', anchor: 'nutName', label: t.parts[2].name, sub: t.parts[2].std, at: PART_AT[2], dx: 42, dy: -22, len: 150 },
  { id: 'naf', kind: 'dim', a: 'nA', b: 'nB', ea: 'nEA', eb: 'nEB', label: t.dims.nut, at: [0.56, 0.68] },
  { id: 'nh', kind: 'dim', a: 'nhA', b: 'nhB', ea: 'nhEA', eb: 'nhEB', label: t.dims.nutH, at: [0.62, 0.72] },
]

/** Pinned section: bolt, washer and nut separate along their axis as you scroll. */
export default function Exploded() {
  const section = useRef(null)
  const stage = useRef(null)
  const legend = useRef(null)
  const cue = useRef(null)
  const [ready, setReady] = useState(false)

  const profile = useMemo(() => {
    const small = isSmallScreen()
    return {
      reduced: prefersReducedMotion(),
      small,
      webgl: hasWebGL(),
      dpr: dprCap(),
      detail: small || isLowEnd() ? 'low' : 'high',
    }
  }, [])

  // Live canvas only while this section holds the page's single WebGL slot.
  const mount3D = useGLGate('exploded', section, { enabled: profile.webgl })
  useGLHold('exploded', mount3D)
  useEffect(() => {
    if (!mount3D) setReady(false)
  }, [mount3D])

  useGSAP(
    () => {
      const rows = legend.current ? [...legend.current.children] : []
      const sync = (p) => {
        rows.forEach((r, i) => (r.dataset.active = p >= PART_AT[i][0] ? 'true' : 'false'))
        if (cue.current) cue.current.style.opacity = String(1 - range(p, 0, 0.06))
        explodedStore.onFrame?.(p)
        explodedStore.invalidate?.()
      }
      if (profile.reduced) {
        explodedStore.p = P_END
        sync(P_END)
        return
      }
      explodedStore.p = 0
      sync(0)
      const mm = gsap.matchMedia()
      mm.add({ desktop: '(min-width: 768px)', mobile: '(max-width: 767px)' }, (ctx) => {
        // The last motion (nut-height dimension) ends at p 0.72; scrubbing on to 1 left a long
        // pinned stretch where nothing moved. Stop at P_END (the reduced-motion pose) and
        // shorten the pin by the same factor, so the speed per scrolled px is unchanged.
        gsap.to(explodedStore, {
          p: P_END,
          ease: 'none',
          scrollTrigger: {
            trigger: section.current,
            start: 'top top',
            end: ctx.conditions.desktop ? `+=${200 * P_END}%` : `+=${150 * P_END}%`,
            pin: stage.current,
            scrub: 0.6,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
          onUpdate: () => sync(explodedStore.p),
        })
      })
      return () => mm.revert()
    },
    { scope: section },
  )

  return (
    <section id="exploded" ref={section} aria-labelledby="exploded-title" className="relative">
      <div ref={stage} className="relative flex h-[100svh] flex-col overflow-hidden bg-paper pt-[var(--chrome-h)] md:block">
        <div className="bp-grid pointer-events-none absolute inset-0 opacity-80" aria-hidden />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,transparent_30%,var(--color-paper)_85%)] md:bg-[radial-gradient(ellipse_at_68%_50%,transparent_35%,var(--color-paper)_80%)]"
          aria-hidden
        />

        {/* centred with auto margins below the fixed chrome: if taller, it grows down, never up */}
        <div className="container-x relative z-10 pt-6 md:flex md:h-full md:flex-col md:pt-0">
          <div className="md:my-auto md:max-w-[min(26rem,36%)] md:py-6">
            <p className="label-mono mb-4 flex items-center gap-3 text-steel-700 md:mb-6">
              <span className="h-px w-8 bg-red" aria-hidden />
              {t.label}
            </p>
            <h2 id="exploded-title" className="text-h2">
              {t.title[0]}
              <br />
              <span className="text-red">{t.title[1]}</span>
            </h2>
            <p className="mt-4 max-w-[38ch] text-[0.95rem] text-steel-700 max-md:[@media(max-height:760px)]:hidden md:mt-6 md:text-body">{t.lead}</p>
            <ol ref={legend} className="mt-5 hidden border-t border-steel-300 md:mt-8 md:block">
              {t.parts.map((part, i) => (
                <li
                  key={part.name}
                  data-active="false"
                  className="group flex items-baseline gap-4 border-b border-steel-300 py-3 transition-colors duration-500 data-[active=true]:text-ink"
                >
                  <span className="font-mono text-small text-steel-500 transition-colors duration-500 group-data-[active=true]:text-red">0{i + 1}</span>
                  <span className="font-medium text-steel-500 transition-colors duration-500 group-data-[active=true]:text-ink">{part.name}</span>
                  <span className="label-mono ml-auto text-steel-500">{part.std}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* 3D + annotations: below the header and ruler (the camera fits the whole assembly,
            callouts included, inside this box) */}
        <div className="relative min-h-0 flex-1 md:absolute md:top-[var(--chrome-h)] md:right-0 md:bottom-0 md:w-[62%]">
          {mount3D && (
            <Boundary>
              <Suspense fallback={null}>
                <div className={`absolute inset-0 transition-opacity duration-700 ${ready ? 'opacity-100' : 'opacity-0'}`}>
                  <ExplodedScene dpr={profile.dpr} detail={profile.detail} onReady={() => setReady(true)} />
                </div>
              </Suspense>
            </Boundary>
          )}
          <div className={`transition-opacity duration-500 ${ready ? 'opacity-100' : 'opacity-0'}`}>
            <Annotations store={explodedStore} items={ITEMS} compact={profile.small} id="ex" />
          </div>
        </div>

        {!profile.reduced && (
          <p ref={cue} className="label-mono pointer-events-none absolute bottom-6 left-[var(--gutter)] z-10 hidden text-steel-700 md:block" aria-hidden>
            {t.scrollCue} ↓
          </p>
        )}
      </div>
    </section>
  )
}
