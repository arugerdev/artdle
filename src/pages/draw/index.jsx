/* eslint-disable react/prop-types */
import { Topbar } from '../../components/topbar/index'
import { useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import supabase from '../../utils/supabase'
import { DrawCard } from './../../components/drawCard/index'
import { useLocation, useSearch } from 'wouter'

export default function DrawPage () {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const searchString = useSearch()
  const [id, setId] = useState(null)
  const [, pushLocation] = useLocation()

  useEffect(() => {
    setId(
      searchString
        .split('&')
        .find(e => e.includes('id='))
        .replace('id=', '')
    )
  }, [searchString])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    supabase
      .from('draws_with_meta')
      .select()
      .eq('id', id)
      .then(result => {
        setData(result.data?.[0] ?? null)
        setLoading(false)
      })
  }, [id])

  useEffect(() => {
    if (!id) return
    if (loading) return
    if (!data) {
      pushLocation('/404')
    }
  }, [id, data, loading, pushLocation])


  return (
    <main className='flex flex-col gap-8 justify-start items-center h-full w-full min-w-screen min-h-screen'>
      {loading}
      <Toaster></Toaster>
      <Topbar />
      <section className='flex flex-col p-4 gap-4 items-center justify-center w-full h-full max-w-[1200px]'>
        {!loading && data && (
          <>
            <h1 className='text-4xl w-full text-center font-bold'>
              {data.name}
            </h1>
            <DrawCard className='max-w-none w-full h-full p-16' data={data} />
          </>
        )}
        {!loading && !data && (
          <>
            <h1 className='text-4xl w-full text-center font-bold'>
              Lo siento pero el dibujo con identificador {id} no existe...
            </h1>
          </>
        )}
      </section>
    </main>
  )
}
