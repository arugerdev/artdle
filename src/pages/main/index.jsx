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
            className='flex flex-col items-center justify-center gap-4 w-full max-w-[1100px] px-4 pt-6'
            aria-labelledby='daily-word-heading'
          >
            <div className='flex flex-col items-center justify-center gap-1 mb-2'>
              <small className='text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-zinc-400'>
                {t('main.todaysWordLabel')}
              </small>
              <h1
                id='daily-word-heading'
                className='text-5xl sm:text-7xl font-sans font-bold pt-1 px-2 text-center text-slate-900 dark:text-zinc-50 tracking-tight'
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
    <div className='flex flex-row items-center gap-3 w-full max-w-[1200px] px-4 mt-6'>
      <div className='flex-1 h-px bg-slate-200 dark:bg-zinc-800' />
      <h2 className='flex flex-row items-center gap-2 text-sm sm:text-base font-medium py-1 px-3 text-slate-500 dark:text-zinc-400 tracking-tight uppercase'>
        {emoji && <span aria-hidden='true' className='text-base opacity-80'>{emoji}</span>}
        {title}
      </h2>
      <div className='flex-1 h-px bg-slate-200 dark:bg-zinc-800' />
    </div>
  )
}
