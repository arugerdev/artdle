/* eslint-disable no-undef */
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

export default async function handler (req, res) {
  dotenv.config()

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
  )

  const drawId = req.query.id

  if (!drawId) {
    return res.status(404).json({ error: 'Bad request' })
  }
  // ENVIAR IMAGEN DIRECTAMENTE
  const { data, error } = await supabase
    .from('draws')
    .select('*')
    .eq('id', drawId)
    .single()

  if (error) {
    console.error(error)
    return res.status(500).json({ error: 'Internal server error' })
  }

  res.setHeader('Content-Type', 'text/html')

  res.send(getImage(data.uridata))
  return res.status(200)
}

export const config = {
  edge: {
    includeFiles: './index.html'
  }
}

function getImage (img) {
  // Create an empty canvas element
  canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height

  // Copy the image contents to the canvas
  ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0)
  return canvas.toDataURL('image/png')
}