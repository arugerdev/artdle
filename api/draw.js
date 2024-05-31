/* eslint-disable no-undef */
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

export default async function handler (request) {
  dotenv.config()

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
  )

  const url = new URL(request.url)

  if (!url.pathname.startsWith('/draw/')) {
    return fetch(request)
  }

  const drawId = url.pathname.replace('/draw/', '')

  const { data, error } = await supabase
    .from('draws')
    .select('*')
    .eq('id', drawId)
    .single()

  if (error) {
    console.error(error)
    return new Response('Internal Server Error', { status: 500 })
  }

  const response = await fetch(new URL(request.url))
  let html = await response.text()

  html = html
    .replace(/__META_TITLE__/g, data.data[0].name)
    .replace(/__META_DESCRIPTION__/g, data.data[0].created_at)
    .replace(/__META_OG_TITLE__/g, data.data[0].name)
    .replace(/__META_OG_DESCRIPTION__/g, data.data[0].created_at)
    .replace(/__META_OG_IMAGE__/g, data.data[0].uridata)
    .replace(/__META_TW_TITLE__/g, data.data[0].name)
    .replace(/__META_TW_DESCRIPTION__/g, data.data[0].created_at)
    .replace(/__META_TW_IMAGE__/g, data.data[0].uridata)

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html'
    }
  })
}

export const config = {
  edge: {
    includeFiles: './index.html'
  }
}
