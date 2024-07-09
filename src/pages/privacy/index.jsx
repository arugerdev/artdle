import { Topbar } from '../../components/topbar/index'

export default function PrivacyPage () {
  return (
    <main className='flex flex-col gap-8 justify-start items-center h-full w-full min-w-screen min-h-screen'>
      <Topbar />
      <section className='flex flex-col p-4 max-w-prose items-center justify-center gap-2 text-justify'>
        <div className='p-6 bg-white shadow-md rounded-md'>
          <h1 className='text-2xl font-bold mb-4'>Política de Privacidad</h1>
          <p className='text-gray-600'>
            Última actualización: 29/05/2024 17:40
          </p>

          <section className='mt-6'>
            <h2 className='text-xl font-semibold'>
              1. Información que recopilamos
            </h2>
            <ul className='list-disc list-inside ml-4 mt-2 text-gray-700'>
              <li>
                <span className='font-semibold'>Datos de usuario:</span> Al
                registrarte o iniciar sesión con Google, recopilamos tu correo
                electrónico, imagen de perfil y nombre de usuario. No utilizamos
                ninguna otra información de tu cuenta de Google.
              </li>
              <li>
                <span className='font-semibold'>
                  Dibujos y nombres de dibujos:
                </span>{' '}
                Los dibujos que creas, junto con los nombres que les asignas, se
                almacenan en nuestra base de datos.
              </li>
              <li>
                <span className='font-semibold'>Tiempos de creación:</span>{' '}
                Registramos las fechas y horas en las que creas y subes dibujos.
              </li>
              <li>
                <span className='font-semibold'>
                  Interacciones de usuarios:
                </span>{' '}
                Recopilamos datos sobre likes y reportes en los dibujos. Los
                likes son visibles en términos de cantidad en cada dibujo,
                mientras que los reportes son anónimos y no visibles para otros
                usuarios.
              </li>
            </ul>
          </section>

          <section className='mt-6'>
            <h2 className='text-xl font-semibold'>2. Uso de la información</h2>
            <p className='text-gray-700 mt-2'>
              Utilizamos la información recopilada para:
            </p>
            <ul className='list-disc list-inside ml-4 mt-2 text-gray-700'>
              <li>Gestionar y mejorar la plataforma Artdle.</li>
              <li>Permitir la visualización y votación de dibujos.</li>
              <li>
                Procesar los reportes para mantener un ambiente seguro y
                respetuoso.
              </li>
            </ul>
          </section>

          <section className='mt-6'>
            <h2 className='text-xl font-semibold'>
              3. Almacenamiento de datos
            </h2>
            <p className='text-gray-700 mt-2'>
              Los datos recopilados se almacenan de manera segura. Tomamos
              medidas razonables para proteger tu información contra accesos no
              autorizados, alteraciones, divulgaciones o destrucción.
            </p>
          </section>

          <section className='mt-6'>
            <h2 className='text-xl font-semibold'>4. Responsabilidad</h2>
            <p className='text-gray-700 mt-2'>
              ArugerDev no se hace responsable de los actos individuales de los
              usuarios en la plataforma. Implementamos sistemas de reporte para
              minimizar el abuso y los actos dañinos, pero cada usuario es
              responsable de su propio comportamiento.
            </p>
          </section>

          <section className='mt-6'>
            <h2 className='text-xl font-semibold'>5. Seguridad</h2>
            <p className='text-gray-700 mt-2'>
              Aunque hacemos nuestro mejor esfuerzo para proteger tus datos, no
              podemos garantizar una seguridad absoluta. En caso de que alguien
              descubra un error o vulnerabilidad, instamos a reportarlo
              inmediatamente para que pueda ser solucionado. El uso indebido de
              tales vulnerabilidades es responsabilidad del infractor.
            </p>
          </section>

          <section className='mt-6'>
            <h2 className='text-xl font-semibold'>
              6. Cambios a esta Política de Privacidad
            </h2>
            <p className='text-gray-700 mt-2'>
              Podemos actualizar esta Política de Privacidad ocasionalmente. Te
              notificaremos sobre cualquier cambio publicando la nueva política
              en nuestro sitio web. Te recomendamos revisar esta política
              periódicamente.
            </p>
          </section>

          <section className='mt-6'>
            <h2 className='text-xl font-semibold'>7. Contacto</h2>
            <p className='text-gray-700 mt-2'>
              Si tienes alguna pregunta sobre esta Política de Privacidad,
              puedes contactarnos a través de{' '}
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
