import { useEffect, useState } from 'react'
import supabase from '../../utils/supabase'
import { useParams } from 'wouter'

export const ImagerDB = () => {
  const params = useParams()

  const [data, setData] = useState(null)

  useEffect(() => {
    if (params.id) {
      supabase
        .from('draws')
        .select('*')
        .eq('id', params.id)
        .single()
        .then(data => {
          setData(data.data)
        })
    }
  }, [params])

  return (
    <>
      {data && <img src={data.uridata} alt={data.name} />}
      {!data && <p>Ha ocurrido un error al encontrar la imagen </p>}
    </>
  )
}
