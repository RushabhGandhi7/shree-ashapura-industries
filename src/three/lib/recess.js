// Drive recesses: hex socket (Allen) and cross (Phillips-style, optionally with a long slot).
// Walls and floors go into the `dark` builder (a darker variant of the finish) as cheap
// ambient occlusion.
import { ring, stitch, up, cross, sub, dot, len } from './builder.js'
import { hexOutline } from './hex.js'

/** Flat top face of radius rOuter (matching a lathe ring of N segments) with a hex socket. */
export function hexSocket(B, { rOuter, y, N, s, depth, detail = 'high' }) {
  const per = detail === 'low' ? 2 : 4
  const top = hexOutline(s, y, per)
  stitch(B.main, ring(rOuter, y, N), top, up)

  // Mouth chamfer, walls, then a drill-point (118°) floor.
  const ch = s * 0.06
  const mouth = hexOutline(s * 0.96, y - ch, per)
  const bot = hexOutline(s * 0.96, y - depth, per)
  const apex = [0, y - depth - (s * 0.48) / Math.tan((59 * Math.PI) / 180), 0]
  const n = top.length
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    wallQuad(B.dark, top[i], top[j], mouth[j], mouth[i])
    wallQuad(B.dark, mouth[i], mouth[j], bot[j], bot[i])
    const fn = faceNormalToward(bot[i], bot[j], apex, [0, 1, 0])
    B.dark.tri(B.dark.vert(bot[i], fn), B.dark.vert(bot[j], fn), B.dark.vert(apex, fn))
  }
}

/**
 * Cross recess on a top surface y = surfaceY(r) with normal surfaceN(p).
 * armX / armZ: half-lengths of the arms (make armX longer for a cross + slot drive).
 */
export function crossRecess(B, { rOuter, N, surfaceY, surfaceN, armX, armZ, w, depth, rings = 2, detail = 'high' }) {
  const c = w * 0.9 // inner-corner chamfer
  const P2 = [
    [armX, -w], [armX, w], [w + c, w], [w, w + c], [w, armZ], [-w, armZ], [-w, w + c], [-w - c, w],
    [-armX, w], [-armX, -w], [-w - c, -w], [-w, -w - c], [-w, -armZ], [w, -armZ], [w, -w - c], [w + c, -w],
  ]
  // subdivide long edges so the stitched band has nicer triangles
  const sub2 = detail === 'low' ? 1 : 3
  const outline2 = []
  for (let i = 0; i < P2.length; i++) {
    const a = P2[i]
    const b = P2[(i + 1) % P2.length]
    for (let k = 0; k < sub2; k++) {
      const f = k / sub2
      outline2.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f])
    }
  }
  const lift = (x, z) => [x, surfaceY(Math.hypot(x, z)), z]
  const outline = outline2.map(([x, z]) => lift(x, z))

  // Concentric rings between the lathe's edge and the recess so the curved cap stays round.
  const rMax = Math.max(Math.hypot(armX, w), Math.hypot(w, armZ)) * 1.06
  let prev = ring(rOuter, surfaceY(rOuter), N)
  for (let k = 1; k <= rings; k++) {
    const r = rOuter + ((rMax - rOuter) * k) / (rings + 0.0001)
    const cur = ring(r, surfaceY(r), N)
    stitch(B.main, prev, cur, surfaceN)
    prev = cur
  }
  stitch(B.main, prev, outline, surfaceN)

  // Tapered walls down to a smaller cross, then the floor.
  const y0 = surfaceY(0) - depth
  const bottom = outline2.map(([x, z]) => [x * 0.42, y0, z * 0.42])
  const n = outline.length
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    wallQuad(B.dark, outline[i], outline[j], bottom[j], bottom[i])
  }
  stitch(B.dark, bottom, [[0, y0 - depth * 0.15, 0]], up)
}

// A flat quad whose normal faces the recess interior (toward the axis and up).
function wallQuad(b, p0, p1, p2, p3) {
  const mid = [(p0[0] + p2[0]) / 2, (p0[1] + p2[1]) / 2, (p0[2] + p2[2]) / 2]
  const toward = [-mid[0], 0.6 * Math.hypot(mid[0], mid[2]), -mid[2]]
  const n = faceNormalToward(p0, p1, p2, toward)
  b.quad(b.vert(p0, n), b.vert(p1, n), b.vert(p2, n), b.vert(p3, n))
}

function faceNormalToward(a, b, c, toward) {
  let n = cross(sub(b, a), sub(c, a))
  const l = len(n) || 1
  n = n.map((x) => x / l)
  return dot(n, toward) < 0 ? n.map((x) => -x) : n
}
