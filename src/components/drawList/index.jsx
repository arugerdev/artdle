/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from 'react'
import { DrawCard } from '../drawCard'
import supabase, { getDailyWord } from '../../utils/supabase'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

export const DrawList = ({
  className,
  day = new Date().toISOString().split('T')[0],
  subscribe = true,
  orderBy = 'date',
  showDailyWord = false,
  showDrawsCount = true,
  filterName = '',
  filterCategory = null,
  maxItems = 8,
  positions = false
}) => {
  const { t } = useTranslation()
  const [draws, setDraws] = useState([])
  const [pageIndex, setPageIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [dailyWord, setDailyWord] = useState('')
  const [drawsCount, setDrawsCount] = useState(0)
  const [shouldFetch, setShouldFetch] = useState(false)

  const containerRef = useRef(null)
  const sentinelRef = useRef(null)
  const stateRef = useRef({ loading: false, drawsCount: 0, drawsLen: 0 })
  stateRef.current = { loading, drawsCount, drawsLen: draws.length }

  const resolveOrder = () => {
    switch (orderBy) {
      case '$.1':
        return { index: 'created_at', options: { ascending: true } }
      case '$.2':
        return { index: 'likes_count', options: { ascending: false } }
      case '$.3':
        return { index: 'likes_count', options: { ascending: true } }
      case '$.0':
      default:
        return { index: 'created_at', options: { ascending: false } }
    }
  }

  const applyFilter = query => {
    let q = query
    if (day) q = q.eq('day', day)
    else if (filterName) q = q.ilike('name', `%${filterName.toString()}%`)
    if (filterCategory) q = q.eq('daily_category', filterCategory)
    return q
  }

  const getData = async (added = false) => {
    if (!day && !filterName && !filterCategory) return

    const { index: orderIndex, options: orderOptions } = resolveOrder()

    if (!added) setLoading(true)

    try {
      if (!added) {
        const { data: countData } = await applyFilter(
          supabase.from('draws_with_meta').select('id')
        )
        setDrawsCount(countData?.length ?? 0)
      }

      const start = 8 * pageIndex
      const end = start + 7

      const { data, error } = await applyFilter(
        supabase.from('draws_with_meta').select('*')
      )
        .order(orderIndex, orderOptions)
        .range(start, end)
        .limit(maxItems)

      if (error) throw error

      setDraws(prev => (added ? [...prev, ...(data ?? [])] : data ?? []))

      if (day && (showDailyWord || !added)) {
        const word = await getDailyWord(day)
        setDailyWord(word)
      }
    } catch (err) {
      toast.error('Ha ocurrido un error al cargar los dibujos: ' + err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const abortController = new AbortController()

    if (pageIndex > 0) {
      getData(true)
    }
    return () => {
      abortController.abort()
    }
  }, [pageIndex])

  useEffect(() => {
    const node = sentinelRef.current
    if (!node || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        const { loading: l, drawsCount: c, drawsLen: n } = stateRef.current
        if (!l && c > n) setPageIndex(old => old + 1)
      },
      { rootMargin: '200px' }
    )
    io.observe(node)
    return () => io.disconnect()
  }, [draws.length === 0])

  const resetData = () => {
    setDailyWord('')
    setPageIndex(0)
    setDraws([])
    setDrawsCount(0)
  }

  useEffect(() => {
    if (shouldFetch) {
      getData()
      setShouldFetch(false)
    }
  }, [shouldFetch])

  useEffect(() => {
    resetData()
    setShouldFetch(true)

    if (!subscribe) return

    const taskListener = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'draws' },
        () => {
          setDraws([])
          getData()
        }
      )
      .subscribe()

    return () => taskListener.unsubscribe()
  }, [day, orderBy, filterName, filterCategory])

  return (
    <section
      className={`${className} ${
        loading ? 'justify-center' : 'justify-start'
      } flex flex-row flex-wrap items-start z-20 gap-3 p-4 w-full h-full mb-4 rounded-3xl`}
    >
      {!loading && draws && (
        <>
          {showDailyWord && (
            <div className='flex flex-col gap-0 justify-start items-center h-full w-full'>
              <small className='text-medium font-semibold'>
                La palabra del dia {day} fue:
              </small>
              <h1 className='flex text-4xl font-sans font-extrabold py-0 px-2'>
                {dailyWord}
              </h1>
            </div>
          )}
          <section
            ref={containerRef}
            className='w-full h-full grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-2'
          >
            {draws.map((data, ind) => {
              return (
                <DrawCard
                  key={data.id}
                  position={positions ? ind + 1 : null}
                  data={data}
                />
              )
            })}
          </section>
          {(!draws || draws.length == 0) && (
            <div className='flex flex-col w-full h-full items-center justify-center text-center text-zinc-400 py-12'>
              <h1 className='font-medium text-base text-zinc-300'>{t('main.noDrawsTitle')}</h1>
              <p className='text-2xl mt-1 opacity-50'>😥</p>
            </div>
          )}
          {showDrawsCount && (
            <div
              ref={sentinelRef}
              className='flex flex-col w-full h-full items-center justify-center text-center py-4'
            >
              {drawsCount > draws.length && <div className='loader'></div>}
              <p className='text-xs uppercase tracking-widest text-zinc-500 mt-2'>
                {t('main.drawsCount', { count: drawsCount })}
              </p>
            </div>
          )}
        </>
      )}

      {loading && (
        <div
          className='loader'
          role='status'
          aria-busy='true'
          aria-label='Cargando dibujos'
        ></div>
      )}
    </section>
  )
}
