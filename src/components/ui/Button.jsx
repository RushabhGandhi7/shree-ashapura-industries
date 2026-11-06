import { useRef } from 'react'
import { useMagnetic } from '../../hooks/useMagnetic.js'

const base =
  'shine group/btn relative inline-flex items-center justify-center gap-2.5 rounded-xs font-sans font-semibold ' +
  'tracking-[0.01em] whitespace-nowrap select-none transition-[background-color,color,border-color,box-shadow] ' +
  'duration-300 ease-[var(--ease-out)] will-change-transform'

const variants = {
  primary:
    'bg-red text-paper hover:bg-red-deep active:bg-red-deep shadow-[0_1px_0_rgb(0_0_0/0.15),0_8px_24px_-12px_rgb(200_16_46/0.6)]',
  outline:
    'border border-ink text-ink bg-transparent hover:bg-ink hover:text-paper active:bg-ink active:text-paper',
  ghost: 'text-ink hover:text-red',
}

const sizes = {
  sm: 'h-10 px-4 text-small',
  md: 'h-12 px-6 text-body',
  lg: 'h-14 px-8 text-body-lg',
}

/**
 * Button / link with magnetic hover and metallic shine.
 * Renders <a> when `href` is given, otherwise <button>.
 */
export default function Button({
  href,
  variant = 'primary',
  size = 'md',
  magnetic = true,
  icon,
  className = '',
  children,
  ...rest
}) {
  const ref = useRef(null)
  useMagnetic(ref, { enabled: magnetic })

  const cls = `${base} ${variants[variant]} ${sizes[size]} ${className}`
  const inner = (
    <span data-magnetic-inner className="relative z-[2] inline-flex items-center gap-2.5">
      {icon}
      {children}
    </span>
  )

  if (href) {
    const external = /^https?:/.test(href)
    return (
      <a
        ref={ref}
        href={href}
        className={cls}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...rest}
      >
        {inner}
      </a>
    )
  }
  return (
    <button ref={ref} type="button" className={cls} {...rest}>
      {inner}
    </button>
  )
}
