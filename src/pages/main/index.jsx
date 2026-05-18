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
            className='flex flex-col items-center justify-center gap-4 w-full max-w-[1100px] px-4 pt-4'
            aria-labelledby='daily-word-heading'
          >
            <div className='glass flex flex-col items-center justify-center gap-1 rounded-2xl px-10 py-5 mb-2 max-w-md'>
              <small className='text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500'>
                {t('main.todaysWordLabel')}
              </small>
              <h1
                id='daily-word-heading'
                className='text-4xl sm:text-5xl font-sans font-bold pt-1 px-2 text-center text-slate-900 tracking-tight'
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
      <div className='flex-1 h-px bg-slate-200/70' />
      <h2 className='flex flex-row items-center gap-2 text-base sm:text-lg font-semibold py-1 px-3 text-slate-700 tracking-tight'>
        {emoji && <span aria-hidden='true' className='text-xl'>{emoji}</span>}
        {title}
      </h2>
      <div className='flex-1 h-px bg-slate-200/70' />
    </div>
  )
}
