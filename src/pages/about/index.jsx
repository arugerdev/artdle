import { Topbar } from '../../components/topbar/index'

export default function AboutPage () {
  return (
    <main className='flex flex-col gap-8 justify-start items-center h-full w-full min-w-screen min-h-screen'>
      <Topbar />
      <section className='flex flex-col p-4'>
        <h1 className='text-4xl font-extrabold'>Sobre nosotros</h1>
        <p>aruger.dev</p>
      </section>
    </main>
  )
}
