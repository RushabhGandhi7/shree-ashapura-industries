/** SVG path for a spur gear centred on (0, 0): `teeth` teeth between rRoot and rTip, bore rHole. */
export function gearPath(teeth, rTip, rRoot, rHole = 0) {
  const step = (Math.PI * 2) / teeth
  const pts = []
  for (let i = 0; i < teeth; i++) {
    const a = i * step
    // root → flank → tip land → flank (trapezoid tooth)
    const seq = [
      [a, rRoot],
      [a + step * 0.18, rRoot],
      [a + step * 0.32, rTip],
      [a + step * 0.68, rTip],
      [a + step * 0.82, rRoot],
    ]
    for (const [ang, r] of seq) pts.push(`${(Math.cos(ang) * r).toFixed(2)},${(Math.sin(ang) * r).toFixed(2)}`)
  }
  let d = `M${pts.join(' L')} Z`
  if (rHole > 0) d += ` M${rHole},0 A${rHole},${rHole} 0 1,0 ${-rHole},0 A${rHole},${rHole} 0 1,0 ${rHole},0 Z`
  return d
}
