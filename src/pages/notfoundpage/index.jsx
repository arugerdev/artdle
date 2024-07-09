import { Link } from 'wouter'
import { Topbar } from '../../components/topbar/index'
import { Button } from '@nextui-org/react'

export default function NotFoundPage () {
  return (
    <main className='flex flex-col gap-8 justify-start items-center h-full w-full min-w-screen min-h-screen'>
      <Topbar />
      <section className='flex flex-col items-center justify-center p-6'>
        <h1 className='font-extrabold text-2xl '>
          Te has equivocado de dirección? 😜
        </h1>
        <h2 className='font-semibold text-gray-600'>
          Esta dirección no existe esto es un error...
        </h2>
        <h1 className='font-extrabold text-8xl'>404</h1>
      </section>
      <section className='flex flex-col items-center justify-center'>
        <p className='text-gray-500 p-0 m-0'>
          Puedes volver a la página principal desde este botón:
        </p>
        <Button
          as={Link}
          variant='flat'
          color='primary'
          className='font-bold text-md my-2'
          href='/'
        >
          Página Principal
        </Button>
      </section>
      <p>Error 404: NOT FOUND</p>
    </main>
  )
}
