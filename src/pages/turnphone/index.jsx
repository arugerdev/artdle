import { Topbar } from '../../components/topbar/index'
import TurnPhone from '../../assets/img/turnPhone.gif'
import Icon from '../../assets/img/icon.png'
import { Image } from '@nextui-org/react'
import { DefaultHeaders } from '../../components/defaultHeaders'
export default function TurnPhonePage () {
  return (
    <main className='flex flex-col gap-0 px-12 justify-start items-center h-full w-full min-w-screen min-h-screen'>
      <Topbar />
      <DefaultHeaders />
      <h1 className='text-4xl font-extrabold'>ARTDLE</h1>
      <Image width={256} src={Icon} shadow='xl' />
      <h1 className='text-2xl font-extrabold'>
        Gira tu dispositivo para jugar por favor! 😊
      </h1>
      <p className='text-justify max-w-prose text-md'>
        Este juego utiliza una sección para dibujar y es necesario que se dibuje
        en un dispositivo que tenga una pantalla mas ancha que alta para que
        cada jugador pueda disfrutar de su experiencia lo mejor posible 😉
      </p>
      <Image
        width={256}
        src={TurnPhone}
        className='grayscale saturate-200 contrast-200'
        shadow='xl'
      />
    </main>
  )
}
