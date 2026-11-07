import Seo from '../layout/Seo.jsx'
import Breadcrumbs from '../components/ui/Breadcrumbs.jsx'
import { findPage } from '../routes.js'
import Process from '../components/process/Process.jsx'
import Capability from '../components/capability/Capability.jsx'
import GearDivider from '../components/ui/GearDivider.jsx'

const page = findPage('/manufacturing')

export default function Manufacturing() {
  return (
    <>
      <Seo page={page} />
      <Breadcrumbs crumbs={page.crumbs} />
      <Process h1 />
      <GearDivider />
      <Capability />
    </>
  )
}
