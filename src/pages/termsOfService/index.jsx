import { Topbar } from '../../components/topbar/index'

export default function TermsOfServicePage () {
  return (
    <main className='flex flex-col gap-8 justify-start items-center h-full w-full min-w-screen min-h-screen'>
      <Topbar />
      <section className='flex flex-col p-4 max-w-prose items-center justify-center gap-2 text-justify'>
        <div className='p-6 bg-white shadow-md rounded-md'>
          <h1 className='text-2xl font-bold mb-4'>Condiciones de Servicio</h1>
          <p className='text-gray-600'>
            Última actualización: 29/05/2024 17:40
          </p>

          <section className='mt-6'>
            <h2 className='text-xl font-semibold'>1. Uso del Servicio</h2>
            <ul className='list-disc list-inside ml-4 mt-2 text-gray-700'>
              <li>
                <span className='font-semibold'>Registro y Acceso:</span> Para
                utilizar Artdle, debes registrarte e iniciar sesión mediante tu
                cuenta de Google, proporcionando tu correo electrónico, imagen
                de perfil y nombre de usuario.
              </li>
              <li>
                <span className='font-semibold'>Creación de Contenido:</span>{' '}
                Puedes crear y subir dibujos relacionados con la palabra diaria
                generada aleatoriamente.
              </li>
              <li>
                <span className='font-semibold'>Interacciones:</span> Puedes
                votar (dar likes) y reportar dibujos. Todos los likes son
                visibles en términos de cantidad, y los reportes son anónimos.
              </li>
            </ul>
          </section>

          <section className='mt-6'>
            <h2 className='text-xl font-semibold'>2. Conducta del Usuario</h2>
            <ul className='list-disc list-inside ml-4 mt-2 text-gray-700'>
              <li>
                <span className='font-semibold'>Responsabilidad:</span> Cada
                usuario es responsable de su propio uso de la plataforma. Debes
                actuar de manera respetuosa y no realizar acciones dañinas hacia
                otros usuarios o la comunidad.
              </li>
              <li>
                <span className='font-semibold'>Reportes y Abusos:</span> Si
                encuentras contenido inapropiado o abusivo, puedes reportarlo.
                Trabajamos para mantener un ambiente seguro, pero no podemos ser
                responsables de todos los actos individuales de los usuarios.
              </li>
            </ul>
          </section>

          <section className='mt-6'>
            <h2 className='text-xl font-semibold'>
              3. Limitaciones de Responsabilidad
            </h2>
            <ul className='list-disc list-inside ml-4 mt-2 text-gray-700'>
              <li>
                <span className='font-semibold'>
                  Disponibilidad del Servicio:
                </span>{' '}
                No garantizamos que el servicio estará siempre disponible o
                libre de errores. Hacemos nuestro mejor esfuerzo para mantener
                la plataforma operativa.
              </li>
              <li>
                <span className='font-semibold'>Contenido del Usuario:</span> No
                somos responsables del contenido generado por los usuarios. Si
                alguien encuentra y explota una vulnerabilidad, es
                responsabilidad del infractor notificar el problema y no
                utilizarlo de manera indebida.
              </li>
            </ul>
          </section>

          <section className='mt-6'>
            <h2 className='text-xl font-semibold'>
              4. Modificaciones al Servicio
            </h2>
            <p className='text-gray-700 mt-2'>
              Podemos modificar o descontinuar el servicio en cualquier momento
              sin previo aviso. Intentaremos notificar a los usuarios sobre
              cambios significativos.
            </p>
          </section>

          <section className='mt-6'>
            <h2 className='text-xl font-semibold'>
              5. Terminación del Servicio
            </h2>
            <p className='text-gray-700 mt-2'>
              Nos reservamos el derecho de suspender o terminar tu acceso a
              Artdle si violas estas condiciones de servicio o si consideramos
              que tu uso del servicio es perjudicial para otros usuarios o la
              comunidad.
            </p>
          </section>

          <section className='mt-6'>
            <h2 className='text-xl font-semibold'>6. Contacto</h2>
            <p className='text-gray-700 mt-2'>
              Para cualquier pregunta o preocupación sobre estas Condiciones de
              Servicio, puedes contactarnos a través de{' '}
              <a className='text-blue-600' href='mailto:aruger.dev@gmail.com'>
                aruger.dev@gmail.com
              </a>
            </p>
          </section>
        </div>
      </section>
    </main>
  )
}
