// Live TOP VIEW of the configurator bolt (looking down the axis from the head), drawn as
// a technical drawing. Every dimension comes from src/three/headGeometry.js, the same
// numbers the 3D head is built from. Shape, drive and labels tween between options
// (radius-per-angle outlines, so a hexagon morphs into a circle); reduced motion jumps.
import { useEffect, useMemo, useRef, useState } from 'react'
import { content } from '../../data/content.js'
import { topView } from '../../three/headGeometry.js'

const t = content.customise.topView
const S = 96 // outline samples
const TAU = Math.PI * 2
const VB = 200
const C0 = VB / 2
const fmt = (v) => String(Math.round(v * 10) / 10)

/** Outline radius (mm) at angle φ: hex flats face φ = 0, 60°, …; circles are constant. */
function outline(tv) {
  return Array.from({ length: S }, (_, i) => {
    if (tv.outline !== 'hex') return tv.dk / 2
    const phi = (i / S) * TAU
    const off = ((phi + Math.PI / 6) % (Math.PI / 3)) - Math.PI / 6
    return tv.af / 2 / Math.cos(off)
  })
}

/** Numeric target for a given option set (mm, plus view scale and feature opacities). */
function target(o, pitch) {
  const tv = topView({ head: o.head, diameter: o.diameter, pitch })
  return {
    tv,
    n: {
      k: 52 / o.diameter, // view units per mm: the widest head (Ø2d) spans ~104 units
      r: outline(tv),
      width: tv.outline === 'hex' ? tv.af : tv.dk,
      ac: tv.outline === 'hex' ? tv.ac : tv.dk,
      face: tv.outline === 'hex' ? tv.chamfer : tv.face,
      d: tv.d,
      root: tv.root,
      key: tv.key ?? tv.d * 0.5,
      arm: tv.arm ?? tv.width * 0.27,
      armW: tv.armW ?? tv.width * 0.055,
      aHex: tv.drive === 'hex' ? 1 : 0,
      aCross: tv.drive === 'cross' ? 1 : 0,
      aHexHead: tv.outline === 'hex' ? 1 : 0,
    },
  }
}

const lerp = (a, b, f) => (Array.isArray(a) ? a.map((x, i) => x + (b[i] - x) * f) : a + (b - a) * f)
const mix = (a, b, f) => Object.fromEntries(Object.keys(b).map((k) => [k, lerp(a[k], b[k], f)]))

const pathFrom = (r, k) =>
  r
    .map((rr, i) => {
      const phi = (i / S) * TAU
      return `${i ? 'L' : 'M'}${(C0 + rr * k * Math.sin(phi)).toFixed(2)} ${(C0 + rr * k * Math.cos(phi)).toFixed(2)}`
    })
    .join('') + 'Z'

const hexPath = (af, k) => {
  const rc = (af / Math.sqrt(3)) * k
  return Array.from({ length: 6 }, (_, i) => {
    const a = Math.PI / 6 + (i * TAU) / 6
    return `${i ? 'L' : 'M'}${(C0 + rc * Math.sin(a)).toFixed(2)} ${(C0 + rc * Math.cos(a)).toFixed(2)}`
  }).join('') + 'Z'
}

const Arrow = ({ x, y, dir }) => <path d={`M${x} ${y} l${-6 * dir[0] - 2.2 * dir[1]} ${-6 * dir[1] - 2.2 * dir[0]} l${4.4 * dir[1]} ${4.4 * dir[0]}z`} fill="var(--color-red)" />

export default function TopView({ opts, pitch, thread, reduced, className = '' }) {
  const goal = useMemo(() => target(opts, pitch), [opts, pitch])
  const [v, setV] = useState(goal.n)
  const cur = useRef(goal.n)
  const root = useRef(null)
  const [drawn, setDrawn] = useState(false)
  const [ratio, setRatio] = useState(null)

  // tween towards the new target (≈350 ms ease-out)
  useEffect(() => {
    const from = cur.current
    if (reduced) {
      cur.current = goal.n
      setV(goal.n)
      return
    }
    let raf
    const t0 = performance.now()
    const step = (now) => {
      const f = Math.min(1, (now - t0) / 350)
      const e = 1 - Math.pow(1 - f, 3)
      cur.current = mix(from, goal.n, e)
      setV(cur.current)
      if (f < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [goal, reduced])

  // draw in once when first seen; drawing scale from the rendered size (96 dpi)
  useEffect(() => {
    const el = root.current
    if (reduced) setDrawn(true)
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setDrawn(true), io.disconnect()), { threshold: 0.35 })
    io.observe(el)
    const ro = new ResizeObserver(() => {
      const px = el.querySelector('svg')?.getBoundingClientRect().width
      if (px) setRatio((px / VB) * cur.current.k * 0.2646) // CSS px per mm → drawing ratio
    })
    ro.observe(el)
    return () => (io.disconnect(), ro.disconnect())
  }, [reduced])

  const k = v.k
  const R = (v.ac / 2) * k // outline extent (corners for hex)
  const tv = goal.tv
  const stroke = 'tv-draw'
  const scaleLabel = ratio ? (ratio >= 1 ? `${Math.max(1, Math.round(ratio))} : 1` : `1 : ${Math.round(1 / ratio)}`) : ''
  const aria = t.aria({
    head: content.customise.headSpec[tv.head]({ af: fmt(tv.af ?? 0), dk: fmt(tv.dk ?? 0), key: fmt(tv.key ?? 0), height: fmt(tv.height) }),
    key: tv.outline === 'hex' ? `across flats ${fmt(tv.af)} mm` : `head diameter ${fmt(tv.dk)} mm`,
    thread,
    root: fmt(tv.root),
  })

  // dimension: AF vertical at the right (hex), head Ø horizontal below (round heads)
  const dimX = C0 + R + 16
  const half = (v.width / 2) * k
  const dimY = C0 + R + 16

  return (
    <figure ref={root} data-drawn={drawn} className={`relative flex h-full flex-col bg-paper ${className}`}>
      <div className="bp-grid absolute inset-0 opacity-70" aria-hidden />
      <svg viewBox={`0 0 ${VB} ${VB}`} className="relative min-h-0 w-full flex-1" role="img" aria-label={aria} data-k={goal.n.k}>
        <style>{`
          [data-drawn] .tv-draw { stroke-dasharray: 1; transition: stroke-dashoffset 1.1s cubic-bezier(.16,1,.3,1) }
          [data-drawn=false] .tv-draw { stroke-dashoffset: 1 }
          [data-drawn=true] .tv-draw { stroke-dashoffset: 0 }
          [data-drawn] .tv-fade { transition: opacity .6s ease .5s }
          [data-drawn=false] .tv-fade { opacity: 0 }
        `}</style>
        {/* centre lines (dash-dot) */}
        <g className="tv-fade" stroke="var(--color-steel-500)" strokeWidth="0.5" strokeDasharray="8 2 1.5 2">
          <line x1={C0 - R - 10} y1={C0} x2={C0 + R + 10} y2={C0} />
          <line x1={C0} y1={C0 - R - 10} x2={C0} y2={C0 + R + 10} />
        </g>
        {/* head outline + inner face ring */}
        <path data-outline d={pathFrom(v.r, k)} pathLength="1" className={stroke} fill="var(--color-paper)" fillOpacity="0.85" stroke="var(--color-ink)" strokeWidth="1.3" strokeLinejoin="round" />
        <circle cx={C0} cy={C0} r={(v.face / 2) * k} pathLength="1" className={stroke} fill="none" stroke="var(--color-steel-500)" strokeWidth="0.6" />
        {/* thread: nominal (solid) and root (dashed) */}
        <circle cx={C0} cy={C0} r={(v.d / 2) * k} pathLength="1" className={stroke} fill="none" stroke="var(--color-ink)" strokeWidth="0.7" />
        <circle cx={C0} cy={C0} r={(v.root / 2) * k} className="tv-fade" fill="none" stroke="var(--color-ink)" strokeWidth="0.6" strokeDasharray="2.5 2" />
        {/* drives, cross-faded */}
        <path d={hexPath(v.key, k)} opacity={v.aHex} fill="var(--color-steel-100)" stroke="var(--color-ink)" strokeWidth="0.9" strokeLinejoin="round" />
        <g opacity={v.aCross} fill="var(--color-steel-100)" stroke="var(--color-ink)" strokeWidth="0.9">
          <path
            d={`M${C0 - v.arm * k} ${C0 - v.armW * k}H${C0 - v.armW * k}V${C0 - v.arm * k}H${C0 + v.armW * k}V${C0 - v.armW * k}H${C0 + v.arm * k}V${C0 + v.armW * k}H${C0 + v.armW * k}V${C0 + v.arm * k}H${C0 - v.armW * k}V${C0 + v.armW * k}H${C0 - v.arm * k}Z`}
          />
        </g>

        {/* key dimension (red) */}
        <g className="tv-fade" stroke="var(--color-red)" strokeWidth="0.7" fill="none">
          <g opacity={v.aHexHead}>
            <line x1={C0 + (v.width / 2 / Math.tan(Math.PI / 3)) * k} y1={C0 - half} x2={dimX + 4} y2={C0 - half} strokeWidth="0.4" />
            <line x1={C0 + (v.width / 2 / Math.tan(Math.PI / 3)) * k} y1={C0 + half} x2={dimX + 4} y2={C0 + half} strokeWidth="0.4" />
            <line x1={dimX} y1={C0 - half} x2={dimX} y2={C0 + half} />
            <Arrow x={dimX} y={C0 - half} dir={[0, -1]} />
            <Arrow x={dimX} y={C0 + half} dir={[0, 1]} />
          </g>
          <g opacity={1 - v.aHexHead}>
            <line x1={C0 - half} y1={C0} x2={C0 - half} y2={dimY + 4} strokeWidth="0.4" />
            <line x1={C0 + half} y1={C0} x2={C0 + half} y2={dimY + 4} strokeWidth="0.4" />
            <line x1={C0 - half} y1={dimY} x2={C0 + half} y2={dimY} />
            <Arrow x={C0 - half} y={dimY} dir={[-1, 0]} />
            <Arrow x={C0 + half} y={dimY} dir={[1, 0]} />
          </g>
        </g>
        <g className="tv-fade font-mono" fontSize="7.5" letterSpacing="0.6">
          <text x={dimX + 6} y={C0 + 2.6} fill="var(--color-red)" opacity={v.aHexHead} stroke="var(--color-paper)" strokeWidth="3" paintOrder="stroke" transform={dimX + 34 > VB ? `rotate(-90 ${dimX - 4} ${C0})` : undefined}>
            AF {fmt(v.width)}
          </text>
          <text x={C0} y={Math.min(VB - 3, dimY + 10)} fill="var(--color-red)" textAnchor="middle" opacity={1 - v.aHexHead} stroke="var(--color-paper)" strokeWidth="3" paintOrder="stroke">
            Ø{fmt(v.width)}
          </text>
          {/* leaders */}
          <g stroke="var(--color-steel-700)" strokeWidth="0.45" fill="none">
            <polyline points={`${C0 - (v.d / 2) * k * 0.7071},${C0 - (v.d / 2) * k * 0.7071} ${20},${14} ${8},${14}`} />
            <polyline points={`${C0 + (v.root / 2) * k * 0.7071},${C0 + (v.root / 2) * k * 0.7071} ${VB - 26},${VB - 10} ${VB - 8},${VB - 10}`} />
          </g>
          <circle cx={C0 - (v.d / 2) * k * 0.7071} cy={C0 - (v.d / 2) * k * 0.7071} r="1.3" fill="var(--color-ink)" />
          <circle cx={C0 + (v.root / 2) * k * 0.7071} cy={C0 + (v.root / 2) * k * 0.7071} r="1.3" fill="var(--color-ink)" />
          <text x="8" y="11" fill="var(--color-ink)">Ø{fmt(v.d)}</text>
          <text x={VB - 8} y={VB - 13} fill="var(--color-ink)" textAnchor="end">
            Ø{fmt(v.root)} {t.root.toUpperCase()}
          </text>
          <text x={VB - 8} y="11" fill="var(--color-ink)" textAnchor="end">
            {tv.drive === 'hex' ? t.drive.hex(fmt(v.key)).toUpperCase() : tv.drive === 'cross' ? t.drive.cross.toUpperCase() : t.drive.none.toUpperCase()}
          </text>
          {tv.head === 'countersunk' && (
            <text x={VB - 8} y="21" fill="var(--color-steel-500)" textAnchor="end">
              {t.csk}
            </text>
          )}
          <text x="8" y={VB - 4} fill="var(--color-steel-700)">
            {thread}
          </text>
        </g>
      </svg>
      <figcaption className="label-mono relative flex items-center justify-between border-t border-steel-300 px-3 py-2 text-[10px] text-steel-700">
        <span>{t.title}</span>
        <span>{scaleLabel && t.scale(scaleLabel)}</span>
      </figcaption>
    </figure>
  )
}
