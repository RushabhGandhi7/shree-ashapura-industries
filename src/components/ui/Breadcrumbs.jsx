import { Link } from 'react-router'
import { content } from '../../data/content.js'

/** Visible breadcrumb trail for inner pages (the JSON-LD version is in layout/Seo.jsx). */
export default function Breadcrumbs({ crumbs }) {
  const all = [{ name: content.pages.home_crumb, path: '/' }, ...crumbs]
  return (
    <nav aria-label="Breadcrumb" className="container-x relative z-10 pt-[calc(var(--header-h-max)+1.25rem)]">
      <ol className="label-mono flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-steel-500">
        {all.map((c, i) => (
          <li key={c.path} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden>/</span>}
            {i === all.length - 1 ? (
              <span aria-current="page" className="text-ink">
                {c.name}
              </span>
            ) : (
              <Link to={c.path} className="hover:text-red">
                {c.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
