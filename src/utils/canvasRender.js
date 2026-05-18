// Pure rendering helpers — given a Canvas2D context and a "path" record
// (the same shape we persist for timelapse), draw the stroke. Used by:
//   - The live overlay canvas (mid-stroke preview)
//   - The committed canvas (on pointer-up commit + on undo replay)
//   - The replay modal (animated playback)

import { TOOLS } from './tools'
import { floodFill, hexToRgb } from './floodFill'

/**
 * Draw a path onto a Canvas2D context.
 * Idempotent — caller is responsible for clearing/erasing first if needed.
 */
export function strokePath (ctx, path) {
  if (!path) return
  ctx.save()
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.lineWidth = path.strokeWidth ?? 1
  ctx.strokeStyle = path.stroke ?? '#000'
  ctx.fillStyle = path.stroke ?? '#000'

  if (path.tool === TOOLS.ERASER) {
    ctx.globalCompositeOperation = 'destination-out'
    // Source colour doesn't matter once we punch through alpha.
    ctx.strokeStyle = 'rgba(0,0,0,1)'
  }

  if (path.tool === TOOLS.RECT && path.points && path.points.length >= 4) {
    const [x1, y1, x2, y2] = path.points
    ctx.strokeRect(
      Math.min(x1, x2),
      Math.min(y1, y2),
      Math.abs(x2 - x1),
      Math.abs(y2 - y1)
    )
  } else if (path.tool === TOOLS.LINE && path.points && path.points.length >= 4) {
    const [x1, y1, x2, y2] = path.points
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  } else if (path.tool === TOOLS.BUCKET) {
    // Bucket is replayed via on-demand flood fill so we don't have to
    // store a full-canvas dataURL per fill. ctx.canvas may be the live
    // overlay (transparent) — in that case we apply directly to the
    // committed canvas via the caller; here we just no-op.
    ctx.restore()
    return
  } else {
    // PENCIL or ERASER freehand
    const pts = path.points ?? []
    if (pts.length < 2) {
      ctx.restore()
      return
    }
    if (pts.length === 2) {
      // single tap → tiny dot
      ctx.beginPath()
      ctx.arc(pts[0], pts[1], Math.max(0.5, ctx.lineWidth / 2), 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
      return
    }
    ctx.beginPath()
    ctx.moveTo(pts[0], pts[1])
    for (let i = 2; i < pts.length; i += 2) {
      ctx.lineTo(pts[i], pts[i + 1])
    }
    ctx.stroke()
  }
  ctx.restore()
}

/**
 * Apply a bucket-fill path to a Canvas2D context using floodFill.
 * Reads ImageData, fills in place, writes back. Slow if the region is
 * huge — but proportional to filled-pixel-count, not stack-depth.
 *
 * Important: the canvas backing this context MUST be the canvas you
 * want filled, not an overlay. Bucket cannot live on a transparent
 * preview layer because flood-fill needs the underlying pixels.
 */
export function applyBucket (ctx, path) {
  if (!path || path.tool !== TOOLS.BUCKET) return
  const canvas = ctx.canvas
  const x = Math.floor(path.x ?? 0)
  const y = Math.floor(path.y ?? 0)
  if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) return
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  if (!floodFill(imageData, x, y, path.stroke ?? '#000')) return
  ctx.putImageData(imageData, 0, 0)
}

/**
 * Apply every path in order onto a fresh canvas. Used to rebuild the
 * committed canvas after undo / clear, and to render a draw row.
 *
 *  - background: solid colour (default '#ffffff') painted first
 *  - paths:      array of path records in chronological order
 */
export function paintScene (ctx, paths, { background = '#ffffff' } = {}) {
  const { canvas } = ctx
  ctx.save()
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  if (background) {
    ctx.fillStyle = background
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }
  ctx.restore()
  for (const p of paths) {
    if (!p) continue
    if (p.tool === TOOLS.BUCKET) {
      applyBucket(ctx, p)
    } else {
      strokePath(ctx, p)
    }
  }
}

/**
 * Sample the colour of a pixel at logical (x, y) and return "#rrggbb".
 * Useful for the eyedropper tool.
 */
export function sampleColor (ctx, x, y) {
  const data = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data
  const toHex = n => n.toString(16).padStart(2, '0')
  return `#${toHex(data[0])}${toHex(data[1])}${toHex(data[2])}`
}

export { hexToRgb }
