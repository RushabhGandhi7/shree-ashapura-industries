import Seo from '../layout/Seo.jsx'
import Breadcrumbs from '../components/ui/Breadcrumbs.jsx'
import { findPage } from '../routes.js'
import ProductsSection from '../components/products/Products.jsx'
import QuoteCTA from '../components/quote/QuoteCTA.jsx'
import CatalogueIndex from '../components/products/CatalogueIndex.jsx'
import HeadTypes from '../components/products/HeadTypes.jsx'

const page = findPage('/products')

export default function ProductsPage() {
  return (
    <>
      <Seo page={page} />
      <Breadcrumbs crumbs={page.crumbs} />
      <ProductsSection h1 />
      <HeadTypes />
      <CatalogueIndex />
      <QuoteCTA />
    </>
  )
}
