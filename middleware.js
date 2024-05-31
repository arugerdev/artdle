import { createClient } from '@supabase/supabase-js'
import path from 'path'
import { fs } from 'fs'

// dotenv.config()

export default function handler (request, context) {
  const __filename = import.meta.url
  const __dirname = path.dirname(__filename)
  const indexPath = path.resolve(__dirname, 'dist', 'index.html')
  fs.readFileSync(indexPath, 'utf8', (err, htmlData) => {
    const drawId = request.url.split('/')[1]

    context.waitUntil(
      getDraw(drawId)
        .then(data => {
          if (!data) {
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
            return new Response(updatedHtml)
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

          return new Response(updatedHtml)
        })
        .catch(() => {
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
          return new Response(updatedHtml)
        })
    )
  })
}

export const config = {
  matcher: '/draw/:id*'
}

const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

async function getDraw (drawId) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY
  const supabase = createClient(supabaseUrl, supabaseKey)

  const { data, error } = await supabase
    .from('draws')
    .select('*')
    .eq('id', drawId)
  await wait(10000)
  if (error) throw error
  return data
}
