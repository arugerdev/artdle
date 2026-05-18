/* eslint-disable react/prop-types */
import { Button, Spinner, Tooltip } from '@nextui-org/react'
import supabase, { addLike, removeLike } from '../../utils/supabase'
import { useEffect, useState } from 'react'
import { FilledHeartIcon, HeartIcon } from '../../assets/icons'
import { abbrNum } from '../../utils/maths'
import toast from 'react-hot-toast'

export const LikeButton = ({ data = {} }) => {
  const hasJoinedCount = typeof data.likes_count === 'number'
  const [isLiked, setLiked] = useState()
  const [counter, setCounter] = useState(hasJoinedCount ? data.likes_count : 0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    supabase.auth.getUser().then(async user => {
      const userId = user.data.user?.id
      if (!userId) {
        setLiked(false)
        if (!hasJoinedCount) setCounter(0)
        setLoading(false)
        return
      }

      // "Did I like this?" — always needed, can't come from the public view.
      supabase
        .from('likes')
        .select('id', { head: true, count: 'exact' })
        .eq('liked_by', userId)
        .eq('liked_to', data.id)
        .then(({ count, error }) => {
          if (error) toast.error('Ha ocurrido un error al encontrar likes: ' + error.message)
          else setLiked((count ?? 0) > 0)
        })

      // Total count — only fetch when the parent didn't already join it in.
      if (hasJoinedCount) {
        setCounter(data.likes_count)
        setLoading(false)
        return
      }

      supabase
        .from('likes')
        .select('id', { head: true, count: 'exact' })
        .eq('liked_to', data.id)
        .then(({ count, error }) => {
          if (error) toast.error('Ha ocurrido un error al encontrar likes: ' + error.message)
          else setCounter(count ?? 0)
          setLoading(false)
        })
    })
  }, [data.id, data.likes_count, hasJoinedCount])

  const tooltipText = isLiked ? 'Quitar like' : 'Dar like'
  return (
    <section className='flex flex-row items-center justify-center'>
      <Tooltip content={tooltipText} delay={200} closeDelay={0} placement='top'>
        <Button
          isIconOnly
          variant='light'
          aria-label={tooltipText}
          aria-pressed={!!isLiked}
          className='flex items-center justify-center text-center p-0 transition-transform active:scale-90'
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
      </Tooltip>
      {!loading && (
        <small className='text-xs font-mono font-medium text-zinc-400'>
          {abbrNum(counter, 2)}
        </small>
      )}
      {loading && <Spinner size='sm' color='danger' />}
    </section>
  )
}
