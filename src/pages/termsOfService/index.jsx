import { Topbar } from '../../components/topbar/index'

// eslint-disable-next-line react/prop-types
const Section = ({ title, children }) => (
  <section className='mt-6'>
    <h2 className='text-base sm:text-lg font-semibold text-slate-900 dark:text-zinc-100'>{title}</h2>
    <div className='text-slate-600 dark:text-zinc-400 mt-2'>{children}</div>
  </section>
)

export default function TermsOfServicePage () {
  return (
    <main className='flex flex-col gap-6 justify-start items-center h-full w-full min-w-screen min-h-screen pb-12'>
      <Topbar />
      <section className='flex flex-col p-4 max-w-prose items-stretch justify-center gap-2 w-full'>
        <article className='ios-card p-6 sm:p-8 rounded-3xl'>
          <h1 className='text-2xl font-bold text-slate-900 dark:text-zinc-50'>Condiciones de Servicio</h1>
          <p className='text-xs font-mono text-slate-500 dark:text-zinc-500 mt-1'>
            Última actualización: 29/05/2024 17:40
          </p>

          <Section title='1. Uso del Servicio'>
            <ul className='list-disc list-inside ml-2 space-y-1.5'>
              <li><span className='font-semibold text-slate-900 dark:text-zinc-200'>Registro y Acceso:</span> Para utilizar Artdle, debes registrarte e iniciar sesión mediante tu cuenta de Google, proporcionando tu correo electrónico, imagen de perfil y nombre de usuario.</li>
              <li><span className='font-semibold text-slate-900 dark:text-zinc-200'>Creación de Contenido:</span> Puedes crear y subir dibujos relacionados con la palabra diaria generada aleatoriamente.</li>
              <li><span className='font-semibold text-slate-900 dark:text-zinc-200'>Interacciones:</span> Puedes votar (dar likes) y reportar dibujos. Todos los likes son visibles en términos de cantidad, y los reportes son anónimos.</li>
            </ul>
          </Section>

          <Section title='2. Conducta del Usuario'>
            <ul className='list-disc list-inside ml-2 space-y-1.5'>
              <li><span className='font-semibold text-slate-900 dark:text-zinc-200'>Responsabilidad:</span> Cada usuario es responsable de su propio uso de la plataforma. Debes actuar de manera respetuosa y no realizar acciones dañinas hacia otros usuarios o la comunidad.</li>
              <li><span className='font-semibold text-slate-900 dark:text-zinc-200'>Reportes y Abusos:</span> Si encuentras contenido inapropiado o abusivo, puedes reportarlo. Trabajamos para mantener un ambiente seguro, pero no podemos ser responsables de todos los actos individuales de los usuarios.</li>
            </ul>
          </Section>

          <Section title='3. Limitaciones de Responsabilidad'>
            <ul className='list-disc list-inside ml-2 space-y-1.5'>
              <li><span className='font-semibold text-slate-900 dark:text-zinc-200'>Disponibilidad del Servicio:</span> No garantizamos que el servicio estará siempre disponible o libre de errores. Hacemos nuestro mejor esfuerzo para mantener la plataforma operativa.</li>
              <li><span className='font-semibold text-slate-900 dark:text-zinc-200'>Contenido del Usuario:</span> No somos responsables del contenido generado por los usuarios. Si alguien encuentra y explota una vulnerabilidad, es responsabilidad del infractor notificar el problema y no utilizarlo de manera indebida.</li>
            </ul>
          </Section>

          <Section title='4. Modificaciones al Servicio'>
            <p>Podemos modificar o descontinuar el servicio en cualquier momento sin previo aviso. Intentaremos notificar a los usuarios sobre cambios significativos.</p>
          </Section>

          <Section title='5. Terminación del Servicio'>
            <p>Nos reservamos el derecho de suspender o terminar tu acceso a Artdle si violas estas condiciones de servicio o si consideramos que tu uso del servicio es perjudicial para otros usuarios o la comunidad.</p>
          </Section>

          <Section title='6. Contacto'>
            <p>
              Para cualquier pregunta o preocupación sobre estas Condiciones de Servicio, puedes contactarnos a través de{' '}
              <a className='text-slate-900 dark:text-zinc-100 underline underline-offset-2 font-medium hover:opacity-80' href='mailto:aruger.dev@gmail.com'>
                aruger.dev@gmail.com
              </a>
            </p>
          </Section>
        </article>
      </section>
    </main>
  )
}
