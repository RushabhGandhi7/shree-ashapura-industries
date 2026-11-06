/** Small engineering callout tag, e.g. "M8 × 1.25", "Ø12", "L 40". */
export default function MonoLabel({ children, tone = 'steel', dot = false, className = '', as: Tag = 'span' }) {
  const tones = {
    steel: 'text-steel-700 border-steel-300',
    red: 'text-red border-red/40',
    ink: 'text-ink border-ink/30',
  }
  return (
    <Tag
      className={`label-mono inline-flex items-center gap-2 rounded-xs border bg-paper/80 px-2 py-1 ${tones[tone]} ${className}`}
    >
      {dot && <span className="size-1.5 rounded-full bg-red" aria-hidden />}
      {children}
    </Tag>
  )
}
