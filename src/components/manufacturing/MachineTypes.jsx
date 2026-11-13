// Types of machines (phase 12C): six cards, each with a silent video slot (ui/VideoSlot:
// mounted only once `video` is set in content.js `machineTypes.cards`). Until then the slot
// shows a blueprint placeholder + "Video coming".
// Counts come from MACHINE_COUNTS (never typed here).
import { content, machines } from '../../data/content.js'
import VideoSlot from '../ui/VideoSlot.jsx'
import SectionHead from '../ui/SectionHead.jsx'
import { MACHINING_DRAWINGS } from './Machining.jsx'

const t = content.machineTypes
const cap = content.capability
// placeholders: the machine-area drawings from the gallery, or the machining drawings
const ILLUSTRATION = { heading: 'header', rolling: 'thread-roller', slotting: 'slotter' }
const DRAWING = { turning: 'turning', drilling: 'drilling', grinding: 'grinding' }

function Placeholder({ card }) {
  return ILLUSTRATION[card.key] ? (
    <img src={`/gallery/illustrations/${ILLUSTRATION[card.key]}.svg`} alt="" width="1600" height="1200" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-contain p-3" />
  ) : (
    <svg viewBox="0 0 160 100" className="absolute inset-0 m-auto h-[78%] w-[78%]" aria-hidden>
      {MACHINING_DRAWINGS[DRAWING[card.key]]}
    </svg>
  )
}

export default function MachineTypes() {
  return (
    <section id="machine-types" aria-labelledby="machine-types-title" className="relative section-y bg-paper-2">
      <div className="bp-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden />
      <div className="container-x relative">
        <SectionHead
          id="machine-types-title"
          label={t.label}
          title={
            <>
              {t.title[0]} <span className="text-red">{t.title[1]}</span>
            </>
          }
          aside={<p className="max-w-[44ch]">{t.lead}</p>}
        />
        <ul className="grid gap-px border border-steel-300 bg-steel-300 md:grid-cols-2 lg:grid-cols-3">
          {t.cards.map((c, i) => {
            const m = c.machine && machines.find((x) => x.key === c.machine)
            return (
              <li key={c.key} className="flex flex-col bg-paper">
                <div className="relative aspect-video overflow-hidden border-b border-steel-300/70 bg-paper">
                  <div className="bp-grid absolute inset-0 opacity-50" aria-hidden />
                  <VideoSlot src={c.video} poster={c.poster} label={t.playLabel(c.name)} coming={t.videoComing} placeholder={<Placeholder card={c} />} />
                </div>
                <div className="flex flex-1 flex-col gap-1.5 p-4 sm:p-5">
                  <span className="font-mono text-[11px] text-red">T{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="font-display text-[1.15rem] leading-tight font-[760] [font-stretch:112%]">{c.name}</h3>
                  <p className="text-small text-steel-700">{c.text}</p>
                  {m && (
                    <p className="label-mono mt-auto pt-2 text-ink">
                      {cap.machinesLabel(m.count)} · {cap.rangeLabel(m)}
                    </p>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
