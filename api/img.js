/* eslint-disable no-undef */
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

const MIME_BY_PREFIX = {
  'data:image/png;base64,': 'image/png',
  'data:image/webp;base64,': 'image/webp',
  'data:image/jpeg;base64,': 'image/jpeg',
  'data:image/gif;base64,': 'image/gif'
}

function extractImage (uridata = '') {
  for (const [prefix, mime] of Object.entries(MIME_BY_PREFIX)) {
    if (uridata.startsWith(prefix)) {
      return { mime, base64: uridata.slice(prefix.length) }
    }
  }
  const stripped = uridata.replace(/^data:[^;]+;base64,/, '')
  return { mime: 'image/png', base64: stripped }
}

export default async function handler (req, res) {
  dotenv.config()

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabase = createClient(
    supabaseUrl,
    process.env.VITE_SUPABASE_ANON_KEY
  )

  const drawId = req.query.id

  if (!drawId) {
    return res.status(400).json({ error: 'Bad request: missing id' })
  }

  const { data, error } = await supabase
    .from('draws')
    .select('uridata, storage_path')
    .eq('id', drawId)
    .single()

  if (error) {
    console.error(error)
    return res.status(error.code === 'PGRST116' ? 404 : 500).json({
      error: error.code === 'PGRST116' ? 'Not found' : 'Internal server error'
    })
  }

  // New rows: object lives in Storage. Cheapest path — redirect to the
  // public CDN URL, which is already cached and faster than re-proxying.
  if (data.storage_path) {
    const base = supabaseUrl.replace(/\/$/, '')
    const url = `${base}/storage/v1/object/public/draws/${data.storage_path}`
    res.setHeader('Cache-Control', 'public, max-age=86400, immutable')
    res.setHeader('Location', url)
    res.status(302).end()
    return
  }

  // Legacy rows: image lives base64-inline on the row.
  if (!data.uridata) {
    return res.status(404).json({ error: 'No image data' })
  }

  try {
    const { mime, base64 } = extractImage(data.uridata)
    const buffer = Buffer.from(base64, 'base64')
    res.setHeader('Content-Type', mime)
    res.setHeader('Cache-Control', 'public, max-age=86400, immutable')
    res.status(200).send(buffer)
    return
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Failed to decode image' })
  }
}

export const config = {
  edge: {
    includeFiles: './index.html'
  }
}
