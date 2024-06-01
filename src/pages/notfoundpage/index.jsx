import { Topbar } from '../../components/topbar/index'

export default function NotFoundPage () {
  return (
    <main className='flex flex-col gap-8 justify-start items-center h-full w-full min-w-screen min-h-screen'>
      <Topbar />
      <h1>404</h1>
    </main>
  )
}
