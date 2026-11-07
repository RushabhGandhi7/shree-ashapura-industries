import { customers } from '../../data/products.js'

/**
 * Customer wordmarks. Styled text until logo files arrive: give a customer a `logo`
 * (e.g. '/brand/customers/godrej.svg') in src/data/products.js and it renders instead.
 */
export default function Customers({ title, more }) {
  return (
    <div className="mt-16 md:mt-20">
      <p className="label-mono mb-6 flex items-center gap-3 text-steel-700">
        <span className="h-px w-8 bg-red" aria-hidden />
        {title}
      </p>
      <ul className="grid grid-cols-2 gap-px border border-steel-300 bg-steel-300 sm:grid-cols-4">
        {customers.map((c) => (
          <li key={c.name} className="flex min-h-24 items-center justify-center bg-paper px-4 py-6 text-center">
            {c.logo ? (
              <img src={c.logo} alt={c.name} loading="lazy" className="max-h-10 w-auto max-w-full object-contain opacity-80 grayscale" />
            ) : (
              <span className="font-display text-[clamp(1rem,0.85rem+0.5vw,1.25rem)] leading-tight font-[760] tracking-[-0.01em] text-steel-700 [font-stretch:112%]">
                {c.name}
              </span>
            )}
          </li>
        ))}
      </ul>
      <p className="label-mono mt-4 text-steel-500">+ {more}</p>
    </div>
  )
}
