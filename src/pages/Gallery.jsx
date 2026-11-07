import Seo from '../layout/Seo.jsx'
import Breadcrumbs from '../components/ui/Breadcrumbs.jsx'
import { findPage } from '../routes.js'
import GallerySection from '../components/gallery/Gallery.jsx'

const page = findPage('/gallery')

export default function GalleryPage() {
  return (
    <>
      <Seo page={page} />
      <Breadcrumbs crumbs={page.crumbs} />
      <GallerySection h1 />
    </>
  )
}
