// Silent video slot (phase 12C, shared since 12D: machine types + gallery). With `src`, a
// <video muted loop playsInline preload="none" poster> that plays only while on screen and
// never autoplays under reduced motion. Without it, `placeholder` + a "Video coming" chip.
// Fills its (relatively positioned) parent.
import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../../lib/device.js'

export default function VideoSlot({ src, poster, label, placeholder, coming }) {
  const ref = useRef(null)
  useEffect(() => {
    const v = ref.current
    if (!v || prefersReducedMotion()) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {})
        else v.pause()
      },
      { threshold: 0.35 },
    )
    io.observe(v)
    return () => io.disconnect()
  }, [src])

  if (src) {
    return <video ref={ref} className="absolute inset-0 h-full w-full object-cover" src={src} poster={poster ?? undefined} muted loop playsInline preload="none" aria-label={label} />
  }
  return (
    <>
      {placeholder}
      <span className="label-mono absolute top-2 right-2 flex items-center gap-1.5 rounded-xs border border-dashed border-steel-300 bg-paper/90 px-2 py-1 text-[10px] text-steel-700">
        <svg viewBox="0 0 10 10" className="size-2.5 text-red" aria-hidden>
          <path d="M2 1.5v7l6-3.5Z" fill="currentColor" />
        </svg>
        {coming}
      </span>
    </>
  )
}
