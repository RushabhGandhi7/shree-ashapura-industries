/**
 * Semantic section wrapper: id anchor, container, optional blueprint grid,
 * and an optional mono section label ("03 / What we make").
 */
export default function Section({
  id,
  label,
  title,
  grid = false,
  tone = 'paper',
  className = '',
  containerClassName = '',
  children,
  ...rest
}) {
  const headingId = title && id ? `${id}-title` : undefined
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={`relative section-y ${tone === 'paper-2' ? 'bg-paper-2' : 'bg-paper'} ${className}`}
      {...rest}
    >
      {grid && <div className="bp-grid bp-grid-fade pointer-events-none absolute inset-0" aria-hidden />}
      <div className={`container-x relative ${containerClassName}`}>
        {label && (
          <p className="label-mono mb-6 flex items-center gap-3 text-steel-700">
            <span className="h-px w-8 bg-red" aria-hidden />
            {label}
          </p>
        )}
        {title && (
          <h2 id={headingId} className="text-h2 max-w-[18ch]">
            {title}
          </h2>
        )}
        {children}
      </div>
    </section>
  )
}
