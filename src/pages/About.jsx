import Seo from '../layout/Seo.jsx'
import Breadcrumbs from '../components/ui/Breadcrumbs.jsx'
import { findPage } from '../routes.js'
import AboutStory from '../components/about/AboutStory.jsx'
import Industries from '../components/industries/Industries.jsx'
import Timeline from '../components/about/Timeline.jsx'

const page = findPage('/about')

export default function About() {
  return (
    <>
      <Seo page={page} />
      <Breadcrumbs crumbs={page.crumbs} />
      <AboutStory />
      <Timeline />
      <Industries />
    </>
  )
}
