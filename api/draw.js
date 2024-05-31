/* eslint-disable no-undef */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default async function handler (req, res) {
  const indexPath = path.resolve(__dirname, '..', 'dist', 'index.html')
  const htmlData = readFileSync(indexPath, 'utf8')

  const drawId = req.query.id

  try {
    const { data, error } = await supabase
      .from('draws')
      .select('*')
      .eq('id', drawId)

    if (error) {
      console.error('Error fetching data from Supabase:', error)
      return res.status(500).end('Internal Server Error')
    }

    if (!data || data.length === 0) {
      const updatedHtml = htmlData
        .replace('__META_TITLE__', 'Artdle - Un dibujo al día')
        .replace(
          '__META_DESCRIPTION__',
          '¿Cuál será la palabra de hoy? Entra ahora en Artdle.com, descubrelo y dibuja!'
        )
        .replace('__META_OG_TITLE__', 'Artdle - Un dibujo al día')
        .replace(
          '__META_OG_DESCRIPTION__',
          '¿Cuál será la palabra de hoy? Entra ahora en Artdle.com, descubrelo y dibuja!'
        )
        .replace('__META_OG_IMAGE__', '/icon.png')
        .replace('__META_TW_TITLE__', 'Artdle - Un dibujo al día')
        .replace(
          '__META_TW_DESCRIPTION__',
          '¿Cuál será la palabra de hoy? Entra ahora en Artdle.com, descubrelo y dibuja!'
        )
        .replace('__META_TW_IMAGE__', '/icon.png')

      return res.status(200).send(updatedHtml)
    }

    const draw = data[0]
    const updatedHtml = htmlData
      .replace('__META_TITLE__', draw.name)
      .replace('__META_DESCRIPTION__', draw.created_at)
      .replace('__META_OG_TITLE__', draw.name)
      .replace('__META_OG_DESCRIPTION__', draw.created_at)
      .replace('__META_OG_IMAGE__', draw.uridata)
      .replace('__META_TW_TITLE__', draw.name)
      .replace('__META_TW_DESCRIPTION__', draw.created_at)
      .replace('__META_TW_IMAGE__', draw.uridata)

    return res.status(200).send(updatedHtml)
  } catch (err) {
    console.error('Error processing request:', err)
    return res.status(500).end('Internal Server Error')
  }
}
