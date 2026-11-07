import Seo from '../layout/Seo.jsx'
import { findPage } from '../routes.js'
import { SHOW_CUSTOMERS, content } from '../data/content.js'
import Hero from '../components/hero/Hero.jsx'
import ProductsTeaser from '../components/products/ProductsTeaser.jsx'
import Exploded from '../components/exploded/Exploded.jsx'
import Capability from '../components/capability/Capability.jsx'
import QualityTeaser from '../components/quality/QualityTeaser.jsx'
import Customers from '../components/industries/Customers.jsx'
import QuoteCTA from '../components/quote/QuoteCTA.jsx'
import GearDivider from '../components/ui/GearDivider.jsx'

export default function Home() {
  return (
    <>
      <Seo page={findPage('/')} />
      <Hero />
      <ProductsTeaser />
      <GearDivider />
      <Exploded />
      <Capability teaser />
      <QualityTeaser />
      {SHOW_CUSTOMERS && (
        <div className="container-x pb-16">
          <Customers title={content.industries.customersTitle} more={content.industries.customersMore} />
        </div>
      )}
      <QuoteCTA />
    </>
  )
}
