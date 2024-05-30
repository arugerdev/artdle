import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

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
    <html lang="en">
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
      <div id="root"></div>
      <script>
        window.__INITIAL_DATA__ = ${JSON.stringify(data)};
      </script>
      <script type="module" src="/assets/index.js"></script>
    </body>
    </html>
  `)
}
