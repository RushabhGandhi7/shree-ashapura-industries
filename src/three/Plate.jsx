import { useMemo } from 'react'
import * as THREE from 'three'
import { plateWithHole, tappedSleeve, mm } from './geometry.js'
import { plateProps, boreProps } from './materials.js'

/** Steel plate with a tapped hole matching `spec` (diameter/pitch in mm). Top face at y = 0. */
export default function Plate({ spec, width = 4.6, depth = 3.2, thickness = 0.8, detail = 'high', ...props }) {
  const D = mm(spec.diameter)
  const P = mm(spec.pitch)
  const plate = useMemo(
    () => plateWithHole({ width, depth, thickness, holeDiameter: D + 0.05 }),
    [width, depth, thickness, D],
  )
  const sleeve = useMemo(() => tappedSleeve({ diameter: D, depth: thickness, pitch: P, detail }), [D, P, thickness, detail])

  return (
    <group {...props}>
      <mesh geometry={plate}>
        <meshStandardMaterial {...plateProps} />
      </mesh>
      <mesh geometry={sleeve}>
        <meshStandardMaterial {...boreProps} side={THREE.BackSide} />
      </mesh>
    </group>
  )
}
