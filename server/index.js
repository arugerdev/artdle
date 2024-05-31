/* eslint-disable no-undef */
import express from 'express'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

const app = express()
const PORT = process.env.PORT || 3000

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(
  express.static(path.resolve(__dirname, '..', 'dist'), { maxAge: '30d' })
)

const indexPath = path.resolve(__dirname, '..', 'dist', 'index.html')

app.get('/draw/*', (req, res) => {
  fs.readFile(indexPath, 'utf8', (err, htmlData) => {
    if (err) {
      console.error('Error during file reading', err)
      return res.status(404).end()
    }
    const drawId = req.params[0]
    supabase
      .from('draws')
      .select('*')
      .eq('id', drawId)
      .then(data => {
        if (!data.data[0]) {
          htmlData = htmlData
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
          return res.send(htmlData)
        }

        htmlData = htmlData
          .replace('__META_TITLE__', data.data[0].name)
          .replace('__META_DESCRIPTION__', data.data[0].created_at)
          .replace('__META_OG_TITLE__', data.data[0].name)
          .replace('__META_OG_DESCRIPTION__', data.data[0].created_at)
          .replace('__META_OG_IMAGE__', data.data[0].uridata)
          .replace('__META_TW_TITLE__', data.data[0].name)
          .replace('__META_TW_DESCRIPTION__', data.data[0].created_at)
          .replace('__META_TW_IMAGE__', data.data[0].uridata)
        return res.send(htmlData)
      })
      .catch(err => {
        console.log(err)
      })
  })
})
app.get('*', (req, res) => {
  fs.readFile(indexPath, 'utf8', (err, htmlData) => {
    if (err) {
      console.error('Error during file reading', err)
      return res.status(404).end()
    }
    return res.send(
      htmlData
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
    )
  })
})

app.listen(PORT, error => {
  if (error) {
    return console.log('Error during app startup', error)
  }
  console.log('listening on ' + PORT + '...')
})
