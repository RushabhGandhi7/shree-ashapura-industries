import { Link } from 'react-router'
import { content } from '../../data/content.js'
import { IsoSeal } from './Quality.jsx'

const q = content.quality
const t = content.teasers.quality

/** Home: ISO seal, mission and the in-process checks, linking to /quality. */
export default function QualityTeaser() {
  return (
    <section aria-labelledby="quality-teaser-title" className="relative section-y bg-paper">
      <div className="container-x grid gap-10 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-5">
          <p className="label-mono mb-6 flex items-center gap-3 text-steel-700">
            <span className="h-px w-8 bg-red" aria-hidden />
            {t.label}
          </p>
          <h2 id="quality-teaser-title" className="text-h2 max-w-[14ch]">
            {t.title[0]} <span className="text-red">{t.title[1]}</span>
          </h2>
          <div className="mt-8 flex items-center gap-5">
            <IsoSeal />
            <p className="font-display text-[1.1rem] leading-snug font-[760] [font-stretch:112%]">{q.mission}</p>
          </div>
        </div>
        <div className="lg:col-span-7">
          <div className="grid gap-px border border-steel-300 bg-steel-300 sm:grid-cols-2">
            {q.inProcess.steps.map((s) => (
              <div key={s.k} className="bg-paper p-5 sm:p-7">
                <p className="font-mono text-small font-medium text-red">{s.k}</p>
                <p className="mt-3 font-display text-[1.3rem] leading-tight font-[760] [font-stretch:115%]">{s.title}</p>
                <p className="mt-2 text-small text-steel-700">{s.text}</p>
              </div>
            ))}
          </div>
          <Link to="/quality" className="label-mono mt-6 inline-flex items-center gap-2 text-ink hover:text-red">
            {t.cta} <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
