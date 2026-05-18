// SVG export.
//
// The old version walked the path list and emitted <path>/<rect>/<line>
// elements per stroke, then skipped bucket fills entirely — meaning the
// downloaded SVG never matched what was on screen. Now we just embed the
// finished canvas (which already has all bucket fills baked in) as a
// base64 PNG inside an <image> element. The result is a valid SVG that
// renders exactly what the user sees, scales cleanly in any viewer, and
// stays one file.

const WIDTH = 960
const HEIGHT = 540

export function canvasToSVG (canvas, { width = WIDTH, height = HEIGHT } = {}) {
  const dataUrl = canvas.toDataURL('image/png')
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <image href="${dataUrl}" width="${width}" height="${height}" />
</svg>`
}

export function downloadSVG (canvasOrLines, filename = 'drawing.svg', opts) {
  // Back-compat: callers used to pass `lines`. Detect a canvas element
  // and fall back to a minimal embed-of-blank-canvas otherwise.
  let svg
  if (canvasOrLines && typeof canvasOrLines === 'object' && 'toDataURL' in canvasOrLines) {
    svg = canvasToSVG(canvasOrLines, opts)
  } else {
    // Lines-array input — render to an offscreen canvas first.
    const c = document.createElement('canvas')
    c.width = WIDTH
    c.height = HEIGHT
    const ctx = c.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, WIDTH, HEIGHT)
    // Lazy import to avoid a cycle (canvasRender imports from this if extended).
    import('./canvasRender.js').then(({ paintScene }) => {
      paintScene(ctx, canvasOrLines ?? [])
      svg = canvasToSVG(c, opts)
      const blob = new Blob([svg], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    })
    return
  }
  const blob = new Blob([svg], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
