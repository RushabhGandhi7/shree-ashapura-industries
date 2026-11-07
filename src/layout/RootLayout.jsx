import { useState } from 'react'
import { SmoothScrollProvider } from '../lib/smoothScroll.jsx'
import Loader, { shouldShowLoader } from '../components/Loader.jsx'
import Cursor from '../components/Cursor.jsx'
import Navbar from '../components/layout/Navbar.jsx'
import Footer from '../components/layout/Footer.jsx'
import PageTransition from './PageTransition.jsx'

/** Shared shell: smooth scroll, cursor, navbar, the routed page and the footer. */
export default function RootLayout() {
  // The intro loader only runs on a first visit that lands on Home (head script sets is-loading).
  const [showLoader] = useState(shouldShowLoader)
  return (
    <SmoothScrollProvider>
      {showLoader && <Loader />}
      <Cursor />
      <Navbar />
      <main id="main" tabIndex={-1} className="outline-none">
        <PageTransition />
      </main>
      <Footer />
    </SmoothScrollProvider>
  )
}
