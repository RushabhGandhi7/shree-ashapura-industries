import Seo from '../layout/Seo.jsx'
import Breadcrumbs from '../components/ui/Breadcrumbs.jsx'
import { findPage } from '../routes.js'
import ContactSection from '../components/contact/Contact.jsx'
import QuoteCTA from '../components/quote/QuoteCTA.jsx'

const page = findPage('/contact')

export default function ContactPage() {
  return (
    <>
      <Seo page={page} />
      <Breadcrumbs crumbs={page.crumbs} />
      <ContactSection h1 />
      <QuoteCTA />
    </>
  )
}
