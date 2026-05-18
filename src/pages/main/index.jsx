import { useEffect, useState } from 'react'
import { Drawer } from '../../components/drawer/index.jsx'
import supabase, { getDailyWord } from '../../utils/supabase'
import { DrawList } from '../../components/drawList/index'
import toast, { Toaster } from 'react-hot-toast'
import { Topbar } from '../../components/topbar/index'
import { useTranslation } from 'react-i18next'

export default function MainPage () {
  const { t } = useTranslation()
  const [myDraw, setMyDraw] = useState([])
  const [loading, setLoading] = useState(true)
  const [dailyWord, setDailyWord] = useState('')

  const getDraws = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('draws')
        .select('id, name, uridata, storage_path, day, created_at, creator')
        .eq('creator', user.id)
        .eq('day', today)
      if (error) throw error
      setMyDraw(data ?? [])
      if ((data?.length ?? 0) > 0) {
        toast.success(t('main.drawDoneToast'))
      }
    } catch {
      setMyDraw([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    getDraws()
    getDailyWord(today).then(setDailyWord)
  }, [])

  return (
    <main className='flex flex-col gap-10 justify-start items-center h-full w-full min-w-screen min-h-screen pb-12'>
      <Toaster />
      <Topbar />
      {!loading && (
        <>
          <section
            className='flex flex-col items-center justify-center gap-1 w-full max-w-[1100px] px-4'
            aria-labelledby='daily-word-heading'
          >
            <div className='flex flex-col items-center justify-center gap-1 bg-gradient-to-br from-blue-50 via-white to-purple-50 border border-slate-200 rounded-2xl shadow-sm px-8 py-6 mb-6 w-full max-w-md'>
              <small className='text-xs font-semibold uppercase tracking-wider text-slate-500'>
                {t('main.todaysWordLabel')}
              </small>
              <h1
                id='daily-word-heading'
                className='text-4xl sm:text-5xl font-sans font-extrabold pt-1 px-2 text-center bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent'
              >
                {dailyWord || '…'}
              </h1>
            </div>
            <Drawer
              className='max-w-[1100px]'
              data={myDraw}
              drawed={myDraw.length > 0}
              dailyWord={dailyWord}
            />
          </section>

          <SectionDivider title={t('main.topDraws')} emoji='🏆' />
          <DrawList
            className='max-w-[1200px]'
            day={new Date().toISOString().split('T')[0]}
            orderBy='$.2'
            maxItems={3}
            showDailyWord={false}
            showDrawsCount={false}
            subscribe={true}
            positions
          />

          <SectionDivider title={t('main.otherDraws')} emoji='🎨' />
          <DrawList
            className='max-w-[1560px]'
            day={new Date().toISOString().split('T')[0]}
            subscribe={true}
          />
        </>
      )}
      {loading && (
        <section
          className='flex flex-col items-center justify-center h-screen w-screen'
          role='status'
          aria-busy='true'
          aria-label='Cargando Artdle'
        >
          <div className='loader'></div>
        </section>
      )}
    </main>
  )
}

// eslint-disable-next-line react/prop-types
function SectionDivider ({ title, emoji }) {
  return (
    <div className='flex flex-row items-center gap-3 w-full max-w-[1200px] px-4 mt-4'>
      <div className='flex-1 h-px bg-gradient-to-r from-transparent to-slate-300' />
      <h2 className='flex flex-row items-center gap-2 text-2xl sm:text-3xl font-sans font-extrabold py-1 px-3 text-slate-800'>
        {emoji && <span aria-hidden='true'>{emoji}</span>}
        {title}
      </h2>
      <div className='flex-1 h-px bg-gradient-to-l from-transparent to-slate-300' />
    </div>
  )
}
