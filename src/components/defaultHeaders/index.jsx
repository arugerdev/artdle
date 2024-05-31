import { Helmet } from 'react-helmet'

export const DefaultHeaders = () => {
  return (
    <Helmet>
      <title>Artdle - Un dibujo al día</title>
      <meta
        name='description'
        property='description'
        content='¿Cuál será la palabra de hoy? Entra ahora en Artdle.com, descubrelo y dibuja!'
      />
      <meta
        name='og:title'
        property='og:title'
        content='Artdle - Un dibujo al día'
      />
      <meta
        name='og:description'
        property='og:description'
        content='¿Cuál será la palabra de hoy? Entra ahora en Artdle.com, descubrelo y dibuja!'
      />
      <meta name='og:image' property='og:image' content='/icon.png' />
      <meta
        name='twitter:card'
        property='twitter:card'
        content='summary_large_image'
      />
      <meta
        name='twitter:title'
        property='twitter:title'
        content='Artdle - Un dibujo al día'
      />
      <meta
        name='twitter:description'
        property='twitter:description'
        content='¿Cuál será la palabra de hoy? Entra ahora en Artdle.com, descubrelo y dibuja!'
      />
      <meta name='twitter:image' property='twitter:image' content='/icon.png' />
    </Helmet>
  )
}
