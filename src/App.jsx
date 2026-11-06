import { useState } from 'react'
import Hero from './components/hero/Hero.jsx'
import Products from './components/products/Products.jsx'
import Exploded from './components/exploded/Exploded.jsx'
import { SmoothScrollProvider } from './lib/smoothScroll.jsx'
import { content } from './data/content.js'
import Loader, { shouldShowLoader } from './components/Loader.jsx'
import Cursor from './components/Cursor.jsx'
import Navbar from './components/layout/Navbar.jsx'
import Footer from './components/layout/Footer.jsx'
import Section from './components/ui/Section.jsx'
import DimensionLine from './components/ui/DimensionLine.jsx'

function PlaceholderSections() {
  const s = content.placeholderSections
  return (
    <>
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
        <Products />
        <Exploded />
        <PlaceholderSections />
      </main>
      <Footer />
    </SmoothScrollProvider>
  )
}
