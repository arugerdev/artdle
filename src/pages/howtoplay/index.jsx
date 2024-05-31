import { Topbar } from '../../components/topbar/index'
import img00 from '../../assets/img/how-to-play_00.png'
import img01 from '../../assets/img/how-to-play_01.png'
import img02 from '../../assets/img/how-to-play_02.png'
import { Link as LinkW } from 'wouter'
import { Image } from '@nextui-org/react'
import { DefaultHeaders } from '../../components/defaultHeaders'
export default function HowToPlayPage () {
  return (
    <main className='flex flex-col gap-8 justify-start items-center h-full w-full min-w-screen min-h-screen'>
      <Topbar />
      <DefaultHeaders />
      <section className='flex flex-col p-4 gap-4 w-full justify-center items-center'>
        <h1 className='text-4xl font-extrabold pb-4'>¿Cómo jugar a Artdle?</h1>
        <p className='w-full text-justify max-w-[80ch]'>
          Artdle es un juego en linea, donde dibujas algo que trate sobre la
          palabra aleatoria que cambia cada día, en general el juego se trata de
          competir con los demas para ver quien hace el mejor dibujo.
        </p>
        <p className='w-full text-center max-w-[80ch] font-bold'>
          Pero Artdle es mucho mas que eso!
        </p>
        <p className='w-full text-justify max-w-[80ch]'>
          En la sección principal de Artdle verás un cuadro donde puedes
          dibujar, dibuja lo que quieras! Pero ten en cuenta, que solo te
          votarán si tu dibujo es realmente bueno y tiene la temática de la
          palabra elegida aleatoriamente cada día
        </p>
        <br />
        <Image
          src={img00}
          alt=''
          width={'100%'}
          shadow='sm'
          className='p-4 max-w-[900px]'
        />
        <br />
        <p className='w-full text-justify max-w-[80ch]'>
          Disfruta dejandote llevar por la creatividad y dibujando usando las
          herramientas que ofrecemos, puedes usar los colores que desees,
          borrar, rellenar espacios en blanco, seleccionar un color ya usado, y
          un monton de cosas más!
          <br />
          <br />
          Recuerda que los dibujos se guardan como <strong>.png</strong>, esto,
          sin entrar mucho en detalle, es un tipo de archivo para guardar
          imagenes, &quot;¿y que me importa?&quot; Estarás pensando, pues lo
          interesante de esto es que los dibujos tienen transparencia, si
          quieres que un dibujo tenga un color de un fondo en concreto, recuerda
          dibujarlo!
        </p>
        <p className='w-full text-center max-w-[80ch] font-bold'>
          ¿Y como voto los dibujos de los demás?
        </p>
        <p className='w-full text-justify max-w-[80ch]'>
          Si solo quieres ver las grandiosas creacciones de los demás del dia en
          el que estás jugando, debajo del cuadro de dibujo se encuentra una
          sección donde podras ver los nuevos dibujos creados por los demás y
          realizar la votación desde ahí.
        </p>
        <Image
          src={img01}
          alt=''
          width={'100%'}
          shadow='sm'
          className='p-4 max-w-[900px]'
        />
        <p className='w-full text-center max-w-[80ch] font-bold'>
          ¿Y si quiero votar o ver los dibujos de ayer?
        </p>
        <p className='w-full text-justify max-w-[80ch]'>
          ¡No te preocupes!
          <br />
          <br />
          Guardamos todos los dibujos bien guardaditos, y puedes filtrarlos por
          el día que más te guste! ¿Te gustaría ver que palabra apareció este
          año en el dia de tu cumpleaños, y cual fué el mejor dibujo?
          <br />
          <br />
          Para acceder a esto solo tienes que ir a la sección de{' '}
          <strong>Explorar</strong> allí podrás explorar y ver los dibujos que
          gustes, también puedes votar los dibujos antiguos sin problemas.
        </p>
        <Image
          src={img02}
          alt=''
          width={'100%'}
          shadow='sm'
          className='p-4 max-w-[900px]'
        />

        <p className='text-jusitfy'>
          Si necesitas mas información puedes comprobar nuestras{' '}
          <LinkW href='/privacy' className='text-primary-600'>
            Políticas de privacidad
          </LinkW>{' '}
          o nuestras{' '}
          <LinkW href='/conditions' className='text-primary-600'>
            Condiciones de servicio
          </LinkW>
        </p>
      </section>
    </main>
  )
}
