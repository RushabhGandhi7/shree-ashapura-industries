/**
 * Shared section header: mono label, title, and an optional right-hand column (lead text,
 * a CTA, a seal…). The right column sits on the title's last baseline, and the header is
 * always one `--spacing-head` (48 px) above the section content.
 */
export default function SectionHead({ id, as: H = 'h2', label, title, titleClassName = 'text-h2 max-w-[16ch]', aside, asideClassName = '', className = '' }) {
  return (
    <div className={`mb-head grid gap-6 md:grid-cols-12 md:items-baseline-last ${className}`}>
      <div className="md:col-span-7">
        {label && (
          <p className="label-mono mb-6 flex items-center gap-3 text-steel-700">
            <span className="h-px w-8 bg-red" aria-hidden />
            {label}
          </p>
        )}
        <H id={id} className={titleClassName}>
          {title}
        </H>
      </div>
      {aside && <div className={`text-steel-700 md:col-span-5 ${asideClassName}`}>{aside}</div>}
    </div>
  )
}
