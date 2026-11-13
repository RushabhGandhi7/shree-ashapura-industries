// Six manufacturing vignettes (SVG; 06 is the Go / No-Go story, phase 12C). Each is driven by a local progress p in [0, 1] via
// an imperative set(p), so scroll scrubs them (and reverses them) without re-renders.
// Only transforms / attributes / colours change: no SVG filters, for mobile performance.
import { forwardRef, useId, useImperativeHandle, useRef } from 'react'

const clamp01 = (v) => Math.min(1, Math.max(0, v))
const seg = (p, a, b) => clamp01((p - a) / (b - a))
const lerp = (a, b, t) => a + (b - a) * t
const ease = (t) => 1 - Math.pow(1 - t, 3)
const mix = (c1, c2, t) => {
  const h = (c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]
  const a = h(c1)
  const b = h(c2)
  return `rgb(${a.map((v, i) => Math.round(lerp(v, b[i], t))).join(',')})`
}
const INK = 'var(--color-ink)'
const STEEL = 'var(--color-steel-500)'
const RED = 'var(--color-red)'

function Frame({ children, label, readoutRef, readout }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg viewBox="0 0 480 320" className="h-full w-full" role="img" aria-label={label}>
      <defs>
        <linearGradient id={`${id}-steel`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9C9D9E" />
          <stop offset=".25" stopColor="#E8E8E5" />
          <stop offset=".55" stopColor="#B4B5B4" />
          <stop offset="1" stopColor="#6F7174" />
        </linearGradient>
      </defs>
      {children(`url(#${id}-steel)`)}
      <text ref={readoutRef} x="466" y="300" textAnchor="end" className="font-mono" fontSize="12" letterSpacing="1.5" fill={INK}>
        {readout}
      </text>
    </svg>
  )
}

/* 01 — wire coil unwinding through straightening rollers */
export const Coil = forwardRef(function Coil({ label }, ref) {
  const rings = useRef([])
  const wire = useRef(null)
  const rollers = useRef([])
  const out = useRef(null)
  useImperativeHandle(ref, () => ({
    set(p) {
      rings.current.forEach((r, i) => r && r.setAttribute('stroke-dashoffset', String(-p * 900 - i * 13)))
      wire.current.style.strokeDashoffset = String(1 - ease(seg(p, 0, 0.85)))
      rollers.current.forEach((r, i) => r?.setAttribute('transform', `rotate(${p * 720 * (i % 2 ? -1 : 1)})`))
      out.current.textContent = `FEED ${String(Math.round(ease(p) * 1250)).padStart(4, '0')} mm`
    },
  }))
  return (
    <Frame label={label} readoutRef={out} readout="FEED 0000 mm">
      {(steel) => (
        <>
          {/* coil drum */}
          <ellipse cx="120" cy="226" rx="86" ry="22" fill="#00000010" />
          {Array.from({ length: 10 }, (_, i) => (
            <ellipse
              key={i}
              ref={(el) => (rings.current[i] = el)}
              cx="120"
              cy={210 - i * 13}
              rx="78"
              ry="22"
              fill="none"
              stroke={i % 2 ? '#9C9E9F' : '#C9CACA'}
              strokeWidth="10"
              strokeDasharray="70 2"
            />
          ))}
          <ellipse cx="120" cy="93" rx="30" ry="8" fill="var(--color-paper)" stroke={STEEL} />
          {/* strand to the straightener and out */}
          <path
            ref={wire}
            d="M196 96 C 240 70, 260 70, 300 82 L 470 82"
            fill="none"
            stroke={steel}
            strokeWidth="9"
            strokeLinecap="round"
            pathLength="1"
            strokeDasharray="1"
            strokeDashoffset="1"
          />
          {[0, 1, 2, 3, 4].map((i) => {
            const x = 310 + i * 30
            const y = i % 2 ? 98 : 66
            return (
              <g key={i} transform={`translate(${x} ${y})`}>
                <circle r="11" fill="var(--color-paper)" stroke={INK} strokeWidth="1.2" />
                <g ref={(el) => (rollers.current[i] = el)}>
                  <line x1="-7" x2="7" stroke={INK} strokeWidth="1.2" />
                </g>
              </g>
            )
          })}
          <text x="310" y="132" className="font-mono" fontSize="10" letterSpacing="1.5" fill={STEEL}>
            STRAIGHTENER
          </text>
        </>
      )}
    </Frame>
  )
})

/* 02 — cold heading: punch strikes the blank three times, the head forms */
export const Heading = forwardRef(function Heading({ label }, ref) {
  const punch = useRef(null)
  const head = useRef(null)
  const flash = useRef(null)
  const out = useRef(null)
  useImperativeHandle(ref, () => ({
    set(p) {
      const blows = p * 3
      const k = Math.min(2, Math.floor(blows))
      const b = blows - k
      const strike = Math.pow(Math.sin(Math.PI * Math.min(1, b)), 3)
      punch.current.setAttribute('transform', `translate(${lerp(-70, 0, strike)} 0)`)
      const formed = clamp01((k + (b > 0.5 ? 1 : b * 2)) / 3)
      const hh = lerp(22, 78, ease(formed))
      const hw = lerp(10, 30, ease(formed))
      head.current.setAttribute('y', String(160 - hh / 2))
      head.current.setAttribute('height', String(hh))
      head.current.setAttribute('x', String(230 - hw))
      head.current.setAttribute('width', String(hw))
      flash.current.style.opacity = String(strike > 0.92 && p < 0.999 ? 1 : 0)
      out.current.textContent = `BLOW ${Math.min(3, k + (b > 0.5 ? 1 : 0))}/3`
    },
  }))
  return (
    <Frame label={label} readoutRef={out} readout="BLOW 0/3">
      {(steel) => (
        <>
          {/* die block */}
          <rect x="230" y="70" width="200" height="180" rx="4" fill="#D7D8D5" stroke={INK} strokeWidth="1.2" />
          <rect x="230" y="146" width="200" height="28" fill="var(--color-paper)" stroke={STEEL} />
          {/* blank in the die */}
          <rect x="230" y="149" width="190" height="22" fill={steel} />
          <rect ref={head} x="220" y="149" width="10" height="22" fill={steel} stroke="#55575A" strokeOpacity=".4" />
          {/* punch */}
          <g ref={punch}>
            <rect x="60" y="110" width="140" height="100" rx="3" fill="#C4C5C3" stroke={INK} strokeWidth="1.2" />
            <rect x="196" y="118" width="22" height="84" fill="#AFB0AF" stroke={INK} strokeWidth="1.2" />
            <text x="72" y="104" className="font-mono" fontSize="10" letterSpacing="1.5" fill={STEEL}>
              PUNCH
            </text>
          </g>
          <g ref={flash} stroke={RED} strokeWidth="2" strokeLinecap="round" style={{ opacity: 0 }}>
            <line x1="214" y1="106" x2="206" y2="94" />
            <line x1="214" y1="214" x2="206" y2="226" />
            <line x1="200" y1="160" x2="186" y2="160" />
          </g>
          <text x="236" y="64" className="font-mono" fontSize="10" letterSpacing="1.5" fill={STEEL}>
            DIE
          </text>
        </>
      )}
    </Frame>
  )
})

/* 03 — thread rolling between two flat dies */
export const Rolling = forwardRef(function Rolling({ label }, ref) {
  const id = useId().replace(/:/g, '')
  const topDie = useRef(null)
  const botDie = useRef(null)
  const clip = useRef(null)
  const out = useRef(null)
  const L = 300
  const x0 = 90
  const teeth = []
  for (let x = 0; x <= L; x += 14) teeth.push(x)
  // crests above / below the thread core (core: y 141..179)
  const crestsTop = `M${x0} 141 ` + teeth.map((x) => `L${x0 + x + 3.5} 134 L${x0 + x + 7} 141 L${x0 + x + 14} 141`).join(' ') + ' Z'
  const crestsBot = `M${x0} 179 ` + teeth.map((x) => `L${x0 + x + 3.5} 186 L${x0 + x + 7} 179 L${x0 + x + 14} 179`).join(' ') + ' Z'
  useImperativeHandle(ref, () => ({
    set(p) {
      topDie.current.setAttribute('transform', `translate(${lerp(-60, 60, p)} 0)`)
      botDie.current.setAttribute('transform', `translate(${lerp(60, -60, p)} 0)`)
      clip.current.setAttribute('width', String(ease(seg(p, 0.05, 0.9)) * L))
      out.current.textContent = `ROLLED ${String(Math.round(ease(seg(p, 0.05, 0.9)) * 100)).padStart(3, '0')}%`
    },
  }))
  return (
    <Frame label={label} readoutRef={out} readout="ROLLED 000%">
      {(steel) => (
        <>
          <defs>
            <pattern id={`${id}-g`} width="14" height="40" patternUnits="userSpaceOnUse" patternTransform="skewX(-25)">
              <rect width="14" height="40" fill="#D5D6D3" />
              <line x1="0" x2="0" y1="0" y2="40" stroke="#8E9092" strokeWidth="5" />
            </pattern>
            <clipPath id={`${id}-c`}>
              <rect ref={clip} x={x0} y="100" width="0" height="120" />
            </clipPath>
          </defs>
          <g ref={topDie}>
            <rect x="20" y="70" width="440" height="56" fill={`url(#${id}-g)`} stroke={INK} strokeWidth="1.2" />
          </g>
          <g ref={botDie}>
            <rect x="20" y="194" width="440" height="56" fill={`url(#${id}-g)`} stroke={INK} strokeWidth="1.2" />
          </g>
          {/* blank: plain, then threaded inside the clip */}
          {/* plain blank (full Ø) */}
          <rect x={x0} y="134" width={L} height="52" fill={steel} />
          {/* rolled section: core + crests, revealed by the clip */}
          <g clipPath={`url(#${id}-c)`}>
            <rect x={x0 - 1} y="133" width={L + 2} height="54" fill="var(--color-paper)" />
            <rect x={x0} y="141" width={L} height="38" fill={steel} />
            <path d={crestsTop} fill={steel} stroke="#55575A" strokeOpacity=".55" strokeWidth=".8" />
            <path d={crestsBot} fill={steel} stroke="#55575A" strokeOpacity=".55" strokeWidth=".8" />
            {teeth.map((x) => (
              <line key={x} x1={x0 + x + 3.5} y1="141" x2={x0 + x + 10.5} y2="179" stroke="#55575A" strokeOpacity=".35" />
            ))}
          </g>
          <path d="M60 160 h-30 m0 0 l8 -5 m-8 5 l8 5" stroke={RED} strokeWidth="1.5" fill="none" />
          <text x="30" y="60" className="font-mono" fontSize="10" letterSpacing="1.5" fill={STEEL}>
            FLAT DIES · PITCH 1.25
          </text>
        </>
      )}
    </Frame>
  )
})

const HEAT = ['#B8B9B8', '#6B2A20', '#B3261E', '#E2561C', '#F59A2E']
function heatColor(t) {
  const x = clamp01(t) * (HEAT.length - 1)
  const i = Math.min(HEAT.length - 2, Math.floor(x))
  return mix(HEAT[i], HEAT[i + 1], x - i)
}
/* 05 — heat treatment then plating (via approved partners): glow, quench, finish */
const FINISH = ['#D9DCDE', '#DCC47E']
export const HeatPlating = forwardRef(function HeatPlating({ label, tag }, ref) {
  const parts = useRef([])
  const glow = useRef(null)
  const steam = useRef(null)
  const graph = useRef(null)
  const out = useRef(null)
  useImperativeHandle(ref, () => ({
    set(p) {
      const heat = ease(seg(p, 0, 0.36))
      const quench = seg(p, 0.36, 0.46)
      const plate = seg(p, 0.55, 0.75)
      const swap = seg(p, 0.82, 0.92)
      const tNorm = heat * (1 - quench)
      let col = heatColor(tNorm)
      if (quench >= 1) col = mix('#3E3F41', mix(FINISH[0], FINISH[1], swap), plate)
      parts.current.forEach((el) => el?.setAttribute('fill', col))
      glow.current.style.opacity = String(tNorm * 0.85)
      steam.current.style.opacity = String(quench > 0 && quench < 1 ? 1 : quench >= 1 ? Math.max(0, 1 - seg(p, 0.46, 0.52) * 2) : 0)
      steam.current.setAttribute('transform', `translate(0 ${-quench * 24})`)
      graph.current.style.strokeDashoffset = String(1 - p)
      out.current.textContent = p < 0.36 ? 'HARDEN' : p < 0.5 ? 'QUENCH' : p < 0.8 ? 'PLATE ZINC' : 'PLATE YELLOW'
    },
  }))
  return (
    <Frame label={label} readoutRef={out} readout="HARDEN">
      {() => (
        <>
          <defs>
            <radialGradient id="heat-glow">
              <stop offset="0" stopColor="#F59A2E" stopOpacity=".75" />
              <stop offset=".5" stopColor="#E2561C" stopOpacity=".3" />
              <stop offset="1" stopColor="#C8102E" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* furnace */}
          <rect x="40" y="50" width="250" height="170" rx="10" fill="#E3E2DE" stroke={INK} strokeWidth="1.2" />
          <rect x="56" y="66" width="218" height="138" rx="6" fill="#F0EEE9" stroke={STEEL} />
          <ellipse ref={glow} cx="165" cy="150" rx="120" ry="70" fill="url(#heat-glow)" style={{ opacity: 0 }} />
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${100 + i * 52} 108)`}>
              <rect ref={(el) => (parts.current[i * 2] = el)} x="-14" y="0" width="28" height="14" rx="2" fill="#B8B9B8" />
              <rect ref={(el) => (parts.current[i * 2 + 1] = el)} x="-6" y="14" width="12" height="62" fill="#B8B9B8" />
            </g>
          ))}
          <line x1="70" y1="190" x2="260" y2="190" stroke={INK} strokeWidth="2" />
          <g ref={steam} stroke={STEEL} strokeWidth="1.5" fill="none" strokeLinecap="round" style={{ opacity: 0 }}>
            <path d="M110 92 c-6 -10 6 -14 0 -24" />
            <path d="M162 92 c-6 -10 6 -14 0 -24" />
            <path d="M214 92 c-6 -10 6 -14 0 -24" />
          </g>
          {/* temperature curve, drawn as you scroll */}
          <g transform="translate(310 60)">
            <rect width="150" height="150" fill="none" stroke="var(--color-steel-300)" />
            <path
              ref={graph}
              d="M0 140 C 30 140, 50 20, 75 18 L 80 18 L 88 130 L 96 132 C 110 128, 120 82, 150 80"
              fill="none"
              stroke={RED}
              strokeWidth="2"
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset="1"
            />
            <text x="0" y="-8" className="font-mono" fontSize="10" letterSpacing="1.5" fill={STEEL}>
              T / t
            </text>
          </g>
          <text x="40" y="40" className="font-mono" fontSize="10" letterSpacing="1.5" fill={STEEL}>
            {tag}
          </text>
        </>
      )}
    </Frame>
  )
})

/* 06 — inspection (phase 12C): Go / No-Go thread plug gauges on a nut, two cases.
   Case 1 (good part): GO screws fully in -> "must pass"; NO-GO stops within 2 turns ->
   "must NOT pass"; PART ACCEPTED. Case 2 (worn / oversize hole): GO passes, NO-GO runs
   fully in -> "entered"; PART REJECTED. A min–max tolerance band shows where the part is. */
const GREEN = 'var(--color-green)'
const GREEN_TINT = 'var(--color-green-tint)'
const RED_TINT = 'var(--color-red-tint)'
export const GoNoGo = forwardRef(function GoNoGo({ label, gauge: g }, ref) {
  const id = useId().replace(/:/g, '')
  const r = {
    caseText: useRef(null),
    go: useRef(null),
    nogo: useRef(null),
    goHatch: useRef(null),
    nogoHatch: useRef(null),
    wallsL: useRef([]),
    wallsR: useRef([]),
    goLabel: useRef(null),
    nogoLabel: useRef(null),
    chip: useRef(null),
    chipBox: useRef(null),
    chipText: useRef(null),
    part: useRef(null),
    partLine: useRef(null),
  }
  const GX = [140, 340] // gauge / nut centres
  const TURN = 9 // px of travel per turn (thread pitch in the drawing)
  useImperativeHandle(ref, () => ({
    set(p) {
      const case2 = p >= 0.52
      const q = case2 ? seg(p, 0.56, 1) : seg(p, 0, 0.5) // progress inside the current case
      // hole: oversize in case 2 (walls step out)
      const widen = ease(seg(p, 0.5, 0.56)) * 5
      r.wallsL.current.forEach((w) => w?.setAttribute('transform', `translate(${-widen} 0)`))
      r.wallsR.current.forEach((w) => w?.setAttribute('transform', `translate(${widen} 0)`))
      r.caseText.current.textContent = case2 ? g.case2 : g.case1
      // gauges: drop in; reset (lift) between the cases
      const lift = seg(p, 0.46, 0.52) * (1 - seg(p, 0.52, 0.56))
      const goDepth = ease(seg(q, 0.04, 0.36)) * 78
      const nogoFull = case2 ? ease(seg(q, 0.44, 0.78)) * 78 : ease(seg(q, 0.46, 0.66)) * TURN * 1.8 // ≤ 2 turns
      const up = lift * 90
      r.go.current.setAttribute('transform', `translate(0 ${goDepth - up})`)
      r.nogo.current.setAttribute('transform', `translate(0 ${nogoFull - up})`)
      // thread hatching scrolls with depth (reads as the gauge turning)
      r.goHatch.current.setAttribute('transform', `translate(0 ${-(goDepth % TURN)})`)
      r.nogoHatch.current.setAttribute('transform', `translate(0 ${-(nogoFull % TURN)})`)
      // labels in the bottom line
      const goOn = seg(q, 0.36, 0.42) * (1 - lift)
      r.goLabel.current.style.opacity = String(goOn)
      const nogoOn = (case2 ? seg(q, 0.78, 0.84) : seg(q, 0.66, 0.72)) * (1 - lift)
      r.nogoLabel.current.style.opacity = String(nogoOn)
      r.nogoLabel.current.textContent = case2 ? g.nogoEntered : g.nogoHold
      r.nogoLabel.current.setAttribute('fill', case2 ? RED : INK)
      // result chip
      const chipOn = (case2 ? seg(q, 0.86, 0.94) : seg(q, 0.76, 0.84)) * (1 - lift)
      r.chip.current.style.opacity = String(chipOn)
      r.chipText.current.textContent = case2 ? g.rejected : g.accepted
      r.chipText.current.setAttribute('fill', case2 ? RED : GREEN)
      r.chipBox.current.setAttribute('stroke', case2 ? RED : GREEN)
      r.chipBox.current.setAttribute('fill', case2 ? RED_TINT : GREEN_TINT)
      // tolerance band: the part's size sits inside (case 1), then past MAX (case 2)
      const px = lerp(250, 352, ease(seg(p, 0.5, 0.58)))
      r.part.current.setAttribute('transform', `translate(${px} 0)`)
      r.partLine.current.setAttribute('stroke', case2 ? RED : INK)
    },
  }))

  const nut = (cx, i) => (
    <g key={cx}>
      {/* nut section: two halves with the threaded hole between them */}
      <g ref={(el) => (r.wallsL.current[i] = el)}>
        <rect x={cx - 74} y="132" width="58" height="66" fill="#D7D8D5" stroke={INK} strokeWidth="1.2" />
        <path d={`M${cx - 16} 132 ${Array.from({ length: 7 }, (_, k) => `L${cx - 21} ${136 + k * 9} L${cx - 16} ${140.5 + k * 9}`).join(' ')} L${cx - 16} 198`} fill="none" stroke="#55575A" strokeWidth="1" />
      </g>
      <g ref={(el) => (r.wallsR.current[i] = el)}>
        <rect x={cx + 16} y="132" width="58" height="66" fill="#D7D8D5" stroke={INK} strokeWidth="1.2" />
        <path d={`M${cx + 16} 132 ${Array.from({ length: 7 }, (_, k) => `L${cx + 21} ${136 + k * 9} L${cx + 16} ${140.5 + k * 9}`).join(' ')} L${cx + 16} 198`} fill="none" stroke="#55575A" strokeWidth="1" />
      </g>
    </g>
  )

  // plug gauge: handle + threaded plug (bottom of the plug at y = 128 before it drops)
  const plug = (cx, gref, href, name, w, tone) => (
    <g ref={gref}>
      <rect x={cx - 26} y="22" width="52" height="34" rx="3" fill={tone} stroke={INK} strokeWidth="1.2" />
      <text x={cx} y="43" textAnchor="middle" className="font-mono" fontSize="11" fontWeight="500" letterSpacing="1" fill={INK}>
        {name}
      </text>
      <rect x={cx - 5} y="56" width="10" height="12" fill="#BFC0BD" stroke={INK} strokeWidth="1" />
      <clipPath id={`${id}-${name}`}>
        <rect x={cx - w / 2} y="68" width={w} height="60" />
      </clipPath>
      <rect x={cx - w / 2} y="68" width={w} height="60" fill="#C9CAC7" stroke={INK} strokeWidth="1.2" />
      <g clipPath={`url(#${id}-${name})`}>
        <g ref={href}>
          {Array.from({ length: 9 }, (_, k) => (
            <line key={k} x1={cx - w / 2} y1={66 + k * TURN} x2={cx + w / 2} y2={70 + k * TURN} stroke="#55575A" strokeOpacity=".7" />
          ))}
        </g>
      </g>
    </g>
  )

  return (
    <Frame label={label} readout="">
      {() => (
        <>
          <text ref={r.caseText} x="16" y="24" className="font-mono" fontSize="11" letterSpacing="1.4" fill={STEEL}>
            {g.case1}
          </text>
          {/* gauges first, so the nut halves draw over the part of the plug that is inside */}
          {plug(GX[0], r.go, r.goHatch, g.go, 30, '#E7E6E2')}
          {plug(GX[1], r.nogo, r.nogoHatch, g.nogo, 36, RED_TINT)}
          {nut(GX[0], 0)}
          {nut(GX[1], 1)}
          {/* bottom line: the two verdicts side by side */}
          <text ref={r.goLabel} x={GX[0]} y="226" textAnchor="middle" className="font-mono" fontSize="14" fontWeight="500" letterSpacing="0.6" fill={INK} style={{ opacity: 0 }}>
            {g.goPass}
          </text>
          <text ref={r.nogoLabel} x={GX[1]} y="226" textAnchor="middle" className="font-mono" fontSize="14" fontWeight="500" letterSpacing="0.6" fill={INK} style={{ opacity: 0 }}>
            {g.nogoHold}
          </text>
          <g ref={r.chip} style={{ opacity: 0 }}>
            <rect ref={r.chipBox} x="170" y="240" width="140" height="24" rx="3" fill={GREEN_TINT} stroke={GREEN} strokeWidth="1.2" />
            <text ref={r.chipText} x="240" y="256.5" textAnchor="middle" className="font-mono" fontSize="11.5" fontWeight="500" letterSpacing="2" fill={GREEN}>
              {g.accepted}
            </text>
          </g>
          {/* tolerance band: MIN (GO) .. MAX (NO-GO) */}
          <g>
            <line x1="120" y1="296" x2="380" y2="296" stroke={STEEL} strokeWidth="1" />
            <rect x="180" y="291" width="140" height="10" fill="var(--color-steel-100)" stroke={INK} strokeWidth="1" />
            <path d="M180 286v20M320 286v20" stroke={INK} strokeWidth="1.2" />
            <text x="180" y="283" textAnchor="middle" className="font-mono" fontSize="9" letterSpacing="1" fill={INK}>
              {g.min} · {g.go}
            </text>
            <text x="320" y="283" textAnchor="middle" className="font-mono" fontSize="9" letterSpacing="1" fill={INK}>
              {g.max} · {g.nogo}
            </text>
            <g ref={r.part} transform="translate(250 0)">
              <line ref={r.partLine} x1="0" y1="288" x2="0" y2="304" stroke={INK} strokeWidth="2" />
              <text x="0" y="316" textAnchor="middle" className="font-mono" fontSize="8.5" letterSpacing="1" fill={STEEL}>
                {g.part}
              </text>
            </g>
          </g>
        </>
      )}
    </Frame>
  )
})

/* 03 — slotting: a saw drops onto the head and cuts the slot */
export const Slotting = forwardRef(function Slotting({ label }, ref) {
  const saw = useRef(null)
  const cut = useRef(null)
  const chips = useRef(null)
  const out = useRef(null)
  useImperativeHandle(ref, () => ({
    set(p) {
      const down = ease(seg(p, 0.05, 0.55))
      const up = ease(seg(p, 0.7, 0.95))
      const y = lerp(-70, 0, down) - up * 70
      const spin = p * 2400
      saw.current.setAttribute('transform', `translate(0 ${y}) rotate(${spin} 220 92)`)
      const depth = Math.max(0, Math.min(1, (down - 0.55) / 0.45)) * 24
      cut.current.setAttribute('height', String(depth))
      chips.current.style.opacity = String(depth > 0 && up === 0 && p < 0.7 ? 1 : 0)
      out.current.textContent = up > 0 ? 'SLOT ✓' : depth > 0 ? 'CUTTING' : 'INDEX'
    },
  }))
  const teeth = []
  for (let i = 0; i < 24; i++) teeth.push(i)
  return (
    <Frame label={label} readoutRef={out} readout="INDEX">
      {(steel) => (
        <>
          {/* fixture */}
          <rect x="120" y="230" width="200" height="40" rx="3" fill="#D7D8D5" stroke={INK} strokeWidth="1.2" />
          {/* screw standing in the fixture, head up */}
          <rect x="205" y="186" width="30" height="60" fill={steel} />
          {[192, 202, 212, 222].map((yy) => (
            <line key={yy} x1="205" y1={yy} x2="235" y2={yy + 6} stroke="#55575A" strokeOpacity=".45" />
          ))}
          <rect x="176" y="150" width="88" height="38" rx="4" fill={steel} stroke="#55575A" strokeOpacity=".4" />
          <rect ref={cut} x="214" y="150" width="12" height="0" fill="#55575A" />
          {/* slitting saw */}
          <g ref={saw}>
            <circle cx="220" cy="92" r="56" fill="#E7E6E2" stroke={INK} strokeWidth="1.2" />
            {teeth.map((i) => {
              const a = (i / 24) * Math.PI * 2
              return <line key={i} x1={220 + Math.sin(a) * 56} y1={92 + Math.cos(a) * 56} x2={220 + Math.sin(a + 0.1) * 62} y2={92 + Math.cos(a + 0.1) * 62} stroke={INK} strokeWidth="1.2" />
            })}
            <circle cx="220" cy="92" r="12" fill="#C4C5C3" stroke={INK} />
            <line x1="220" y1="40" x2="220" y2="56" stroke={RED} strokeWidth="2" />
          </g>
          <g ref={chips} stroke={RED} strokeWidth="2" strokeLinecap="round" style={{ opacity: 0 }}>
            <line x1="250" y1="146" x2="266" y2="132" />
            <line x1="190" y1="146" x2="174" y2="134" />
            <line x1="256" y1="152" x2="276" y2="148" />
          </g>
          <text x="40" y="40" className="font-mono" fontSize="10" letterSpacing="1.5" fill={STEEL}>
            SLOTTING · BT
          </text>
        </>
      )}
    </Frame>
  )
})

export const VIGNETTES = { coil: Coil, heading: Heading, slotting: Slotting, rolling: Rolling, heatPlating: HeatPlating, inspection: GoNoGo }
