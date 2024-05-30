import supabase from '../src/utils/supabase'

export default async function handler (req, res) {
  const { id } = req.query

  const { data, error } = await supabase
    .from('draws')
    .select()
    .eq('id', id)
    .single()

  if (error) {
    return res.status(404).json({ error: 'Not found' })
  }

  res.setHeader('Content-Type', 'text/html')
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta property="og:title" content="${data.name}">
      <meta property="og:description" content="${data.day}">
      <meta property="og:image" content="${data.uridata}">
      <meta property="twitter:card" content="summary_large_image">
      <meta property="twitter:title" content="${data.name}">
      <meta property="twitter:description" content="${data.day}">
      <meta property="twitter:image" content="${data.uridata}">
      <title>${data.name}</title>
    </head>
    <body>
      Loading...
    </body>
    </html>
  `)
}
