// SVG export — build a vector representation of the strokes so the
// artwork can be downloaded losslessly. Bucket fills (raster dataURLs)
// are skipped, same as the timelapse replay.

import { TOOLS } from './tools'

function pointsToPath (points) {
  if (!points || points.length < 2) return ''
  const out = [`M ${points[0]} ${points[1]}`]
  for (let i = 2; i < points.length; i += 2) {
    out.push(`L ${points[i]} ${points[i + 1]}`)
  }
  return out.join(' ')
}

export function linesToSVG (lines, { width = 960, height = 540 } = {}) {
  const body = lines
    .filter(l => l.tool !== TOOLS.BUCKET && l.points)
    .map(l => {
      const isEraser = l.tool === TOOLS.ERASER
      const isShape = l.tool === TOOLS.RECT || l.tool === TOOLS.LINE
      const stroke = isEraser ? '#ffffff' : l.stroke
      const width = l.strokeWidth
      if (l.tool === TOOLS.RECT && l.points.length >= 4) {
        const [x1, y1, x2, y2] = l.points
        const x = Math.min(x1, x2)
        const y = Math.min(y1, y2)
        const w = Math.abs(x2 - x1)
        const h = Math.abs(y2 - y1)
        return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${stroke}" stroke-width="${width}" />`
      }
      if (l.tool === TOOLS.LINE && l.points.length >= 4) {
        const [x1, y1, x2, y2] = l.points
        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" />`
      }
      // PENCIL or ERASER freehand
      const d = pointsToPath(l.points)
      return `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" />`
    })
    .join('\n  ')

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <rect width="${width}" height="${height}" fill="white" />
  ${body}
</svg>`
}

export function downloadSVG (lines, filename = 'drawing.svg') {
  const svg = linesToSVG(lines)
  const blob = new Blob([svg], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
