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

/** Cap devicePixelRatio for WebGL canvases: 1.5 on phones, 1.25 on low-end hardware. */
export const dprCap = () => (isLowEnd() ? [1, 1.25] : isSmallScreen() || isTouch() ? [1, 1.5] : [1, 1.75])

export const hasWebGL = () => {
  try {
    const c = document.createElement('canvas')
    const gl = c.getContext('webgl2') || c.getContext('webgl')
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
    return !!gl
  } catch {
    return false
  }
}
