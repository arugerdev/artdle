/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from 'react'
import { DrawCard } from '../draw-card'
import supabase, { getDailyWord } from '../../utils/supabase'
import toast from 'react-hot-toast'

export const DrawList = ({
  className,
  day = new Date().toISOString().split('T')[0],
  subscribe = true,
  orderBy = 'date',
  showDailyWord = false
}) => {
  const [draws, setDraws] = useState([])
  const [pageIndex, setPageIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [dailyWord, setDailyWord] = useState('')
  const [drawsCount, setDrawsCount] = useState(0)
  const [isInView, setIsInView] = useState(false)
  const [shouldFetch, setShouldFetch] = useState(false)

  const containerRef = useRef(null)

  const getData = (added = false) => {
    let orderIndex = 'created_at'
    let orderOptions = { ascending: false }

    switch (orderBy) {
      case '$.0' || '$.1':
        orderIndex = 'created_at'
        break
      case '$.2' || '$.3':
        orderIndex = 'likes'
        break
    }

    switch (orderBy) {
      case '$.0':
        orderOptions = { ascending: false }
        break
      case '$.1':
        orderOptions = { ascending: true }
        break
      case '$.2' || '$.3':
        orderOptions = { ascending: false }
        break
    }

    if (!added) {
      setLoading(true)

      supabase
        .from('draws')
        .select('id', 'COUNT(id)')
        .eq('day', day)
        .then(count => {
          setDrawsCount(count.data.length)
        })
    }

    supabase
      .from('draws')
      .select('*')
      .order(orderIndex, orderOptions)
      .eq('day', day)
      .range(0 + 10 * pageIndex + pageIndex, 10 + 10 * pageIndex + pageIndex)
      // .limit(10)
      .then(data => {
        if (added) {
          setDraws(old => [...old, ...data.data])
          setLoading(false)
        } else {
          setDraws(data.data)
          getDailyWord(day).then(word => {
            setDailyWord(word)
            setLoading(false)
          })
        }
      })
      .catch(err => {
        toast.error('Ha ocurrido un error al cargar los dibujos: ' + err)
        setLoading(false)
      })
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
    window.addEventListener('scroll', () => handleScroll())
    return () => {
      window.removeEventListener('scroll', () => handleScroll())
    }
  }, [])

  const resetData = () => {
    setDailyWord('')
    setPageIndex(0)
    setDraws([])
    setDrawsCount(0)
  }

  useEffect(() => {
    if (shouldFetch) {
      setShouldFetch(false)
      getData()
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
  }, [day, orderBy])

  return (
    <section
      className={`${className} ${
        loading ? 'justify-center' : 'justify-start'
      } flex flex-row flex-wrap bg-slate-100 items-start z-20 gap-2 p-4 w-full h-full mb-8 shadow-lg rounded-xl`}
    >
      {!loading && (
        <>
          {showDailyWord && (
            <div className='flex flex-col gap-0 justify-start items-center h-full w-full'>
              <small className='text-medium font-semibold'>
                La palabra del dia {day} fue:
              </small>
              <h1 className='flex text-4xl font-sans font-extrabold pt-1 py-12 px-2'>
                {dailyWord}
              </h1>
            </div>
          )}
          <section
            ref={containerRef}
            className='w-full h-full grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-2'
          >
            {draws.map(data => {
              return <DrawCard key={data.id} data={data} />
            })}
          </section>
          {draws.length == 0 && (
            <div className='flex flex-col w-full h-full items-center justify-center text-center'>
              <h1 className='font-bold text-xl'>No hay dibujos!</h1>
              <p>😥</p>
            </div>
          )}
          <div className='flex flex-col w-full h-full items-center justify-center text-center'>
            {drawsCount > draws.length && <div className='loader'></div>}
            <p>Hay {drawsCount} dibujos</p>
          </div>
        </>
      )}
      {loading && <div className='loader'></div>}
    </section>
  )
}
