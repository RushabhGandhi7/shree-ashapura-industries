import { MARK } from './logoMark.js'

/**
 * The client's logo mark, inlined from the master file (public/brand/sa-logo.svg via
 * logoMark.js) with its original colours: never recoloured or redrawn. Light backgrounds only.
 * Clear space: padding equal to the red dot's diameter on every side.
 */
export function LogoMark({ className = '', title }) {
  return (
    <span
      className={`inline-block shrink-0 ${className}`}
      style={{ padding: `calc(var(--logo-h) * ${MARK.clearSpace})` }}
    >
      <svg
        viewBox={MARK.viewBox}
        style={{ height: 'var(--logo-h)', width: 'auto', display: 'block' }}
        role={title ? 'img' : undefined}
        aria-label={title}
        aria-hidden={title ? undefined : true}
        focusable="false"
        shapeRendering="geometricPrecision"
      >
        <path d={MARK.d} fill={MARK.ink} />
        <circle cx={MARK.dot.cx} cy={MARK.dot.cy} r={MARK.dot.r} fill={MARK.dot.fill} />
      </svg>
    </span>
  )
}

/**
 * Brand lockup: mark + "Shree Ashapura Industries" wordmark.
 * size: 'nav' (36 px mark on phones, 40 px from sm), 'footer' (48 px).
 * The mark's own clear space doubles as the gap to the text; on the left it sits in the page gutter.
 */
export default function Logo({ compact = false, size = 'nav', className = '' }) {
  const h = size === 'footer' ? '[--logo-h:3rem]' : '[--logo-h:2.25rem] sm:[--logo-h:2.5rem]'
  return (
    <span className={`inline-flex items-center ${h} ${className}`}>
      <LogoMark className="-ml-[calc(var(--logo-h)*0.176)]" />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-[0.85rem] font-[780] tracking-[-0.01em] whitespace-nowrap [font-stretch:120%] min-[380px]:text-[0.95rem]">
            SHREE ASHAPURA
          </span>
          <span className="label-mono mt-1 text-[0.6rem] text-steel-700">Industries · Mumbai</span>
        </span>
      )}
    </span>
  )
}
