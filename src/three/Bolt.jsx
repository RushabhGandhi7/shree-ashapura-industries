import { forwardRef, useMemo } from 'react'
import * as THREE from 'three'
import { hexHead, threadedShaft, mm } from './geometry.js'
import { finishProps } from './materials.js'

// ISO 4017-ish proportions from nominal diameter (mm). PLACEHOLDER table, easy to refine.
export const headDims = (d) => {
  const table = { 5: [8, 3.5], 6: [10, 4], 8: [13, 5.3], 10: [16, 6.4], 12: [18, 7.5], 16: [24, 10], 20: [30, 12.5] }
  const [af, k] = table[d] ?? [d * 1.5, d * 0.62]
  return { af: mm(af), k: mm(k) }
}

/**
 * Parametric bolt from a products.js `model` spec.
 * Local origin: under-head bearing face at y = 0; head above, shank below to y = -length.
 */
const Bolt = forwardRef(function Bolt({ spec, detail = 'high', children, ...props }, ref) {
  const { diameter, length, pitch, finish } = spec
  const D = mm(diameter)
  const L = mm(length)
  const P = mm(pitch)
  const { af, k } = headDims(diameter)

  const shaft = useMemo(() => threadedShaft({ diameter: D, length: L, pitch: P, detail }), [D, L, P, detail])
  const head = useMemo(() => hexHead({ af, height: k }), [af, k])
  const washerFace = useMemo(() => new THREE.CylinderGeometry(af * 0.47, af * 0.47, 0.03, 48), [af])
  const mat = finishProps(finish)

  return (
    <group ref={ref} {...props}>
      <mesh geometry={shaft}>
        <meshStandardMaterial {...mat} />
      </mesh>
      <mesh geometry={washerFace} position-y={0.015}>
        <meshStandardMaterial {...mat} />
      </mesh>
      <mesh geometry={head} position-y={0.03}>
        <meshStandardMaterial {...mat} flatShading={false} />
      </mesh>
      {children}
    </group>
  )
})

export default Bolt
