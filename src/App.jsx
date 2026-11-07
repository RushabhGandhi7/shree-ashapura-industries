import { useEffect, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SmoothScrollProvider } from './lib/smoothScroll.jsx'
import Loader, { shouldShowLoader } from './components/Loader.jsx'
import Cursor from './components/Cursor.jsx'
import Navbar from './components/layout/Navbar.jsx'
import Footer from './components/layout/Footer.jsx'
import GearDivider from './components/ui/GearDivider.jsx'
import Hero from './components/hero/Hero.jsx'
import Products from './components/products/Products.jsx'
import Exploded from './components/exploded/Exploded.jsx'
import Customiser from './components/customise/Customiser.jsx'
import Process from './components/process/Process.jsx'
import Quality from './components/quality/Quality.jsx'
import Industries from './components/industries/Industries.jsx'
import Gallery from './components/gallery/Gallery.jsx'
import Contact from './components/contact/Contact.jsx'

// Below-the-fold sections mount progressively, one group per idle slice after the hero,
// in page order. That keeps any single main-thread task short on phones (low TBT) while
// still having the whole page ready within about a second. Sections mount top to bottom,
// so each one's ScrollTriggers are measured with everything above it already in place.
const GROUPS = [
  () => (
    <>
      <Products />
      <GearDivider />
    </>
  ),
  () => <Exploded />,
  () => (
    <>
      <Customiser />
      <GearDivider />
    </>
  ),
  () => (
    <>
      <Process />
      <GearDivider />
    </>
  ),
  () => <Quality />,
  () => <Industries />,
  () => (
    <>
      <Gallery />
      <GearDivider />
    </>
  ),
  () => <Contact />,
]

const idle = (fn) => (window.requestIdleCallback ? requestIdleCallback(fn, { timeout: 400 }) : setTimeout(fn, 60))

export default function App() {
  const [showLoader] = useState(shouldShowLoader)
  // A deep link (#contact) needs the whole page at once.
  const [mounted, setMounted] = useState(() => (window.location.hash ? GROUPS.length : 0))

  useEffect(() => {
    if (mounted >= GROUPS.length) {
      ScrollTrigger.refresh()
      if (window.location.hash) document.getElementById(window.location.hash.slice(1))?.scrollIntoView()
      return
    }
    const id = idle(() => setMounted((m) => m + 1))
    return () => (window.cancelIdleCallback ? cancelIdleCallback(id) : clearTimeout(id))
  }, [mounted])

  return (
    <SmoothScrollProvider>
      {showLoader && <Loader />}
      <Cursor />
      <Navbar />
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero />
        {GROUPS.slice(0, mounted).map((G, i) => (
          <G key={i} />
        ))}
      </main>
      {mounted >= GROUPS.length && <Footer />}
    </SmoothScrollProvider>
  )
}
