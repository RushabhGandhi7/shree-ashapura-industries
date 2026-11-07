// Selected product line for the "Request a custom quote" band. The product drawer sets
// it (then scrolls to #quote); QuoteCTA subscribes. Tiny external store, no context.
let slug = null
const subs = new Set()

export const quoteStore = {
  get: () => slug,
  set(next) {
    slug = next
    subs.forEach((f) => f())
  },
  subscribe(f) {
    subs.add(f)
    return () => subs.delete(f)
  },
}
