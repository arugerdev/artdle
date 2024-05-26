/* eslint-disable react/prop-types */
import {
  Button,
  Link,
  useDisclosure,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner
} from '@nextui-org/react'
import { DownloadIcon, FilledHeartIcon, HeartIcon } from '../../assets/icons'
import { useEffect, useState } from 'react'
import supabase from '../../utils/supabase'
import toast from 'react-hot-toast'
import { abbrNum } from '../../utils/maths'
export const DrawCard = ({ data }) => {
  const [isLiked, setLiked] = useState()
  const [counter, setCounter] = useState(0)
  const [loading, setLoading] = useState(true)
  const { isOpen, onOpen, onClose } = useDisclosure()

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
  }, [])

  const removeLike = user => {
    setCounter(old => old - 1)
    supabase
      .from('likes')
      .delete()
      .eq('liked_by', user.data.user.id)
      .eq('liked_to', data.id)
      .then(likes => {
        toast.success('Like quitado')
      })
      .catch(err => {
        toast.error('Ha ocurrido un error al intentar eliminar el like: ' + err)
      })
  }

  const addLike = user => {
    setCounter(old => old + 1)

    supabase
      .from('likes')
      .insert({ liked_by: user.data.user.id, liked_to: data.id })
      .then(likes => {
        toast.success('Like añadido')
      })
      .catch(err => {
        toast.error('Ha ocurrido un error al intentar añadir el like: ' + err)
      })
  }

  return (
    <Link onPress={onOpen} className='w-full h-full cursor-pointer'>
      <section className='flex flex-col border-r-2 items-center justify-center w-full text-center shadow-lg h-auto rounded-lg text-black bg-white gap-2 p-2'>
        <img src={data.uridata} width={'250px'} height={'140px'} />
        <div className='w-full border-1'></div>
        <div className='flex flex-row w-full items-center justify-center'>
          <section className='flex flex-col -gap-8 items-start justify-center text-start w-full'>
            <h1 className='font-extrabold text-pretty'>{data.name}</h1>
            <small className=''>
              {new Date(data.created_at).toString().split('GMT')[0]}
            </small>
          </section>

          <section className='flex flex-row items-center justify-center'>
            <Button
              isIconOnly
              variant='light'
              className='flex items-center justify-center text-center p-0'
              onPress={() => {
                supabase.auth.getUser().then(async user => {
                  if (isLiked) removeLike(user)
                  else if (!isLiked) addLike(user)
                })

                setLiked(old => !old)
              }}
            >
              {isLiked && (
                <FilledHeartIcon className='w-full h-full p-2 text-red-600' />
              )}
              {!isLiked && (
                <HeartIcon className='w-full h-full p-2 text-red-600' />
              )}
            </Button>
            {!loading && (
              <small className='text-md font-bold text-gray-500'>
                {abbrNum(counter, 2)}
              </small>
            )}
            {loading && <Spinner size='sm' color='danger' />}
          </section>
        </div>

        <Modal
          backdrop='blur'
          className='flex w-[60%] h-[90%] max-w-full'
          isOpen={isOpen}
          onClose={onClose}
        >
          <ModalContent>
            {onClose => (
              <>
                <ModalHeader className='flex flex-col gap-1 w-full h-full'>
                  <h1>{data.name}</h1>
                </ModalHeader>
                <ModalBody>
                  <img
                    width={'100%'}
                    height={'100%'}
                    className='w-full h-full aspect-video'
                    src={data.uridata}
                    alt={data.name}
                  />
                </ModalBody>
                <ModalFooter>
                  <Button
                    color='success'
                    variant='ghost'
                    onPress={() => {
                      var a = document.createElement('a')
                      a.href = data.uridata.toString()
                      a.download = `${data.name}-${data.created_at}-draw.png`
                      a.click()
                    }}
                    startContent={<DownloadIcon />}
                  >
                    Download
                  </Button>
                  <Button color='danger' variant='light' onPress={onClose}>
                    Close
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </section>
    </Link>
  )
}
