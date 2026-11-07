import { content } from '../../data/content.js'
import { whatsappHref } from '../../lib/contact.js'
import Button from '../ui/Button.jsx'
import { WhatsAppIcon } from '../ui/Icons.jsx'

const t = content.howCustom

/** Four steps of a custom order (no timelines: none were supplied). */
export default function HowCustom() {
  return (
    <section aria-labelledby="how-custom-title" className="relative section-y bg-paper">
      <div className="container-x">
        <p className="label-mono mb-6 flex items-center gap-3 text-steel-700">
          <span className="h-px w-8 bg-red" aria-hidden />
          {t.label}
        </p>
        <h2 id="how-custom-title" className="text-h2 max-w-[18ch]">
          {t.title}
        </h2>
        <ol className="mt-10 grid gap-px border border-steel-300 bg-steel-300 sm:grid-cols-2 lg:grid-cols-4 md:mt-14">
          {t.steps.map((s, i) => (
            <li key={s.k} className="relative bg-paper p-5 sm:p-7">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-full border border-ink font-mono text-small">{s.k}</span>
                {i < t.steps.length - 1 && <span className="h-px flex-1 bg-steel-300 max-lg:hidden" aria-hidden />}
              </div>
              <p className="mt-5 font-display text-[1.2rem] leading-tight font-[760] [font-stretch:112%]">{s.title}</p>
              <p className="mt-2 text-small text-steel-700">{s.text}</p>
            </li>
          ))}
        </ol>
        <Button href={whatsappHref(t.message)} icon={<WhatsAppIcon />} className="mt-8">
          {t.cta}
        </Button>
      </div>
    </section>
  )
}
