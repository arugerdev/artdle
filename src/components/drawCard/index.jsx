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
  Image,
  Avatar
} from '@nextui-org/react'
import { DownloadIcon } from '../../assets/icons'
import { Tooltip } from '@nextui-org/react'
import { LikeButton } from './../likeButton/index'
import { getDailyWord, getUserData } from '../../utils/supabase'
import { useEffect, useState } from 'react'
import { OptionsButton } from './../optionsButton/index'
import { isMobile } from '../../utils/system'
import { ShareButton } from './../shareButton/index'
export const DrawCard = ({ data, className = '', position = null }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [dailyWord, setDailyWord] = useState('')
  const [userData, setUserData] = useState(null)

  useEffect(() => {
    getDailyWord(data.created_at.split('+')[0].split('T')[0]).then(word => {
      setDailyWord(word)
    })

    getUserData(data.creator).then(data => {
      setUserData(data)
    })
  }, [])

  return (
    <Tooltip
      size='md'
      content={
        <div className='flex flex-col items-start justify-center'>
          <h1 className='font-extrabold max-w-prose text-pretty'>
            {data.name}
          </h1>
          <p className='max-w-prose text-pretty'>
            {new Date(data.created_at).toString().split('GMT')[0]}
          </p>
        </div>
      }
    >
      <Link
        onPress={onOpen}
        className={` w-full max-w-[500px] h-full cursor-pointer ${className}`}
      >
        <section className='flex flex-col border-r-2 items-center justify-center w-full text-center shadow-lg h-auto rounded-lg text-black bg-white gap-2 p-2'>
          {position && (
            <p>
              {position === 1
                ? '👑'
                : position === 2
                ? '🥈'
                : position === 3
                ? '🥉'
                : `#${position}`}
            </p>
          )}
          <Image
            src={data.uridata}
            radius='sm'
            isBlurred={!isMobile()}
            isZoomed={!isMobile()}
          />
          <div className='w-full border-1'></div>
          <div className='flex flex-row w-full items-center justify-center'>
            <section className='flex flex-col -gap-8 items-start justify-center text-start w-full truncate'>
              <h1 className='font-extrabold'>{data.name}</h1>
              <small className=''>
                {new Date(data.created_at).toString().split('GMT')[0]}
              </small>
            </section>

            <LikeButton data={data} />
          </div>
          <div className='flex flex-row w-full items-center justify-start p-0 m-0 gap-2'>
            <Avatar size='sm' src={userData?.avatar_url} />
            <small className='text-slate-500 font-normal text-sm'>
              <strong>{userData?.username ?? 'Autor desconocido'}</strong>
            </small>
          </div>
          <Modal
            backdrop='blur'
            className='flex w-[100%] md:w-[60%] h-[90%] max-w-full'
            isOpen={isOpen}
            onClose={onClose}
          >
            <ModalContent>
              {onClose => (
                <>
                  <ModalHeader className='flex flex-col pb-0 pt-2 md:p-4 gap-0 w-full'>
                    <h1 className='font-extrabold text-sm md:text-md'>
                      {data.name}
                    </h1>
                    <small className='text-slate-500 font-normal text-sm'>
                      Dibujado:{' '}
                      {new Date(data.created_at).toString().split('GMT')[0]}
                    </small>
                    <small className='text-slate-500 font-normal text-sm'>
                      Palabra del dia: {dailyWord}
                    </small>
                    {userData && (
                      <div className='flex flex-row items-center justify-start gap-2'>
                        <Avatar size='sm' src={userData.avatar_url} />
                        <small className='text-slate-500 font-normal text-sm'>
                          <strong>{userData.username}</strong>
                        </small>
                      </div>
                    )}
                  </ModalHeader>
                  <ModalBody className='flex flex-col items-center justify-center p-0 w-full h-full overflow-hidden'>
                    <Image
                      isBlurred
                      className='h-full object-scale-down rounded-sm'
                      src={data.uridata}
                      alt={data.name}
                    />
                  </ModalBody>
                  <ModalFooter className='pb-2 pt-0 md:p-4'>
                    <section className='flex flex-row justify-start w-full '>
                      <LikeButton data={data} />
                    </section>

                    <section className='flex flex-row justify-end gap-2 w-full'>
                      <section className='flex flex-row justify-end'>
                        <OptionsButton data={data} userData={userData} />
                        <ShareButton data={data} dailyWord={dailyWord} />
                      </section>
                      <Button
                        color='success'
                        variant='flat'
                        onPress={() => {
                          var a = document.createElement('a')
                          a.href = data.uridata.toString()
                          a.download = `${data.name}-${data.created_at}-draw.png`
                          a.click()
                        }}
                        startContent={<DownloadIcon />}
                        isIconOnly={window.innerWidth <= 1000}
                      >
                        {window.innerWidth <= 1000 ? '' : 'Descargar'}
                      </Button>
                      <Button
                        className='hidden md:flex'
                        color='danger'
                        variant='light'
                        onPress={onClose}
                      >
                        Cerrar
                      </Button>
                    </section>
                  </ModalFooter>
                </>
              )}
            </ModalContent>
          </Modal>
        </section>
      </Link>
    </Tooltip>
  )
}
