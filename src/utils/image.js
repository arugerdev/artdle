// Image format helpers used by the Drawer and api/img endpoint.

let _webpSupport = null

export function canUseWebP () {
  if (_webpSupport !== null) return _webpSupport
  try {
    const c = document.createElement('canvas')
    c.width = 1
    c.height = 1
    _webpSupport = c.toDataURL('image/webp').startsWith('data:image/webp')
  } catch {
    _webpSupport = false
  }
  return _webpSupport
}

// Returns a compressed data URL from a Konva stage, choosing WebP when
// the browser supports it. WebP at quality 0.9 is typically 3-5× smaller
// than PNG for canvas drawings and still visually lossless for line art.
export function stageToCompressedDataURL (stage, { quality = 0.9 } = {}) {
  if (canUseWebP()) {
    return stage.toDataURL({ mimeType: 'image/webp', quality })
  }
  return stage.toDataURL()
}

// Extracts { mime, base64 } from a data URL like
// "data:image/webp;base64,AAAA..."
export function parseDataURL (uri = '') {
  const match = /^data:([^;]+);base64,(.*)$/i.exec(uri)
  if (!match) return { mime: 'image/png', base64: uri }
  return { mime: match[1], base64: match[2] }
}
