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

WebPDecodeAndDraw = function (data) {
  var decoder = new WebPDecoder()

  var bitmap = decoder.WebPDecode(data, data.length)

  if (bitmap) {
    //Draw Image
    var output = ctx.createImageData(canvas.width, canvas.height)
    var biWidth = canvas.width
    var outputData = output.data
    for (var h = 0; h < canvas.height; h++) {
      for (var w = 0; w < canvas.width; w++) {
        outputData[0 + w * 4 + biWidth * 4 * h] =
          bitmap[0 + w * 4 + biWidth * 4 * h]
        outputData[1 + w * 4 + biWidth * 4 * h] =
          bitmap[1 + w * 4 + biWidth * 4 * h]
        outputData[2 + w * 4 + biWidth * 4 * h] =
          bitmap[2 + w * 4 + biWidth * 4 * h]
        outputData[3 + w * 4 + biWidth * 4 * h] =
          bitmap[3 + w * 4 + biWidth * 4 * h]
      }
    }

    ctx.putImageData(output, 0, 0)

    var dataURL = canvas.toDataURL('image/png')

    document.getElementById('dec').src = dataURL
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

  WebPDecodeAndDraw(
    ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)['data']
  )
}
