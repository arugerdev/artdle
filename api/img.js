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

  try {
    const imageBuffer = Buffer.from(data.uridata, 'base64')

    res.setHeader('Content-Type', 'image/png')
    res.send(imageBuffer)
    return res.status(200)
  } catch (fetchError) {
    console.error(fetchError)
    return res.status(500).json({ error: 'Failed to fetch image' })
  }
}

export const config = {
  edge: {
    includeFiles: './index.html'
  }
}
