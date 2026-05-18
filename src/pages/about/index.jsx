import { Image, Link } from '@nextui-org/react'
import { Topbar } from '../../components/topbar/index'
import { Link as LinkW } from 'wouter'

export default function AboutPage () {
  return (
    <main className='flex flex-col gap-6 justify-start items-center h-full w-full min-w-screen min-h-screen pb-12'>
      <Topbar />
      <section className='flex flex-col p-4 max-w-prose items-stretch justify-center gap-2 w-full'>
        <article className='ios-card p-6 sm:p-8 rounded-3xl text-justify'>
          <h1 className='text-2xl font-bold text-slate-900 dark:text-zinc-50 text-center'>Sobre Mí</h1>
          <p className='text-slate-600 dark:text-zinc-300 mt-4'>
            Soy ArugerDev, un Desarrollador Web y Programador de Videojuegos en C#, este proyecto comenzó un 20 de Mayo (5) de 2024, empezó siendo un proyecto hecho por diversión.
            <br /><br />
            Este proyecto es de código abierto y lo puedes encontrar en mi{' '}
            <Link href='https://github.com/arugerdev' target='_blank' className='text-slate-900 dark:text-zinc-100 underline underline-offset-2 font-medium'>GitHub</Link>
            , algo importante es que no todo el proyecto es público, esto debido a que <strong>Artdle</strong> utiliza Supabase y necesita keys o claves de acceso y direcciones URL las cuales pueden poner en peligro los datos de los usuarios, por ello no puedo hace publicas estas direcciones o claves.
            <br /><br />
            <strong>Artdle</strong> es totalmente gratuito y de uso público, no hay restricción ni requisito para jugar. Todo el mundo puede jugar y disfrutar de la web.
            <br /><br />
            En <strong>Artdle</strong> solo hay 1 regla, se respetuoso, eres libre dibujando, pero recuerda que tus dibujos y la información que añadas al igual que los dibujos de los demás son públicos.
            <br />
            Por favor, respeta a los demás, no se permiten dibujos que contengan contenido explicito o dañino para las personas o comunidades, puedes dibujar lo que quieras y añadir el nombre que quieras a tus dibujos, pero no se permiten palabras obscenas insultos u otras palabras con las que algunas personas se puedan sentir mal.
            <br /><br />
            En el caso de incumplir alguna norma y subir un dibujo obsceno o que contenga un nombre con significados peligrosos, dañinos, etc, los usuarios podrian generar reportes a tu dibujo y podría llegar a ser eliminado de la plataforma, sin posibilidad de recuperación.
            <br /><br />
            Puedes ver mis otros trabajos y mas información sobre mi en{' '}
            <Link href='https://aruger.dev' target='_blank' className='text-slate-900 dark:text-zinc-100 underline underline-offset-2 font-medium'>aruger.dev</Link>
            , mi web personal, donde subo los proyectos que hago, informo sobre las cosas que hago, como trabajo y añado información de contacto o información sobre mí.
            <br /><br />
            Si tienes algún problema con este proyecto, con su creador, has encontrado algun bug o fallo, tienes alguna petición, etc, por favor contacta conmigo, puedes hacerlo a través de mi correo electrónico{' '}
            <Link href='mailto:aruger.dev@gmail.com' target='_blank' className='text-slate-900 dark:text-zinc-100 underline underline-offset-2 font-medium'>aruger.dev@gmail.com</Link>
            {' '}o a través de mi web personal o github{' '}
            <Link href='https://aruger.dev' target='_blank' className='text-slate-900 dark:text-zinc-100 underline underline-offset-2 font-medium'>aruger.dev</Link>
            ,{' '}
            <Link href='https://github.com/arugerdev' target='_blank' className='text-slate-900 dark:text-zinc-100 underline underline-offset-2 font-medium'>GitHub</Link>
          </p>

          <div className='flex flex-col items-center justify-center mt-6 gap-2'>
            <p className='text-lg text-slate-700 dark:text-zinc-300'>
              Disfruta Jugando a <strong className='text-slate-900 dark:text-zinc-100'>Artdle</strong>, y suerte!
            </p>
            <Image
              width={200}
              radius='full'
              src='https://www.aruger.dev/assets/me_0-8be10178.png'
              className='ring-2 ring-slate-200 dark:ring-zinc-700'
            />
          </div>

          <p className='text-center text-sm text-slate-500 dark:text-zinc-400 mt-6'>
            Si necesitas mas información puedes comprobar nuestras{' '}
            <LinkW href='/privacy' className='text-slate-900 dark:text-zinc-100 underline underline-offset-2 font-medium'>Políticas de privacidad</LinkW>
            {' '}o nuestras{' '}
            <LinkW href='/conditions' className='text-slate-900 dark:text-zinc-100 underline underline-offset-2 font-medium'>Condiciones de servicio</LinkW>
          </p>
        </article>

        <footer className='flex flex-row items-center justify-center gap-2 mt-4 text-xs font-mono text-slate-500 dark:text-zinc-500'>
          <p>©aruger.dev · 2024</p>
          <span aria-hidden='true'>·</span>
          <p>©artdle.com · 2024</p>
        </footer>
      </section>
    </main>
  )
}
