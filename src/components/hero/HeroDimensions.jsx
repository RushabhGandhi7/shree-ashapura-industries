import { useEffect, useRef } from 'react'
import { heroStore, dimsAt } from '../../lib/heroStore.js'
import { content } from '../../data/content.js'

const t = content.hero.dims
const clamp01 = (v) => Math.min(1, Math.max(0, v))
const fadeIn = (d, from = 0.55) => clamp01((d - from) / (1 - from))

/**
 * Blueprint dimension lines glued to the 3D model.
 * Anchor points are projected by the canvas each rendered frame (heroStore.anchors);
 * draw-in progress comes from scroll (dimsAt). Everything is updated imperatively.
 */
export default function HeroDimensions({ compact = false }) {
  const svg = useRef(null)

  useEffect(() => {
    const root = svg.current
    const $ = (k) => root.querySelector(`[data-k="${k}"]`)
    const els = {}
    ;[
      'dia', 'diaLabel', 'diaLead',
      'lenExtA', 'lenExtB', 'len', 'lenLabel',
      'thrDot', 'thr', 'thrLabel',
      'pA', 'pB', 'pBar', 'pLabel',
      'afExtA', 'afExtB', 'af', 'afLabel',
    ].forEach((k) => (els[k] = $(k)))

    const line = (el, A, B, d = 1) => {
      el.setAttribute('x1', A.x)
      el.setAttribute('y1', A.y)
      el.setAttribute('x2', B.x)
      el.setAttribute('y2', B.y)
      el.style.strokeDashoffset = 1 - d
    }
    const poly = (el, pts, d = 1) => {
      el.setAttribute('points', pts.map((p) => `${p.x},${p.y}`).join(' '))
      el.style.strokeDashoffset = 1 - d
    }
    const text = (el, x, y, o, rot = 0) => {
      el.setAttribute('x', x)
      el.setAttribute('y', y)
      el.setAttribute('transform', rot ? `rotate(${rot} ${x} ${y})` : '')
      el.style.opacity = o
    }
    const arrows = (el, d) => {
      const show = d > 0.92 ? 'url(#hd-arrow)' : 'none'
      el.setAttribute('marker-start', show)
      el.setAttribute('marker-end', show)
    }

    const render = (p) => {
      const a = heroStore.anchors
      if (!a) return
      const d = dimsAt(p)

      // Ø across the hole, label out to the right with a short leader
      line(els.dia, a[0], a[1], d.dia)
      arrows(els.dia, d.dia)
      const dl = { x: a[1].x + (compact ? 18 : 30), y: a[1].y + (compact ? 22 : 34) }
      line(els.diaLead, a[1], dl, fadeIn(d.dia, 0.4))
      text(els.diaLabel, dl.x + 4, dl.y + 4, fadeIn(d.dia))

      // L: extension lines from the bolt, then the dimension line
      line(els.lenExtA, a[4], a[2], Math.min(1, d.len * 2))
      line(els.lenExtB, a[5], a[3], Math.min(1, d.len * 2))
      line(els.len, a[2], a[3], d.len)
      arrows(els.len, d.len)
      // Label sits on the line (its paper halo breaks it), reading bottom-to-top.
      const mx = (a[2].x + a[3].x) / 2
      const my = (a[2].y + a[3].y) / 2
      const ang = (Math.atan2(a[3].y - a[2].y, a[3].x - a[2].x) * 180) / Math.PI
      text(els.lenLabel, mx, my, fadeIn(d.len), ang - 180)
      els.lenLabel.setAttribute('dy', '0.35em')

      // Thread callout: dot + elbow leader + label (red, the key spec)
      const th = a[6]
      const elbow = { x: th.x + (compact ? 22 : 46), y: th.y - (compact ? 22 : 46) }
      const end = { x: elbow.x + (compact ? 70 : 128), y: elbow.y }
      poly(els.thr, [th, elbow, end], d.thread)
      els.thrDot.setAttribute('cx', th.x)
      els.thrDot.setAttribute('cy', th.y)
      els.thrDot.style.opacity = d.thread > 0 ? 1 : 0
      text(els.thrLabel, elbow.x + 4, elbow.y - 7, fadeIn(d.thread))

      // Pitch: two ticks one pitch apart on the left flank, with a bracket
      const tick = compact ? 14 : 22
      const pa = a[7]
      const pb = a[8]
      line(els.pA, pa, { x: pa.x - tick, y: pa.y }, d.pitch)
      line(els.pB, pb, { x: pb.x - tick, y: pb.y }, d.pitch)
      const bx = Math.min(pa.x, pb.x) - tick + 4
      line(els.pBar, { x: bx, y: pa.y - 10 }, { x: bx, y: pb.y + 10 }, d.pitch)
      text(els.pLabel, bx - 6, (pa.y + pb.y) / 2 + 4, fadeIn(d.pitch))

      // AF across the head
      const lift = compact ? 16 : 26
      const A9 = { x: a[9].x, y: a[9].y - lift }
      const A10 = { x: a[10].x, y: a[10].y - lift }
      line(els.afExtA, a[9], { x: A9.x, y: A9.y - 6 }, Math.min(1, d.af * 2))
      line(els.afExtB, a[10], { x: A10.x, y: A10.y - 6 }, Math.min(1, d.af * 2))
      line(els.af, A9, A10, d.af)
      arrows(els.af, d.af)
      text(els.afLabel, (A9.x + A10.x) / 2, (A9.y + A10.y) / 2 - 8, fadeIn(d.af))
    }

    heroStore.onFrame = render
    return () => {
      if (heroStore.onFrame === render) heroStore.onFrame = null
    }
  }, [compact])

  const L = (k, extra = '') => (
    <line data-k={k} pathLength="1" strokeDasharray="1" strokeDashoffset="1" className={extra} vectorEffect="non-scaling-stroke" />
  )

  return (
    <svg ref={svg} className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden>
      <defs>
        <marker id="hd-arrow" viewBox="0 0 10 6" refX="9.5" refY="3" markerWidth="10" markerHeight="6" orient="auto-start-reverse" markerUnits="userSpaceOnUse">
          <path d="M10 3 0 0v6Z" fill="currentColor" />
        </marker>
      </defs>

      <g className="text-steel-700" stroke="currentColor" strokeWidth="1" fill="none">
        {L('dia')}
        {L('diaLead', 'opacity-60')}
        {L('lenExtA', 'opacity-50')}
        {L('lenExtB', 'opacity-50')}
        {L('len')}
        {L('pA')}
        {L('pB')}
        {L('pBar')}
        {L('afExtA', 'opacity-50')}
        {L('afExtB', 'opacity-50')}
        {L('af')}
      </g>

      <g className="text-red" stroke="currentColor" strokeWidth="1" fill="none">
        <polyline data-k="thr" pathLength="1" strokeDasharray="1" strokeDashoffset="1" vectorEffect="non-scaling-stroke" />
        <circle data-k="thrDot" r="3" fill="currentColor" stroke="var(--color-paper)" strokeWidth="1.5" style={{ opacity: 0 }} />
      </g>

      <g
        className="font-mono uppercase"
        style={{ fontSize: compact ? 9.5 : 11, letterSpacing: '0.12em', paintOrder: 'stroke', strokeLinejoin: 'round' }}
        stroke="var(--color-paper)"
        strokeWidth="4"
      >
        <text data-k="diaLabel" fill="var(--color-ink)" style={{ opacity: 0 }}>{t.dia}</text>
        <text data-k="lenLabel" fill="var(--color-ink)" textAnchor="middle" style={{ opacity: 0 }}>{t.len}</text>
        <text data-k="thrLabel" fill="var(--color-red)" fontWeight="500" style={{ opacity: 0 }}>{t.thread}</text>
        <text data-k="pLabel" fill="var(--color-ink)" textAnchor="end" style={{ opacity: 0 }}>{t.pitch}</text>
        <text data-k="afLabel" fill="var(--color-ink)" textAnchor="middle" style={{ opacity: 0 }}>{t.af}</text>
      </g>
    </svg>
  )
}
