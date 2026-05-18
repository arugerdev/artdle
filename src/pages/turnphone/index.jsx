import { Topbar } from '../../components/topbar/index'
import TurnPhone from '../../assets/img/turnPhone.gif'
import Icon from '../../assets/img/icon.png'
import { Image } from '@nextui-org/react'

export default function TurnPhonePage () {
  return (
    <main className='flex flex-col gap-4 px-6 justify-start items-center h-full w-full min-w-screen min-h-screen'>
      <Topbar />
      <section className='ios-card flex flex-col items-center justify-center gap-3 p-6 mt-4 max-w-md rounded-3xl text-center'>
        <Image width={120} radius='full' src={Icon} className='ring-1 ring-slate-200 dark:ring-zinc-700' />
        <h1 className='text-2xl font-bold text-slate-900 dark:text-zinc-50 tracking-tight'>
          Gira tu dispositivo para jugar 😊
        </h1>
        <p className='text-sm text-slate-600 dark:text-zinc-400 max-w-prose'>
          Este juego utiliza una sección para dibujar y es necesario que se
          dibuje en un dispositivo que tenga una pantalla mas ancha que alta
          para que cada jugador pueda disfrutar de su experiencia lo mejor posible.
        </p>
        <Image
          width={180}
          radius='lg'
          src={TurnPhone}
          className='grayscale dark:invert opacity-80'
        />
      </section>
    </main>
  )
}
