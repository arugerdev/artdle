/* eslint-disable react/prop-types */
import { Button, Spinner } from '@nextui-org/react'
import supabase, { addLike, removeLike } from '../../utils/supabase'
import { useEffect, useState } from 'react'
import { FilledHeartIcon, HeartIcon } from '../../assets/icons'
import { abbrNum } from '../../utils/maths'
import toast from 'react-hot-toast'

export const LikeButton = ({ data = {} }) => {
  const [isLiked, setLiked] = useState()
  const [counter, setCounter] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const abortController = new AbortController()

    setLoading(true)
    supabase.auth.getUser().then(async user => {
      supabase
        .from('likes')
        .select('*')
        .eq('liked_by', user.data.user.id)
        .eq('liked_to', data.id)
        .then(likes => {
          setLiked(likes.data.length > 0)
        })
        .catch(err => {
          toast.error('Ha ocurrido un error al encontrar likes: ' + err)
        })

      supabase
        .from('likes')
        .select('*')
        .eq('liked_to', data.id)
        .then(likes => {
          setCounter(likes.data.length)
          setLoading(false)
        })
        .catch(err => {
          toast.error('Ha ocurrido un error al encontrar likes: ' + err)
          setLoading(false)
        })
    })
    return () => {
      abortController.abort()
    }
  }, [data])

  return (
    <section className='flex flex-row items-center justify-center'>
      <Button
        isIconOnly
        variant='light'
        className='flex items-center justify-center text-center p-0'
        onPress={() => {
          supabase.auth.getUser().then(async user => {
            if (isLiked) removeLike(user, data, setCounter)
            else if (!isLiked) addLike(user, data, setCounter)
          })

          setLiked(old => !old)
        }}
      >
        {isLiked && (
          <FilledHeartIcon className='w-full h-full p-2 text-red-600' />
        )}
        {!isLiked && <HeartIcon className='w-full h-full p-2 text-red-600' />}
      </Button>
      {!loading && (
        <small className='text-md font-bold text-gray-500'>
          {abbrNum(counter, 2)}
        </small>
      )}
      {loading && <Spinner size='sm' color='danger' />}
    </section>
  )
}
