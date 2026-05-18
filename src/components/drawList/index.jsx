/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from 'react'
import { DrawCard } from '../drawCard'
import supabase, { getDailyWord } from '../../utils/supabase'
import toast from 'react-hot-toast'

export const DrawList = ({
  className,
  day = new Date().toISOString().split('T')[0],
  subscribe = true,
  orderBy = 'date',
  showDailyWord = false,
  showDrawsCount = true,
  filterName = '',
  maxItems = 8,
  positions = false
}) => {
  const [draws, setDraws] = useState([])
  const [pageIndex, setPageIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [dailyWord, setDailyWord] = useState('')
  const [drawsCount, setDrawsCount] = useState(0)
  const [isInView, setIsInView] = useState(false)
  const [shouldFetch, setShouldFetch] = useState(false)

  const containerRef = useRef(null)

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
    if (day) return query.eq('day', day)
    if (filterName) return query.ilike('name', `%${filterName.toString()}%`)
    return query
  }

  const getData = async (added = false) => {
    if (!day && !filterName) return

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

  const handleScroll = () => {
    if (containerRef.current && typeof window !== 'undefined') {
      const container = containerRef.current
      const { bottom } = container.getBoundingClientRect()
      const { innerHeight } = window
      setIsInView(bottom <= innerHeight)
    }
  }

  useEffect(() => {
    if (loading) return
    if (isInView && drawsCount > draws.length) {
      setPageIndex(old => old + 1)
    }
  }, [isInView])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
  }, [day, orderBy, filterName])

  return (
    <section
      className={`${className} ${
        loading ? 'justify-center' : 'justify-start'
      } flex flex-row flex-wrap bg-slate-100 items-start z-20 gap-2 p-4 w-full h-full mb-8 shadow-lg rounded-xl`}
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
            <div className='flex flex-col w-full h-full items-center justify-center text-center'>
              <h1 className='font-bold text-xl'>No hay dibujos!</h1>
              <p>😥</p>
            </div>
          )}
          {showDrawsCount && (
            <div className='flex flex-col w-full h-full items-center justify-center text-center'>
              {drawsCount > draws.length && <div className='loader'></div>}
              <p>Hay {drawsCount} dibujos</p>
            </div>
          )}
        </>
      )}

      {loading && <div className='loader'></div>}
    </section>
  )
}
