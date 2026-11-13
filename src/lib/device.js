const mq = (q) => typeof window !== 'undefined' && window.matchMedia?.(q).matches

export const prefersReducedMotion = () => !!mq('(prefers-reduced-motion: reduce)')

/** True on devices with a precise pointer that can hover (desktop / laptop). */
export const hasFinePointer = () => !!mq('(hover: hover) and (pointer: fine)')

export const isTouch = () => !hasFinePointer()

/**
 * Heuristic for low-end hardware (mid-range Android and below).
 * Used later to pick reduced 3D or static fallbacks.
 */
export const isLowEnd = () => {
  if (typeof navigator === 'undefined') return false
  const cores = navigator.hardwareConcurrency || 4
  const mem = navigator.deviceMemory || 4
  const saveData = navigator.connection?.saveData
  return saveData || cores <= 4 || mem <= 3
}

export const isSmallScreen = () => !!mq('(max-width: 767px)')

/** Phones narrower than 640 px: the only screens that get reduced 3D detail. */
export const isTinyScreen = () => !!mq('(max-width: 639px)')

/** Low-end phone: a tiny screen on low-end hardware (the one case that trades sharpness). */
export const isLowEndPhone = () => isTinyScreen() && isLowEnd()

/** Highest DPR a WebGL canvas may use: the screen's own, up to 2 (1.5 on low-end phones). */
export const maxDpr = () => Math.min(typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1, isLowEndPhone() ? 1.5 : 2)

/** DPR range for R3F canvases: [1, min(devicePixelRatio, 2)]; 1.5 cap on low-end phones. */
export const dprCap = () => [1, maxDpr()]

/** MSAA for WebGL canvases: on everywhere except low-end phones. */
export const glAntialias = () => !isLowEndPhone()

/** Geometry detail for 3D parts: full detail except on screens under 640 px. */
export const partDetail = () => (isTinyScreen() ? 'low' : 'high')

// Probed once per page load: each probe creates a real WebGL context, and Safari warns
// (then drops the oldest context) when too many have been created.
let webgl
export const hasWebGL = () => {
  if (webgl !== undefined) return webgl
  try {
    const c = document.createElement('canvas')
    const gl = c.getContext('webgl2') || c.getContext('webgl')
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
    webgl = !!gl
  } catch {
    webgl = false
  }
  return webgl
}
