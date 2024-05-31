/* eslint-disable no-undef */
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { ImageResponse } from '@vercel/og'

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

  // try {
  //   const base64Data = data.uridata.replace(/^data:image\/png;base64,/, '')

  //   const imageBuffer = Buffer.from(base64Data, 'base64')

  //   res.setHeader('Content-Type', 'image/jpg')
  //   res.send(imageBuffer)
  //   return res.status(200)
  // } catch (fetchError) {
  //   console.error(fetchError)
  //   return res.status(500).json({ error: 'Failed to fetch image' })
  // }
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 40,
          color: 'black',
          fontWeight: 900,
          background: 'white',
          width: '100%',
          height: '100%',
          padding: '50px 200px',
          textAlign: 'center',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <img src={data.uridata} />
        <p>{data.name}</p>
      </div>
    ),
    {
      width: 1200,
      height: 630
    }
  )
}

export const config = {
  edge: {
    includeFiles: './index.html'
  }
}
