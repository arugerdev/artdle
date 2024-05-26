import { useEffect, useState } from 'react'
import { Drawer } from '../../components/drawer/index.jsx'
import supabase, { getDailyWord } from '../../utils/supabase'
import { DrawList } from '../../components/draw-list/index'
import toast, { Toaster } from 'react-hot-toast'
import { Topbar } from '../../components/topbar/index'

export default function MainPage () {
  const [myDraw, setMyDraw] = useState([])
  const [loading, setLoading] = useState(true)
  const [dailyWord, setDailyWord] = useState('')

  function getDraws () {
    supabase.auth.getUser().then(async user => {
      if (!user.data.user) {
        setLoading(false)
        return
      }
      supabase
        .from('draws')
        .select('*')
        .eq('creator', user.data.user.id)
        .eq('day', new Date().toISOString().split('T')[0])
        .then(draws => {
          setMyDraw(draws.data)
          if (draws.data.length > 0) {
            toast.success(
              'Ya has hecho tu dibujo de hoy! Vuelve mañana para dibujar otra cosa ✏'
            )
          }
          setLoading(false)
        })
        .catch(() => {
          setMyDraw([])
          setLoading(false)
        })
    })
  }

  useEffect(() => {
    getDraws()
    getDailyWord(new Date().toISOString().split('T')[0]).then(word => {
      setDailyWord(word)
    })
  }, [])

  return (
    <main className='flex flex-col gap-8 justify-start items-center h-full w-full min-w-screen min-h-screen'>
      <Toaster />
      <Topbar />
      {!loading && (
        <>
          <div className='flex flex-col gap-0 justify-start items-center h-full w-full'>
            <small className='text-medium font-semibold'>
              La palabra del dia es:
            </small>
            <h1 className='flex text-4xl font-sans font-extrabold pt-1 py-12 px-2'>
              {dailyWord}
            </h1>
            <Drawer
              className='max-w-[1060px]'
              data={myDraw}
              drawed={myDraw.length > 0}
            />
          </div>

          <h1 className='flex text-4xl font-sans font-extrabold py-8 pb-2 px-2'>
            Otros dibujos
          </h1>

          <DrawList className='max-w-[1560px]' />
        </>
      )}
      {loading && (
        <section className='flex flex-col items-center justify-center h-screen w-screen'>
          <div className='loader'></div>
        </section>
      )}
    </main>
  )
}
