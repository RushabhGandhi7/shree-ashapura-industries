// Light, neutral studio for metal reflections, built with drei <Environment> + <Lightformer>.
// It's rendered once into a cube map (frames = 1), so it costs nothing per frame and needs
// no HDR download. drei's `preset` prop fetches HDRIs from a CDN and drei flags it as not
// meant for production, so this procedural "light studio" stands in for a preset.
import * as THREE from 'three'
import { Environment, Lightformer } from '@react-three/drei'

export default function StudioEnvironment({ resolution = 256, intensity = 1, warm = false }) {
  return (
    <Environment resolution={resolution} frames={1} environmentIntensity={intensity}>
      {/* mid-grey cyclorama: neutral and light overall, but dark enough between the
          softboxes that polished metal shows contrast instead of reading as white plastic */}
      <mesh scale={60}>
        <sphereGeometry args={[1, 32, 16]} />
        <meshBasicMaterial color={warm ? '#8f8c86' : '#8a8a88'} side={THREE.BackSide} />
      </mesh>
      {/* key softbox overhead, two strip lights, a soft front fill, faint brand-red kicker */}
      <Lightformer form="rect" intensity={3} position={[0, 7, 0]} rotation-x={Math.PI / 2} scale={[12, 5, 1]} />
      <Lightformer form="rect" intensity={2.2} position={[-7, 2.5, 1.5]} rotation-y={Math.PI / 2} scale={[10, 1.4, 1]} />
      <Lightformer form="rect" intensity={1.6} position={[7, 1.5, 2.5]} rotation-y={-Math.PI / 2} scale={[10, 0.9, 1]} />
      <Lightformer form="rect" intensity={1.4} position={[0, 1.5, 8]} rotation-y={Math.PI} scale={[14, 3, 1]} color="#f6f4ef" />
      <Lightformer form="rect" intensity={0.35} position={[0, -6, 0]} rotation-x={-Math.PI / 2} scale={[14, 14, 1]} color="#e9e7e1" />
      <Lightformer form="rect" intensity={2.6} position={[-4, 4, -6]} rotation-y={Math.PI / 5} scale={[2, 8, 1]} />
      <Lightformer form="ring" intensity={0.9} position={[3.5, 2.5, -7]} scale={2.6} color="#C8102E" />
    </Environment>
  )
}
