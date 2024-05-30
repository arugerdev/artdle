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
  Image
} from '@nextui-org/react'
import {
  DownloadIcon,
  FacebookIcon,
  LinkedinIcon,
  ShareIcon,
  TelegramIcon,
  TwitterIcon,
  WhatsappIcon
} from '../../assets/icons'
import { Tooltip } from '@nextui-org/react'
import { LikeButton } from './../likeButton/index'
import { getDailyWord } from '../../utils/supabase'
import { useEffect, useState } from 'react'
import { OptionsButton } from './../optionsButton/index'
import { isMobile } from '../../utils/system'
import { ToolBarButton } from '../toolBarButton'
import { CopyDetail } from '../copyDetail'
export const DrawCard = ({ data, className = '' }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [dailyWord, setDailyWord] = useState('')

  useEffect(() => {
    getDailyWord(data.created_at.split('+')[0].split('T')[0]).then(word => {
      setDailyWord(word)
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
        className={` w-full max-w-[300px] h-full cursor-pointer ${className}`}
      >
        <section className='flex flex-col border-r-2 items-center justify-center w-full text-center shadow-lg h-auto rounded-lg text-black bg-white gap-2 p-2'>
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

          <Modal
            backdrop='blur'
            className='flex w-[60%] h-[90%] max-w-full'
            isOpen={isOpen}
            onClose={onClose}
          >
            <ModalContent>
              {onClose => (
                <>
                  <ModalHeader className='flex flex-col gap-0 w-full'>
                    <h1 className='font-extrabold'>{data.name}</h1>
                    <small className='text-slate-500 font-normal text-sm'>
                      Dibujado:{' '}
                      {data.created_at
                        .split('+')[0]
                        .split('T')[1]
                        .split('.')[0] +
                        ' ' +
                        data.created_at.split('+')[0].split('T')[0]}
                    </small>
                    <small className='text-slate-500 font-normal text-sm'>
                      Palabra del dia: {dailyWord}
                    </small>
                  </ModalHeader>
                  <ModalBody className='overflow-hidden'>
                    <Image
                      width={1920}
                      height={1080}
                      isBlurred
                      className='object-fill rounded-sm'
                      src={data.uridata}
                      alt={data.name}
                    />
                  </ModalBody>
                  <ModalFooter>
                    <section className='flex flex-row justify-start w-full'>
                      <LikeButton data={data} />
                    </section>

                    <section className='flex flex-row justify-end gap-2 w-full'>
                      <OptionsButton data={data} />
                      <ToolBarButton
                        icon={<ShareIcon className='w-full h-full' />}
                        onPress={null}
                        isDisabled={false}
                        modal
                        modalContent={
                          data && (
                            <>
                              <CopyDetail
                                title='Link'
                                toCopy={`https://artdle.com/draw/${data.id}`}
                              />
                              <h1 className='w-full text-center font-extrabold pt-4'>
                                Redes sociales
                              </h1>
                              <section className='flex flex-row items-center justify-center gap-4 p-4'>
                                <Button
                                  as={Link}
                                  href={`https://twitter.com/intent/post?text=Mira%20lo%20que%20he%20dibujado%20hoy%20en%20Artdle.com!%0ALa%20palabra%20de%20hoy%20es%20${dailyWord}%0A&url=https%3A%2F%2Fartdle.com%2Fdraw%2F${data.id}`}
                                  className='bg-[#00acee]'
                                  target='_blank'
                                  color='primary'
                                  startContent={
                                    <TwitterIcon className='w-full h-full p-px text-white' />
                                  }
                                >
                                  Compartir
                                </Button>
                                <Button
                                  as={Link}
                                  href={`https://www.linkedin.com/shareArticle?mini=true&url=https%3A//artdle.com/draw/${data.id}`}
                                  className='bg-[#0e76a8]'
                                  target='_blank'
                                  color='primary'
                                  startContent={
                                    <LinkedinIcon className='w-full h-full p-px text-white' />
                                  }
                                >
                                  Compartir
                                </Button>
                                <Button
                                  as={Link}
                                  href={`https://www.facebook.com/sharer/sharer.php?u=https%3A//artdle.com/draw/${data.id}`}
                                  className='bg-[#3b5998]'
                                  target='_blank'
                                  color='primary'
                                  startContent={
                                    <FacebookIcon className='w-full h-full p-px text-white' />
                                  }
                                >
                                  Compartir
                                </Button>
                                <Button
                                  as={Link}
                                  href={`https://wa.me/?text=Mira%20lo%20que%20he%20dibujado%20hoy%20en%20Artdle.com!%0ALa%20palabra%20de%20hoy%20es%20${dailyWord}%0Ahttps%3A%2F%2Fartdle.com%2Fdraw%2F${data.id}`}
                                  className='bg-[#25D366]'
                                  target='_blank'
                                  color='primary'
                                  startContent={
                                    <WhatsappIcon className='w-full h-full p-px text-white' />
                                  }
                                >
                                  Compartir
                                </Button>
                              </section>
                            </>
                          )
                        }
                        name={'Compartir dibujo'}
                        placement='top'
                        description={
                          'Puedes copiar el enlace al dibujo o compartirlo por redes sociales como Twitter'
                        }
                      />
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
                      >
                        Descargar
                      </Button>
                      <Button color='danger' variant='light' onPress={onClose}>
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
