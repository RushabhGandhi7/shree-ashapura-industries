// Which category cards should be spinning. Written by the DOM (hover / focus / in-view),
// read by the lazy 3D chunk each frame. No React state, no three import.
const state = {}
// cards whose live view has drawn its first frame (their WebP poster can fade out)
let ready = {}
const subs = new Set()
const emit = () => subs.forEach((f) => f())

export const spinStore = {
  invalidate: null, // set by the shared canvas (frameloop="demand")
  get(slug) {
    return (state[slug] ??= { active: false, until: 0 })
  },
  /** Hold the spin while hovered / focused. */
  set(slug, active) {
    this.get(slug).active = active
    this.invalidate?.()
  },
  /** One turn (touch: card scrolled into view, or tapped). */
  kick(slug, ms = 2600) {
    this.get(slug).until = performance.now() + ms
    this.invalidate?.()
  },
  markReady(slug) {
    if (ready[slug]) return
    ready = { ...ready, [slug]: true }
    emit()
  },
  resetReady() {
    ready = {}
    emit()
  },
  getReady: () => ready,
  subscribe(f) {
    subs.add(f)
    return () => subs.delete(f)
  },
  isSpinning(slug) {
    const s = this.get(slug)
    return s.active || performance.now() < s.until
  },
}
