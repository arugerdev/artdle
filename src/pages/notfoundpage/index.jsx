import { Link } from 'wouter'
import { Topbar } from '../../components/topbar/index'
import { Button } from '@nextui-org/react'

export default function NotFoundPage () {
  return (
    <main className='flex flex-col gap-8 justify-start items-center h-full w-full min-w-screen min-h-screen'>
      <Topbar />
      <section className='ios-card flex flex-col items-center justify-center p-8 mt-6 max-w-md rounded-3xl'>
        <h1 className='font-bold text-2xl text-slate-900 dark:text-zinc-100 text-center'>
          Te has equivocado de dirección? 😜
        </h1>
        <h2 className='font-medium text-slate-500 dark:text-zinc-400 text-center'>
          Esta dirección no existe esto es un error...
        </h2>
        <h1 className='font-bold text-8xl text-slate-900 dark:text-zinc-100 my-4'>404</h1>
        <p className='text-slate-500 dark:text-zinc-400 p-0 m-0 text-center text-sm'>
          Puedes volver a la página principal desde este botón:
        </p>
        <Button
          as={Link}
          radius='full'
          className='bg-slate-900 text-white dark:bg-zinc-50 dark:text-slate-900 font-semibold my-3'
          href='/'
        >
          Página Principal
        </Button>
      </section>
      <p className='font-mono text-xs uppercase tracking-widest text-slate-400 dark:text-zinc-600'>Error 404 · Not Found</p>
    </main>
  )
}
