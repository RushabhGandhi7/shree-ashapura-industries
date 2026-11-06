// Blueprint annotations glued to a 3D scene.
//
// The scene projects named anchor points to canvas pixels each rendered frame and calls
// store.onFrame(p). This overlay then draws:
//   dim    — dimension line between anchors a and b (arrows, optional extension lines
//            from ea / eb, label on the line)
//   leader — callout: dot on the part, elbow leader, label + sub-label
// Each item draws in over its scroll range `at: [p0, p1]` and reverses on scroll back.
// Everything is updated imperatively (no React re-renders per frame).
import { useEffect, useRef } from 'react'

const clamp01 = (v) => Math.min(1, Math.max(0, v))
const easeOut = (t) => 1 - Math.pow(1 - t, 3)
const prog = (p, [a, b]) => easeOut(clamp01((p - a) / (b - a)))

export default function Annotations({ store, items, compact = false, id = 'an' }) {
  const svg = useRef(null)

  useEffect(() => {
    const root = svg.current
    const q = (k) => root.querySelector(`[data-k="${k}"]`)
    const els = items.map((it) => ({
      it,
      main: q(`${it.id}-main`),
      ea: q(`${it.id}-ea`),
      eb: q(`${it.id}-eb`),
      dot: q(`${it.id}-dot`),
      label: q(`${it.id}-label`),
      sub: q(`${it.id}-sub`),
    }))
    const k = compact ? 0.55 : 1

    const line = (el, A, B, d) => {
      el.setAttribute('x1', A.x)
      el.setAttribute('y1', A.y)
      el.setAttribute('x2', B.x)
      el.setAttribute('y2', B.y)
      el.style.strokeDashoffset = 1 - d
    }

    const render = (p) => {
      const a = store.anchors
      if (!a) return
      for (const e of els) {
        const { it } = e
        const d = prog(p, it.at)
        const o = clamp01((d - 0.55) / 0.45)
        if (it.kind === 'dim') {
          const A = a[it.a]
          const B = a[it.b]
          if (!A || !B) continue
          line(e.main, A, B, d)
          const arrows = d > 0.92 ? `url(#${id}-arrow)` : 'none'
          e.main.setAttribute('marker-start', arrows)
          e.main.setAttribute('marker-end', arrows)
          if (e.ea && a[it.ea]) line(e.ea, a[it.ea], A, Math.min(1, d * 2))
          if (e.eb && a[it.eb]) line(e.eb, a[it.eb], B, Math.min(1, d * 2))
          const mx = (A.x + B.x) / 2
          const my = (A.y + B.y) / 2
          let ang = (Math.atan2(B.y - A.y, B.x - A.x) * 180) / Math.PI
          if (ang > 90) ang -= 180
          if (ang < -90) ang += 180
          const vertical = Math.abs(ang) > 45
          e.label.setAttribute('x', mx)
          e.label.setAttribute('y', my)
          e.label.setAttribute('transform', vertical ? `rotate(${ang} ${mx} ${my})` : '')
          e.label.setAttribute('dy', vertical ? '0.35em' : '-0.6em')
          e.label.style.opacity = o
        } else {
          const P = a[it.anchor]
          if (!P) continue
          const dir = it.side === 'left' ? -1 : 1
          const W = root.clientWidth
          const elbow = { x: P.x + dir * it.dx * k, y: P.y + it.dy * k }
          const end = { x: elbow.x + dir * (compact ? 54 : it.len ?? 120), y: elbow.y }
          // keep the label inside the canvas: shift elbow/end back if the text would overflow
          const textW = it.label.length * (compact ? 7.2 : 8.2) + 8
          const over = dir > 0 ? elbow.x + textW - (W - 6) : 6 - (elbow.x - textW)
          if (over > 0) {
            const shift = Math.min(over, Math.abs(elbow.x - P.x) - 6)
            elbow.x -= dir * shift
            end.x = dir > 0 ? Math.max(end.x - shift, elbow.x + textW) : Math.min(end.x + shift, elbow.x - textW)
            end.x = dir > 0 ? Math.min(end.x, W - 4) : Math.max(end.x, 4)
          }
          e.main.setAttribute('points', `${P.x},${P.y} ${elbow.x},${elbow.y} ${end.x},${end.y}`)
          e.main.style.strokeDashoffset = 1 - d
          e.dot.setAttribute('cx', P.x)
          e.dot.setAttribute('cy', P.y)
          e.dot.style.opacity = d > 0 ? 1 : 0
          const lx = dir > 0 ? elbow.x + 2 : elbow.x - 2
          e.label.setAttribute('x', lx)
          e.label.setAttribute('y', elbow.y - 7)
          e.label.setAttribute('text-anchor', dir > 0 ? 'start' : 'end')
          e.label.style.opacity = o
          if (e.sub) {
            e.sub.setAttribute('x', lx)
            e.sub.setAttribute('y', elbow.y + 14)
            e.sub.setAttribute('text-anchor', dir > 0 ? 'start' : 'end')
            e.sub.style.opacity = o
          }
        }
      }
    }
    store.onFrame = render
    render(store.p ?? 0)
    return () => {
      if (store.onFrame === render) store.onFrame = null
    }
  }, [store, items, compact, id])

  const fs = compact ? 9.5 : 11
  return (
    <svg ref={svg} className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden>
      <defs>
        <marker id={`${id}-arrow`} viewBox="0 0 10 6" refX="9.5" refY="3" markerWidth="10" markerHeight="6" orient="auto-start-reverse" markerUnits="userSpaceOnUse">
          <path d="M10 3 0 0v6Z" fill="currentColor" />
        </marker>
      </defs>
      {items.map((it) => {
        const red = it.tone === 'red'
        return (
          <g key={it.id} className={red ? 'text-red' : 'text-steel-700'}>
            {it.kind === 'dim' ? (
              <>
                {it.ea && <line data-k={`${it.id}-ea`} stroke="currentColor" strokeOpacity=".5" pathLength="1" strokeDasharray="1" strokeDashoffset="1" />}
                {it.eb && <line data-k={`${it.id}-eb`} stroke="currentColor" strokeOpacity=".5" pathLength="1" strokeDasharray="1" strokeDashoffset="1" />}
                <line data-k={`${it.id}-main`} stroke="currentColor" pathLength="1" strokeDasharray="1" strokeDashoffset="1" />
              </>
            ) : (
              <>
                <polyline data-k={`${it.id}-main`} fill="none" stroke="currentColor" pathLength="1" strokeDasharray="1" strokeDashoffset="1" />
                <circle data-k={`${it.id}-dot`} r="3" fill="currentColor" stroke="var(--color-paper)" strokeWidth="1.5" style={{ opacity: 0 }} />
              </>
            )}
            <text
              data-k={`${it.id}-label`}
              textAnchor="middle"
              className={`font-mono ${it.kind === 'leader' && it.tone !== 'red' ? 'uppercase' : ''}`}
              fill={red ? 'var(--color-red)' : 'var(--color-ink)'}
              stroke="var(--color-paper)"
              strokeWidth="4"
              style={{ fontSize: it.kind === 'leader' ? fs + 1 : fs, letterSpacing: '0.12em', paintOrder: 'stroke', opacity: 0, fontWeight: it.kind === 'leader' ? 500 : 400 }}
            >
              {it.label}
            </text>
            {it.sub && !compact && (
              <text
                data-k={`${it.id}-sub`}
                className="font-mono uppercase"
                fill="var(--color-steel-700)"
                stroke="var(--color-paper)"
                strokeWidth="4"
                style={{ fontSize: fs - 1, letterSpacing: '0.12em', paintOrder: 'stroke', opacity: 0 }}
              >
                {it.sub}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
