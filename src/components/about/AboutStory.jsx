import { company, content, yearsInBusiness } from '../../data/content.js'
import DimensionLine from '../ui/DimensionLine.jsx'

const t = content.about

/** About: the story since 1990, key facts and the CEO. */
export default function AboutStory() {
  return (
    <section aria-labelledby="about-title" className="relative pb-20 pt-10 md:pb-28 md:pt-14">
      <div className="bp-grid bp-grid-fade pointer-events-none absolute inset-0 opacity-50" aria-hidden />
      <div className="container-x relative grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="label-mono mb-6 flex items-center gap-3 text-steel-700">
            <span className="h-px w-8 bg-red" aria-hidden />
            {t.label}
          </p>
          <h1 id="about-title" className="text-display-lg max-w-[12ch]">
            {t.title[0]} <span className="text-red">{t.title[1]}</span>
          </h1>
          <div className="mt-8 max-w-[60ch] space-y-4 text-body-lg text-steel-700">
            {t.story.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
        <div className="space-y-8 lg:col-span-5 lg:pt-16">
          <div>
            <p className="display-wide text-[clamp(4rem,2rem+8vw,8rem)] leading-none tracking-[-0.04em]">
              {yearsInBusiness()}
              <span className="text-[0.4em] text-red">+</span>
            </p>
            <DimensionLine length="min(100%, 18rem)" label={`${company.founded} → ${new Date().getFullYear()}`} className="mt-3" />
          </div>
          <dl className="divide-y divide-steel-300 border-y border-steel-300">
            {t.facts.map((f) => (
              <div key={f.k} className="flex justify-between gap-4 py-3 text-small">
                <dt className="text-steel-700">{f.k}</dt>
                <dd className="font-medium">{f.v}</dd>
              </div>
            ))}
          </dl>
          <figure className="border border-ink bg-paper p-6">
            <blockquote className="font-display text-[1.25rem] leading-snug font-[760] [font-stretch:112%]">“{t.leader.quote.replace(/^Our mission: /, '')}”</blockquote>
            <figcaption className="mt-4 text-small">
              <span className="font-semibold">{t.leader.name}</span>
              <span className="text-steel-700">, {t.leader.role}</span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  )
}
