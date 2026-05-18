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

// Same as the above but for a vanilla HTMLCanvasElement.
export function canvasToCompressedDataURL (canvas, { quality = 0.9 } = {}) {
  if (canUseWebP()) return canvas.toDataURL('image/webp', quality)
  return canvas.toDataURL()
}

// Extracts { mime, base64 } from a data URL like
// "data:image/webp;base64,AAAA..."
export function parseDataURL (uri = '') {
  const match = /^data:([^;]+);base64,(.*)$/i.exec(uri)
  if (!match) return { mime: 'image/png', base64: uri }
  return { mime: match[1], base64: match[2] }
}

// Build a Blob from a base64 data URL — needed when uploading to Storage.
export function dataURLToBlob (uri) {
  const { mime, base64 } = parseDataURL(uri)
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type: mime })
}

// Public URL builder. Imported here instead of in the supabase util so this
// module stays usable from edge/server contexts that don't have the client.
export function buildStorageURL (supabaseUrl, bucket, path) {
  if (!supabaseUrl || !bucket || !path) return null
  const base = supabaseUrl.replace(/\/$/, '')
  return `${base}/storage/v1/object/public/${bucket}/${path}`
}

// Resolve the renderable image src for a draw row (joined or legacy).
export function resolveDrawImage (data, { supabaseUrl } = {}) {
  if (!data) return null
  if (data.storage_path) {
    return buildStorageURL(supabaseUrl, 'draws', data.storage_path)
  }
  return data.uridata ?? null
}
