// Renders the surrounding R3F canvas from gsap.ticker (the same tick that drives Lenis and
// ScrollTrigger) while `running` is true and the tab is visible, so a continuously animated
// scene (idle spin) does not run a second requestAnimationFrame loop of its own.
// Use with <Canvas frameloop="never"> (or "demand" while not running).
import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import gsap from 'gsap'

export default function TickerLoop({ running }) {
  const advance = useThree((s) => s.advance)
  useEffect(() => {
    if (!running) return
    const tick = () => {
      if (!document.hidden) advance(performance.now())
    }
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [running, advance])
  return null
}
