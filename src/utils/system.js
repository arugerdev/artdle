// SSR-safe environment + capability detection.
// Public API kept stable so existing callers don't need updates.

const safeWindow = typeof window !== 'undefined' ? window : null
const safeNavigator = typeof navigator !== 'undefined' ? navigator : null

export function isMacOs () {
  if (!safeNavigator) return false
  const uaPlatform = safeNavigator.userAgentData?.platform
  if (uaPlatform) return /mac/i.test(uaPlatform)
  return /Mac|iPod|iPhone|iPad/.test(safeNavigator.platform || '')
}

// "Mobile" here means: primary pointer is coarse (touch). This is
// a better proxy than the legacy userAgent regex — covers Surface
// tablets, Chromebooks in tablet mode, etc., and correctly excludes
// iPads paired with a mouse.
export function isMobile () {
  if (!safeWindow?.matchMedia) return false
  return safeWindow.matchMedia('(pointer: coarse)').matches
}
