/* eslint-disable react/prop-types */
import { Topbar } from '../../components/topbar/index'
import { useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import supabase from '../../utils/supabase'
import { DrawCard } from './../../components/drawCard/index'

export default function DrawPage ({ id = 0 }) {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(
    typeof window !== 'undefined' ? window.__INITIAL_DATA__ : null
  )
  useEffect(() => {
    setLoading(true)
    supabase
      .from('draws')
      .select()
      .eq('id', id)
      .then(data => {
        setData(data.data[0])
        setLoading(false)
      })
  }, [id])

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
