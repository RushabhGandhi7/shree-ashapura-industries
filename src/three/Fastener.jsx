// Parametric R3F components for every procedural part.
//
//   <Fastener type="bolt" head="socket" diameter={8} length={40} pitch={1.25} finish="brass" />
//
// type:     bolt | nut | washer | screw | bracket | turned | clip | connector
// head:     variant (see `variants` in src/data/products.js), e.g. bolt: hex | socket | pan | countersunk
// diameter: mm (bracket: width; turned: largest Ø; clip: stem Ø; connector: bolt shank Ø)
// length:   mm (ignored for nuts / washers)
// pitch:    mm (defaults to ISO coarse, or ST pitch for self-tapping screws)
// finish:   zinc | blackOxide | brass | stainless | redAnodised | yellowZinc | mildSteel | nylon | nylonBlack
// detail:   'high' | 'low' (fewer segments + standard material for phones)
// materialFor(role): optional override returning a material per role (e.g. animated finishes)
//
// Local origin: the bearing face (under the head / bottom of a nut or washer) at y = 0.
import { forwardRef, useMemo } from 'react'
import { buildPart } from './parts.js'
import { getMaterial } from './materials.js'

export const Fastener = forwardRef(function Fastener(
  { type = 'bolt', head, variant, diameter, length, pitch, finish = 'zinc', detail = 'high', quality, wireframe = false, materialFor, children, ...props },
  ref,
) {
  const part = useMemo(
    () => buildPart({ type, head: head ?? variant, diameter, length, pitch, detail }),
    [type, head, variant, diameter, length, pitch, detail],
  )
  const q = quality ?? detail
  return (
    <group ref={ref} {...props}>
      {Object.entries(part.geos).map(([role, geo]) => (
        <mesh key={role} geometry={geo} material={wireframe ? undefined : (materialFor?.(role) ?? getMaterial(finish, role, q))}>
          {wireframe && <meshBasicMaterial wireframe color="#55575A" />}
        </mesh>
      ))}
      {children}
    </group>
  )
})

const typed = (type) =>
  forwardRef(function Typed(props, ref) {
    return <Fastener ref={ref} type={type} {...props} />
  })

export const Bolt = typed('bolt')
export const Nut = typed('nut')
export const Washer = typed('washer')
export const Screw = typed('screw')
export const Bracket = typed('bracket')
export const TurnedPart = typed('turned')
export const MouldedClip = typed('clip')
export const FurnitureConnector = typed('connector')

export { buildPart }
