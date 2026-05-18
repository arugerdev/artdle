import { Topbar } from '../../components/topbar/index'
import img00 from '../../assets/img/how-to-play_00.png'
import img01 from '../../assets/img/how-to-play_01.png'
import img02 from '../../assets/img/how-to-play_02.png'
import { Link as LinkW } from 'wouter'
import { Button, Image, Link } from '@nextui-org/react'
import { loginWithGoogle } from '../../utils/supabase'
import toast from 'react-hot-toast'

export default function HowToPlayPage () {
  return (
    <main className='flex flex-col gap-6 justify-start items-center h-full w-full min-w-screen min-h-screen pb-12'>
      <Topbar />
      <section className='flex flex-col p-4 max-w-prose items-stretch justify-center gap-2 w-full'>
        <article className='ios-card p-6 sm:p-8 rounded-3xl flex flex-col gap-4 text-slate-600 dark:text-zinc-300'>
          <h1 className='text-2xl font-bold text-slate-900 dark:text-zinc-50 text-center'>¿Cómo jugar a Artdle?</h1>
          <p className='text-justify'>
            Artdle es un juego en linea, donde dibujas algo que trate sobre la
            palabra aleatoria que cambia cada día, en general el juego se trata de
            competir con los demas para ver quien hace el mejor dibujo.
          </p>
          <p className='text-center font-bold text-slate-900 dark:text-zinc-100'>
            Pero Artdle es mucho mas que eso!
          </p>
          <p className='text-justify'>
            En la sección principal de Artdle verás un cuadro donde puedes
            dibujar, dibuja lo que quieras! Pero ten en cuenta, que solo te
            votarán si tu dibujo es realmente bueno y tiene la temática de la
            palabra elegida aleatoriamente cada día
          </p>
          <Image src={img00} alt='' width={'100%'} radius='lg' className='ring-1 ring-slate-200 dark:ring-zinc-700' />
          <p className='text-justify'>
            Disfruta dejandote llevar por la creatividad y dibujando usando las
            herramientas que ofrecemos, puedes usar los colores que desees,
            borrar, rellenar espacios en blanco, seleccionar un color ya usado, y
            un monton de cosas más!
            <br /><br />
            Recuerda que los dibujos se guardan como <strong>.png</strong>, esto,
            sin entrar mucho en detalle, es un tipo de archivo para guardar
            imagenes, &quot;¿y que me importa?&quot; Estarás pensando, pues lo
            interesante de esto es que los dibujos tienen transparencia, si
            quieres que un dibujo tenga un color de un fondo en concreto, recuerda
            dibujarlo!
          </p>
          <p className='text-center font-bold text-slate-900 dark:text-zinc-100'>
            ¿Y como voto los dibujos de los demás?
          </p>
          <p className='text-justify'>
            Si solo quieres ver las grandiosas creacciones de los demás del dia en
            el que estás jugando, debajo del cuadro de dibujo se encuentra una
            sección donde podras ver los nuevos dibujos creados por los demás y
            realizar la votación desde ahí.
          </p>
          <Image src={img01} alt='' width={'100%'} radius='lg' className='ring-1 ring-slate-200 dark:ring-zinc-700' />
          <p className='text-center font-bold text-slate-900 dark:text-zinc-100'>
            ¿Y si quiero votar o ver los dibujos de ayer?
          </p>
          <p className='text-justify'>
            ¡No te preocupes!
            <br /><br />
            Guardamos todos los dibujos bien guardaditos, y puedes filtrarlos por
            el día que más te guste! ¿Te gustaría ver que palabra apareció este
            año en el dia de tu cumpleaños, y cual fué el mejor dibujo?
            <br /><br />
            Para acceder a esto solo tienes que ir a la sección de{' '}
            <strong>Explorar</strong> allí podrás explorar y ver los dibujos que
            gustes, también puedes votar los dibujos antiguos sin problemas.
          </p>
          <Image src={img02} alt='' width={'100%'} radius='lg' className='ring-1 ring-slate-200 dark:ring-zinc-700' />
          <p className='text-center font-bold text-slate-900 dark:text-zinc-100'>
            ¿Puedo guardar mis likes entre dispositivos?
          </p>
          <p className='text-justify'>
            Actualmente la unica manera de sincronizar tus datos entre
            dispositivos es gracias a Google, si tienes una cuenta de Google y te
            gustaría tener todos tus likes y dibujos sincronizados entre varios de
            tus dispositivos puedes iniciar sesión con Google.
            <br /><br />
            Tranquilo! Esto es totalmente seguro y solo guardamos datos necesarios
            como emails, nombres de usuario y fotos de perfil.
          </p>
          <div className='flex justify-center'>
            <Button
              as={Link}
              radius='full'
              onPress={() => loginWithGoogle().then(() => toast.success('Sesión iniciada correctamente'))}
              className='bg-slate-900 text-white dark:bg-zinc-50 dark:text-slate-900 font-semibold'
            >
              Iniciar Sesión Aquí
            </Button>
          </div>
          <p className='text-center font-bold text-slate-900 dark:text-zinc-100 mt-2'>
            ¿De quien es ese dibujo?
          </p>
          <p className='text-justify'>
            Los dibujos no guardan información de los dueños aparte de su
            identificador, en el caso de los usuarios que estan conectados con
            Google, en cada dibujo se muestra el nombre de usuario y la foto del
            dueño, esto para identificar los dibujos mas facilmente y saber que
            autores tienen mejor cualidades que otros.
          </p>
          <div className='flex justify-center mt-2'>
            <Button
              as={LinkW}
              radius='full'
              className='bg-slate-900 text-white dark:bg-zinc-50 dark:text-slate-900 font-semibold text-md'
              href='/'
            >
              Empieza a jugar ya!
            </Button>
          </div>
          <p className='text-center text-sm text-slate-500 dark:text-zinc-400 mt-2'>
            Si necesitas mas información puedes comprobar nuestras{' '}
            <LinkW href='/privacy' className='text-slate-900 dark:text-zinc-100 underline underline-offset-2 font-medium'>
              Políticas de privacidad
            </LinkW>{' '}
            o nuestras{' '}
            <LinkW href='/conditions' className='text-slate-900 dark:text-zinc-100 underline underline-offset-2 font-medium'>
              Condiciones de servicio
            </LinkW>
          </p>
        </article>
      </section>
    </main>
  )
}
