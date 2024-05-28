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
  filterName = ''
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
      case '$.0':
      case '$.1':
        orderIndex = 'created_at'
        break
      case '$.2':
      case '$.3':
        orderIndex = 'items_count'
        break
    }

    switch (orderBy) {
      case '$.0':
        orderOptions = { ascending: false }
        break
      case '$.1':
        orderOptions = { ascending: true }
        break
      case '$.2':
        orderOptions = { ascending: false }
        break
      case '$.3':
        orderOptions = { ascending: true }
        break
    }

    if (day) {
      searchByDay(orderIndex, orderOptions, added)
    } else if (filterName) {
      searchByName(orderIndex, orderOptions, added)
    }
  }

  const searchByName = (orderIndex, orderOptions, added) => {
    if (!added) {
      setLoading(true)

      supabase
        .from('draws')
        .select('id', 'COUNT(id)')
        .ilike('name', `%${filterName.toString()}%`)
        .then(count => {
          setDrawsCount(count.data.length)
        })
    }

    supabase
      .from('draws')
      .select('*')
      .ilike('name', `%${filterName.toString()}%`)
      .order(orderIndex, orderOptions)
      .range(0 + 10 * pageIndex + pageIndex, 10 + 10 * pageIndex + pageIndex)
      .then(data => {
        if (added) {
          setDraws(old => [...old, ...data.data])
          setLoading(false)
        } else {
          setDraws(data.data)
          if (showDailyWord) {
            getDailyWord(day).then(word => {
              setDailyWord(word)
              setLoading(false)
            })
          } else {
            setLoading(false)
          }
        }
      })
      .catch(err => {
        toast.error('Ha ocurrido un error al cargar los dibujos: ' + err)
        setLoading(false)
      })
  }

  const searchByDay = (orderIndex, orderOptions, added) => {
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
            className='w-full h-full grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-2'
          >
            {draws.map(data => {
              return <DrawCard key={data.id} data={data} />
            })}
          </section>
          {(!draws || draws.length == 0) && (
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