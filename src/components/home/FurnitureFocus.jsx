// Home: "Fasteners for household furniture" (phase 12D). Seven cards linking to the
// category page / item card, each with a photo slot (`photo` in content.js `furniture`).
// Until a real photo arrives, the card shows our own visual: the rendered 3D poster where
// one exists, else a blueprint drawing, with a "Photo coming" tag. An eighth tile links to
// the full furniture line so the grid has full rows (2 / 4 per row).
import { Link } from 'react-router'
import { content } from '../../data/content.js'
import SectionHead from '../ui/SectionHead.jsx'
import ItemDrawing from '../products/ItemDrawing.jsx'

const t = content.furniture

export default function FurnitureFocus() {
  return (
    <section id="furniture" aria-labelledby="furniture-title" className="relative section-y bg-paper">
      <div className="container-x">
        <SectionHead
          id="furniture-title"
          label={t.label}
          title={
            <>
              {t.title[0]} <span className="text-red">{t.title[1]}</span>
            </>
          }
          aside={<p className="max-w-[44ch]">{t.lead}</p>}
        />
        <ul className="grid grid-cols-2 gap-px border border-steel-300 bg-steel-300 lg:grid-cols-4">
          {t.cards.map((c) => (
            <li key={c.key}>
              <Link to={c.href} className="shine group flex h-full flex-col bg-paper transition-colors duration-300 hover:bg-white">
                <div className="relative aspect-[4/3] overflow-hidden border-b border-steel-300/70">
                  <div className="bp-grid bp-grid-fade absolute inset-0 opacity-70" aria-hidden />
                  {c.photo ? (
                    <img src={c.photo} alt={c.name} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
                  ) : (
                    <>
                      {c.render ? (
                        <img src={`/products/items/${c.render}.webp`} alt="" width="1200" height="900" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-contain" />
                      ) : (
                        <ItemDrawing kind={c.drawing} className="absolute inset-0 h-full w-full p-[8%]" />
                      )}
                      <span className="label-mono absolute top-2 right-2 rounded-xs border border-dashed border-steel-300 bg-paper/85 px-1.5 py-0.5 text-[9px] text-steel-500 sm:text-[10px]">
                        {t.photoComing}
                      </span>
                    </>
                  )}
                </div>
                <p className="flex items-center justify-between gap-2 p-3 sm:p-4">
                  <span className="font-display text-[1rem] leading-tight font-[760] [font-stretch:110%] sm:text-[1.1rem]">{c.name}</span>
                  <span aria-hidden className="label-mono text-steel-500 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-red">
                    →
                  </span>
                </p>
              </Link>
            </li>
          ))}
          <li className="bg-paper-2">
            <Link to="/products/furniture-fittings" className="relative flex h-full min-h-40 flex-col justify-end gap-2 overflow-hidden p-4 hover:bg-white sm:p-5">
              <div className="bp-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden />
              <span className="relative font-display text-[1.1rem] leading-tight font-[760] [font-stretch:110%]">{t.all}</span>
              <span className="relative text-small text-steel-700">{t.allText}</span>
              <span className="label-mono relative text-red">→</span>
            </Link>
          </li>
        </ul>
      </div>
    </section>
  )
}
