import { customers } from '../../data/products.js'

const Mark = ({ c }) =>
  c.logo ? (
    <img src={c.logo} alt="" loading="lazy" className="h-9 w-auto max-w-[10rem] object-contain opacity-80 grayscale" />
  ) : (
    <span className="font-display text-[clamp(1.15rem,0.95rem+0.8vw,1.6rem)] leading-none font-[760] tracking-[-0.01em] whitespace-nowrap text-steel-700 [font-stretch:115%]">
      {c.name}
    </span>
  )

/**
 * "Trusted by": customer wordmarks in a slow marquee (pauses on hover / focus; static
 * under reduced motion). Text until logo files arrive: give a customer a `logo`
 * (e.g. '/brand/customers/godrej.svg') in src/data/products.js.
 */
export default function Customers({ title, more }) {
  const row = (hidden) => (
    <ul className="flex shrink-0 items-center gap-14 pr-14 md:gap-20 md:pr-20" aria-hidden={hidden || undefined}>
      {customers.map((c) => (
        <li key={c.name} className="flex items-center gap-14 md:gap-20">
          <Mark c={c} />
          <span className="size-1.5 rounded-full bg-red/70" aria-hidden />
        </li>
      ))}
    </ul>
  )
  return (
    <div className="mt-16 md:mt-20">
      <p className="label-mono mb-6 flex items-center gap-3 text-steel-700">
        <span className="h-px w-8 bg-red" aria-hidden />
        {title}
      </p>
      {/* screen readers get the plain list */}
      <ul className="sr-only">
        {customers.map((c) => (
          <li key={c.name}>{c.name}</li>
        ))}
      </ul>
      <div
        className="group relative overflow-hidden border-y border-steel-300 py-7 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]"
        aria-hidden
      >
        <div className="flex w-max animate-[sa-marquee_48s_linear_infinite] group-hover:[animation-play-state:paused] motion-reduce:w-auto motion-reduce:animate-none motion-reduce:flex-wrap">
          {row(false)}
          <span className="contents motion-reduce:hidden">{row(true)}</span>
        </div>
      </div>
      <p className="label-mono mt-4 text-steel-500">+ {more}</p>
    </div>
  )
}
