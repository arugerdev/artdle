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

  const { data, error } = await supabase
    .from('draws')
    .select('*')
    .eq('id', drawId)
    .single()

  if (error) {
    console.error(error)
    return res.status(500).json({ error: 'Internal server error' })
  }

  const response = await fetch('https://artdle.com/index.html')
  let html = await response.text()

  html = html
    .replace(/__META_TITLE__/g, data.name)
    .replace(/__META_DESCRIPTION__/g, data.created_at)
    .replace(/__META_OG_TITLE__/g, data.name)
    .replace(/__META_OG_DESCRIPTION__/g, data.created_at)
    .replace(/__META_OG_IMAGE__/g, `https://artdle.com/api/img?id=${drawId}`)
    .replace(/__META_TW_TITLE__/g, data.name)
    .replace(/__META_TW_DESCRIPTION__/g, data.created_at)
    .replace(/__META_TW_IMAGE__/g, `https://artdle.com/api/img?id=${drawId}`)

  res.setHeader('Content-Type', 'text/html')

  res.send(html)
  return res.status(200)
}

export const config = {
  edge: {
    includeFiles: './index.html'
  }
}
