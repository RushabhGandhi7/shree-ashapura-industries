import { useState } from 'react'
import Hero from './components/hero/Hero.jsx'
import { SmoothScrollProvider } from './lib/smoothScroll.jsx'
import { content } from './data/content.js'
import { categories } from './data/products.js'
import Loader, { shouldShowLoader } from './components/Loader.jsx'
import Cursor from './components/Cursor.jsx'
import Navbar from './components/layout/Navbar.jsx'
import Footer from './components/layout/Footer.jsx'
import Section from './components/ui/Section.jsx'
import Button from './components/ui/Button.jsx'
import MonoLabel from './components/ui/MonoLabel.jsx'
import DimensionLine from './components/ui/DimensionLine.jsx'
import { ArrowUpRight, WhatsAppIcon } from './components/ui/Icons.jsx'
import { whatsappHref } from './lib/contact.js'

function PlaceholderSections() {
  const s = content.placeholderSections
  return (
    <>
      <Section id="products" label={s.products.label} title={s.products.title} grid>
        <ul className="mt-12 grid gap-px border border-steel-300 bg-steel-300 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => (
            <li key={c.slug} className="shine flex min-h-44 flex-col justify-between bg-paper p-6">
              <span className="label-mono text-steel-500">{c.code}</span>
              <div>
                <h3 className="text-h3">{c.name}</h3>
                <MonoLabel className="mt-3">{c.callout}</MonoLabel>
              </div>
            </li>
          ))}
          <li className="flex min-h-44 flex-col justify-end bg-paper-2 p-6">
            <p className="max-w-[22ch] text-body-lg text-steel-700">{s.products.customCell}</p>
          </li>
        </ul>
      </Section>
      <Section id="process" label={s.process.label} title={s.process.title} tone="paper-2">
        <DimensionLine length="100%" label="WIRE → HEADING → ROLLING → HEAT → PLATING → QC" className="mt-12" />
      </Section>
      <Section id="industries" label={s.industries.label} title={s.industries.title}>
        <div className="mt-12 flex items-end gap-10">
          <DimensionLine orientation="vertical" length="12rem" label="Ø12" tone="red" />
          <div className="max-w-96 min-w-0 flex-1">
            <DimensionLine length="100%" label="M8 × 1.25" tone="ink" />
          </div>
        </div>
      </Section>
      <Section id="gallery" label={s.gallery.label} title={s.gallery.title} tone="paper-2" />
      <Section id="contact" label={s.contact.label} title={s.contact.title} grid />
    </>
  )
}

export default function App() {
  const [showLoader] = useState(shouldShowLoader)

  return (
    <SmoothScrollProvider>
      {showLoader && <Loader />}
      <Cursor />
      <Navbar />
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero />
        <PlaceholderSections />
      </main>
      <Footer />
    </SmoothScrollProvider>
  )
}
