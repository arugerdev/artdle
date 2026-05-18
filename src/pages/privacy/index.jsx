import { Topbar } from '../../components/topbar/index'

// eslint-disable-next-line react/prop-types
const Section = ({ title, children }) => (
  <section className='mt-6'>
    <h2 className='text-base sm:text-lg font-semibold text-slate-900 dark:text-zinc-100'>{title}</h2>
    <div className='text-slate-600 dark:text-zinc-400 mt-2'>{children}</div>
  </section>
)

export default function PrivacyPage () {
  return (
    <main className='flex flex-col gap-6 justify-start items-center h-full w-full min-w-screen min-h-screen pb-12'>
      <Topbar />
      <section className='flex flex-col p-4 max-w-prose items-stretch justify-center gap-2 w-full'>
        <article className='ios-card p-6 sm:p-8 rounded-3xl'>
          <h1 className='text-2xl font-bold text-slate-900 dark:text-zinc-50'>Política de Privacidad</h1>
          <p className='text-xs font-mono text-slate-500 dark:text-zinc-500 mt-1'>
            Última actualización: 29/05/2024 17:40
          </p>

          <Section title='1. Información que recopilamos'>
            <ul className='list-disc list-inside ml-2 space-y-1.5'>
              <li><span className='font-semibold text-slate-900 dark:text-zinc-200'>Datos de usuario:</span> Al registrarte o iniciar sesión con Google, recopilamos tu correo electrónico, imagen de perfil y nombre de usuario. No utilizamos ninguna otra información de tu cuenta de Google.</li>
              <li><span className='font-semibold text-slate-900 dark:text-zinc-200'>Dibujos y nombres de dibujos:</span> Los dibujos que creas, junto con los nombres que les asignas, se almacenan en nuestra base de datos.</li>
              <li><span className='font-semibold text-slate-900 dark:text-zinc-200'>Tiempos de creación:</span> Registramos las fechas y horas en las que creas y subes dibujos.</li>
              <li><span className='font-semibold text-slate-900 dark:text-zinc-200'>Interacciones de usuarios:</span> Recopilamos datos sobre likes y reportes en los dibujos. Los likes son visibles en términos de cantidad en cada dibujo, mientras que los reportes son anónimos y no visibles para otros usuarios.</li>
            </ul>
          </Section>

          <Section title='2. Uso de la información'>
            <p>Utilizamos la información recopilada para:</p>
            <ul className='list-disc list-inside ml-2 mt-2 space-y-1'>
              <li>Gestionar y mejorar la plataforma Artdle.</li>
              <li>Permitir la visualización y votación de dibujos.</li>
              <li>Procesar los reportes para mantener un ambiente seguro y respetuoso.</li>
            </ul>
          </Section>

          <Section title='3. Almacenamiento de datos'>
            <p>Los datos recopilados se almacenan de manera segura. Tomamos medidas razonables para proteger tu información contra accesos no autorizados, alteraciones, divulgaciones o destrucción.</p>
          </Section>

          <Section title='4. Responsabilidad'>
            <p>ArugerDev no se hace responsable de los actos individuales de los usuarios en la plataforma. Implementamos sistemas de reporte para minimizar el abuso y los actos dañinos, pero cada usuario es responsable de su propio comportamiento.</p>
          </Section>

          <Section title='5. Seguridad'>
            <p>Aunque hacemos nuestro mejor esfuerzo para proteger tus datos, no podemos garantizar una seguridad absoluta. En caso de que alguien descubra un error o vulnerabilidad, instamos a reportarlo inmediatamente para que pueda ser solucionado. El uso indebido de tales vulnerabilidades es responsabilidad del infractor.</p>
          </Section>

          <Section title='6. Cambios a esta Política de Privacidad'>
            <p>Podemos actualizar esta Política de Privacidad ocasionalmente. Te notificaremos sobre cualquier cambio publicando la nueva política en nuestro sitio web. Te recomendamos revisar esta política periódicamente.</p>
          </Section>

          <Section title='7. Contacto'>
            <p>
              Si tienes alguna pregunta sobre esta Política de Privacidad, puedes contactarnos a través de{' '}
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
