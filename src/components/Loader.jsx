import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { content, FIRM_NAME } from '../data/content.js'
import { useLenis } from '../lib/smoothScroll.jsx'
import { LogoMark } from './ui/Logo.jsx'

const t = content.loader
const SEEN_KEY = 'sa-intro-seen'

// Rod geometry (SVG units)
const L = 640 // rod length
const D = 64 // rod diameter
const P = 16 // thread pitch
const H = 7 // thread depth
const PAD = 24

/** Zig-zag thread profile outline along both edges of the rod. */
function threadPath() {
  let top = `M0 ${H}`
  for (let x = 0; x < L; x += P) top += ` L${x + P / 2} 0 L${Math.min(x + P, L)} ${H}`
  let bottom = ` L${L} ${D - H}`
  for (let x = L; x > 0; x -= P) bottom += ` L${x - P / 2} ${D} L${Math.max(x - P, 0)} ${D - H}`
  return `${top}${bottom} Z`
}

/** Slanted helix flank lines, the visual cue for a cut thread. */
function helixLines() {
  const lines = []
  for (let x = 0; x <= L - P / 2; x += P) lines.push(`M${x + P / 2} 0 L${x + P / 2 + P / 2} ${D}`)
  return lines.join(' ')
}

const THREAD = threadPath()
const HELIX = helixLines()

/** The rod drawing + readouts. Rendered twice (one per split half), animated in sync by class. */
function Stage({ ariaHidden, idPrefix }) {
  const grad = `${idPrefix}-steel`
  const clipCut = `${idPrefix}-cut`
  const clipRaw = `${idPrefix}-raw`
  return (
    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-5" aria-hidden={ariaHidden || undefined}>
      {/* The SVG viewBox is symmetric about the rod axis, so the axis sits exactly on the split seam. */}
      <div className="relative mx-auto w-full max-w-[44rem]">
        <div className="absolute inset-x-0 bottom-full mb-3 flex items-end justify-between gap-4">
          <p className="label-mono text-steel-700">
            <span className="ld-status">{t.status}</span>
          </p>
          <p className="label-mono text-red">{t.spec}</p>
        </div>

        <svg
          viewBox={`${-PAD} ${-PAD - 22} ${L + PAD * 2} ${D + PAD * 2 + 44}`}
          className="ld-rod block w-full overflow-visible"
          role="presentation"
        >
          <defs>
            <linearGradient id={grad} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#9C9D9E" />
              <stop offset="0.18" stopColor="#E9E9E6" />
              <stop offset="0.42" stopColor="#B9BAB8" />
              <stop offset="0.7" stopColor="#7F8082" />
              <stop offset="1" stopColor="#5D5F62" />
            </linearGradient>
            <clipPath id={clipCut}>
              <rect className="ld-cut" x={0} y={-10} width={L} height={D + 20} />
            </clipPath>
            <clipPath id={clipRaw}>
              <rect className="ld-raw" x={0} y={-10} width={L} height={D + 20} />
            </clipPath>
          </defs>

          {/* Centre line (chain line), as on a drawing */}
          <line
            className="ld-axis"
            x1={-PAD}
            x2={L + PAD}
            y1={D / 2}
            y2={D / 2}
            stroke="var(--color-red)"
            strokeWidth="1"
            strokeDasharray="14 4 2 4"
            vectorEffect="non-scaling-stroke"
          />

          <g className="ld-body">
            {/* Uncut stock */}
            <g clipPath={`url(#${clipRaw})`}>
              <rect x={0} y={0} width={L} height={D} fill={`url(#${grad})`} />
            </g>
            {/* Threaded section */}
            <g clipPath={`url(#${clipCut})`}>
              <path d={THREAD} fill={`url(#${grad})`} />
              <path d={HELIX} stroke="#4A4C4F" strokeOpacity=".45" strokeWidth="1.4" fill="none" />
              <path d={THREAD} fill="none" stroke="#3D3F42" strokeOpacity=".5" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            </g>
            {/* Chamfered end faces */}
            <rect x={-1} y={0} width={2} height={D} fill="#55575A" opacity=".6" />
          </g>

          {/* Cutting tool: red insert riding the top edge */}
          <g className="ld-tool">
            <path d={`M0 ${H + 1} L-9 -22 L9 -22 Z`} fill="var(--color-red)" />
            <line x1="0" x2="0" y1={-22} y2={D + 18} stroke="var(--color-red)" strokeWidth="1" vectorEffect="non-scaling-stroke" opacity=".7" />
          </g>

          {/* Overall length dimension */}
          <g className="ld-dim" fill="var(--color-steel-500)" stroke="var(--color-steel-500)">
            <line x1={0} x2={0} y1={D + 6} y2={D + 30} strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <line x1={L} x2={L} y1={D + 6} y2={D + 30} strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <line className="ld-dimline" x1={0} x2={L} y1={D + 22} y2={D + 22} strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <path d={`M0 ${D + 22} l12 -4 v8 Z M${L} ${D + 22} l-12 -4 v8 Z`} stroke="none" />
          </g>
        </svg>

        <div className="absolute inset-x-0 top-full mt-4 flex items-end justify-between gap-4">
          <p className="label-mono text-steel-500">L {L / 4}</p>
          <p
            className="ld-count font-mono text-[clamp(2.5rem,8vw,4.5rem)] leading-none font-medium tracking-[-0.04em] text-ink tabular-nums"
            aria-hidden
          >
            000
          </p>
        </div>
      </div>
    </div>
  )
}

export default function Loader({ onDone }) {
  const root = useRef(null)
  const lenis = useLenis()
  const [done, setDone] = useState(false)
  const lenisRef = useRef(lenis)
  lenisRef.current = lenis
  const tlRef = useRef(null)

  const finish = () => {
    try {
      sessionStorage.setItem(SEEN_KEY, '1')
    } catch {
      /* storage blocked */
    }
    document.documentElement.classList.remove('is-loading')
    lenisRef.current?.start()
    window.__saIntro = 'done'
    window.dispatchEvent(new Event('sa:intro-done'))
    setDone(true)
    onDone?.()
  }

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      const counters = q('.ld-count')
      const statuses = q('.ld-status')
      const state = { p: 0 }

      const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' }, onComplete: finish })
      tlRef.current = tl

      gsap.set(q('.ld-cut'), { attr: { width: 0 } })
      gsap.set(q('.ld-tool'), { x: 0 })

      // the client's logo: shapes fade up, then the red dot drops in
      tl.from(q('.ld-logo path'), { autoAlpha: 0, y: 14, duration: 0.6, ease: 'expo.out' })
        .from(q('.ld-logo circle'), { scale: 0, transformOrigin: '50% 50%', duration: 0.45, ease: 'back.out(2.2)' }, '-=0.3')
        .from(q('.ld-axis'), { scaleX: 0, transformOrigin: '50% 50%', duration: 0.5, ease: 'expo.out' }, '-=0.2')
        .from(q('.ld-body'), { scaleX: 0, transformOrigin: '0% 50%', duration: 0.6, ease: 'expo.out' }, '-=0.25')
        .from(q('.ld-dim'), { autoAlpha: 0, duration: 0.3 }, '-=0.3')
        .from(q('.ld-tool'), { y: -30, autoAlpha: 0, duration: 0.35, ease: 'back.out(2)' }, '-=0.2')
        // The cut: threaded clip grows, raw stock clip shrinks, tool rides the edge, counter runs.
        .to(state, {
          p: 1,
          duration: 1.6,
          ease: 'power1.inOut',
          onUpdate: () => {
            const x = state.p * L
            q('.ld-cut').forEach((el) => el.setAttribute('width', x))
            q('.ld-raw').forEach((el) => {
              el.setAttribute('x', x)
              el.setAttribute('width', L - x)
            })
            q('.ld-tool').forEach((el) => gsap.set(el, { x }))
            const n = String(Math.round(state.p * 100)).padStart(3, '0')
            counters.forEach((c) => (c.textContent = n))
          },
        })
        .add(() => statuses.forEach((s) => (s.textContent = t.done)))
        .to(q('.ld-tool'), { y: -40, autoAlpha: 0, duration: 0.3, ease: 'power2.in' })
        .to(q('.ld-count'), { color: 'var(--color-red)', duration: 0.2 }, '<')
        // Split open along the rod's axis
        .to(q('.ld-top'), { yPercent: -100, duration: 0.95, ease: 'expo.inOut' }, '+=0.15')
        .to(q('.ld-bottom'), { yPercent: 100, duration: 0.95, ease: 'expo.inOut' }, '<')
        .add(() => {
          document.documentElement.classList.remove('is-loading')
          window.__saIntro = 'reveal'
          window.dispatchEvent(new Event('sa:intro-reveal'))
        }, '-=0.75')
    },
    { scope: root },
  )

  const skip = () => tlRef.current?.progress(1)

  if (done) return null

  return (
    <div ref={root} className="fixed inset-0 z-[90]" role="status" aria-live="polite" aria-label={t.status}>
      {/* Top half */}
      <div className="ld-top absolute inset-x-0 top-0 h-1/2 overflow-hidden border-b border-steel-300/0 bg-paper">
        <div className="bp-grid absolute inset-x-0 top-0 h-[100svh]" aria-hidden />
        <div className="absolute inset-x-0 top-0 h-[100svh]">
          <Stage idPrefix="ldt" />
          {/* client logo (light background, own clear space), above the rod; leaves with the top half */}
          <div className="ld-logo absolute inset-x-0 top-[calc(50%-12rem)] flex justify-center [--logo-h:3rem] md:top-[calc(50%-14rem)] md:[--logo-h:4rem]">
            <LogoMark title={FIRM_NAME} />
          </div>
        </div>
      </div>
      {/* Bottom half: same drawing offset up, so the seam runs through the rod's centre */}
      <div className="ld-bottom absolute inset-x-0 bottom-0 h-1/2 overflow-hidden bg-paper">
        <div className="bp-grid absolute inset-x-0 bottom-0 h-[100svh]" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 h-[100svh]">
          <Stage idPrefix="ldb" ariaHidden />
        </div>
      </div>

      <button
        type="button"
        onClick={skip}
        className="label-mono absolute right-5 bottom-5 z-10 rounded-xs px-2 py-1.5 text-steel-700 hover:text-red"
      >
        {t.skip}
      </button>
    </div>
  )
}

export const shouldShowLoader = () =>
  typeof document !== 'undefined' && document.documentElement.classList.contains('is-loading')
