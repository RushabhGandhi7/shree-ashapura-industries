// One-shot scroll reveal with fallbacks, so content can never stay invisible:
//  - reduced motion: finish() at once (final state, no animation)
//  - the trigger point can't be reached (short page, tall screen, end of page): finish()
//  - safety: 4 s after mount, anything already on screen plays
// Call inside a useGSAP() scope (the ScrollTrigger is reverted with the context) and return
// the cleanup it gives back.
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from './device.js'

export function revealOnce(trigger, { play, finish, start = 'top 92%' }) {
  if (prefersReducedMotion()) {
    finish()
    return () => {}
  }
  let done = false
  const run = (fn) => {
    if (done) return
    done = true
    fn()
  }
  const unreachable = (self) => self.start > ScrollTrigger.maxScroll(window) + 1
  const st = ScrollTrigger.create({
    trigger,
    start,
    once: true,
    onEnter: () => run(play),
    onRefresh: (self) => unreachable(self) && run(finish),
  })
  if (unreachable(st)) run(finish)
  const timer = setTimeout(() => {
    const r = trigger.getBoundingClientRect()
    if (r.top < window.innerHeight && r.bottom > 0) run(play)
  }, 4000)
  return () => {
    clearTimeout(timer)
    st.kill()
  }
}
