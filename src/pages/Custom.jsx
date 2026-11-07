import Seo from '../layout/Seo.jsx'
import Breadcrumbs from '../components/ui/Breadcrumbs.jsx'
import { findPage } from '../routes.js'
import Customiser from '../components/customise/Customiser.jsx'
import HowCustom from '../components/custom/HowCustom.jsx'
import QuoteCTA from '../components/quote/QuoteCTA.jsx'

const page = findPage('/custom')

export default function Custom() {
  return (
    <>
      <Seo page={page} />
      <Breadcrumbs crumbs={page.crumbs} />
      <Customiser h1 />
      <HowCustom />
      <QuoteCTA />
    </>
  )
}
