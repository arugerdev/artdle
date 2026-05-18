/* eslint-disable no-undef */
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

function escapeHTML (s = '') {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export default async function handler (req, res) {
  dotenv.config()

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
  )

  const drawId = req.query.id

  if (!drawId) {
    return res.status(400).json({ error: 'Bad request: missing id' })
  }

  const { data, error } = await supabase
    .from('draws_with_meta')
    .select('id, name, day, created_at, daily_word, creator_username')
    .eq('id', drawId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return res.status(404).send('Dibujo no encontrado')
    }
    console.error(error)
    return res.status(500).send('Internal server error')
  }

  const drawPageUrl = `https://artdle.com/draw?id=${encodeURIComponent(drawId)}`
  const imageUrl = `https://artdle.com/api/img?id=${encodeURIComponent(drawId)}`

  const title = escapeHTML(`${data.name} — Artdle`)
  const word = data.daily_word ? `Palabra del día: ${data.daily_word}` : ''
  const author = data.creator_username
    ? ` por ${data.creator_username}`
    : ''
  const description = escapeHTML(
    `${data.name}${author} en Artdle. ${word}`.trim()
  )

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
<link rel="canonical" href="${drawPageUrl}" />
<meta name="description" content="${description}" />

<meta property="og:type" content="article" />
<meta property="og:site_name" content="Artdle" />
<meta property="og:url" content="${drawPageUrl}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:image" content="${imageUrl}" />
<meta property="og:image:alt" content="${escapeHTML(data.name)}" />
<meta property="og:image:width" content="960" />
<meta property="og:image:height" content="540" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />
<meta name="twitter:image" content="${imageUrl}" />

<meta http-equiv="refresh" content="0;url=${drawPageUrl}" />
</head>
<body>
<p>Redirigiendo a <a href="${drawPageUrl}">${drawPageUrl}</a>…</p>
<script>window.location.replace(${JSON.stringify(drawPageUrl)})</script>
</body>
</html>`

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=3600')
  res.status(200).send(html)
}

export const config = {
  edge: {
    includeFiles: './index.html'
  }
}
