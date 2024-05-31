export const config = {
  runtime: 'edge'
}

export default function handler (req) {
  console.log(req)
  return new Response('Hello World')
}
