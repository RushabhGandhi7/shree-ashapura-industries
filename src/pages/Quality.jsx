import Seo from '../layout/Seo.jsx'
import Breadcrumbs from '../components/ui/Breadcrumbs.jsx'
import { findPage } from '../routes.js'
import QualitySection from '../components/quality/Quality.jsx'

const page = findPage('/quality')

export default function QualityPage() {
  return (
    <>
      <Seo page={page} />
      <Breadcrumbs crumbs={page.crumbs} />
      <QualitySection h1 />
    </>
  )
}
