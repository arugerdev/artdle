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
import { DownloadIcon, PlayIcon } from '../../assets/icons'
import { Tooltip } from '@nextui-org/react'
import { LikeButton } from './../likeButton/index'
import { getDailyWord, getUserData } from '../../utils/supabase'
import { useEffect, useState } from 'react'
import { OptionsButton } from './../optionsButton/index'
import { isMobile } from '../../utils/system'
import { ShareButton } from './../shareButton/index'
import { resolveDrawImage } from '../../utils/image'
import { ReplayModal } from '../replayModal'
import { CommentsSection } from '../commentsSection'
import { Link as WouterLink } from 'wouter'
export const DrawCard = ({ data, className = '', position = null }) => {
  const imageSrc = resolveDrawImage(data, { supabaseUrl: import.meta.env.VITE_SUPABASE_URL })
  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isOpen: replayOpen,
    onOpen: openReplay,
    onClose: closeReplay
  } = useDisclosure()

  // Prefer joined-view fields when present; fall back to lazy fetches
  // so the card still works if invoked with a plain `draws` row.
  const joined = data.creator_username !== undefined || data.daily_word !== undefined
  const [dailyWord, setDailyWord] = useState(joined ? (data.daily_word ?? '') : '')
  const [userData, setUserData] = useState(
    joined
      ? {
          username: data.creator_username,
          full_name: data.creator_full_name,
          avatar_url: data.creator_avatar_url
        }
      : null
  )

  useEffect(() => {
    if (joined) return
    getDailyWord(data.created_at.split('+')[0].split('T')[0]).then(word => {
      setDailyWord(word)
    })

    getUserData(data.creator).then(profile => {
      setUserData(profile)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.id, joined])

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
        className={`w-full max-w-[500px] h-full cursor-pointer group ${className}`}
      >
        <section className='ios-card flex flex-col items-center justify-start w-full text-center h-auto rounded-2xl gap-2 p-2 text-slate-900 dark:text-zinc-100 transition-all duration-300 group-hover:-translate-y-1'>
          {position && (
            <p className='text-2xl leading-none' aria-label={`Posición ${position}`}>
              {position === 1
                ? '👑'
                : position === 2
                ? '🥈'
                : position === 3
                ? '🥉'
                : <span className='font-mono text-sm text-slate-500 dark:text-zinc-500'>#{position}</span>}
            </p>
          )}
          <div className='w-full rounded-xl overflow-hidden bg-white'>
            <Image
              src={imageSrc}
              radius='none'
              alt={`Dibujo "${data.name}" — palabra del día: ${data.daily_word ?? dailyWord ?? '?'}`}
              isZoomed={!isMobile()}
              classNames={{ wrapper: 'w-full !max-w-none' }}
            />
          </div>
          <div className='flex flex-row w-full items-center justify-center gap-2 px-2'>
            <section className='flex flex-col items-start justify-center text-start w-full truncate gap-0'>
              <h1 className='font-semibold truncate w-full text-slate-900 dark:text-zinc-100 text-sm'>{data.name}</h1>
              <small className='text-slate-500 dark:text-zinc-500 text-[10px] font-mono'>
                {new Date(data.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
              </small>
            </section>
            <LikeButton data={data} />
          </div>
          <div className='flex flex-row w-full items-center justify-start gap-2 pt-2 px-2 pb-1 border-t border-slate-200/60 dark:border-zinc-800/60'>
            <Avatar size='sm' src={userData?.avatar_url} className='border border-slate-200 dark:border-zinc-700 w-6 h-6' />
            <small className='text-slate-600 dark:text-zinc-400 font-normal text-xs truncate'>
              {userData?.username ?? 'Autor desconocido'}
            </small>
          </div>
          <Modal
            backdrop='blur'
            className='flex w-[100%] md:w-[60%] h-[90%] max-w-full'
            isOpen={isOpen}
            onClose={onClose}
            classNames={{
              base: 'ios-card text-slate-900 dark:text-zinc-100',
              closeButton: 'text-slate-500 dark:text-zinc-400'
            }}
          >
            <ModalContent>
              {onClose => (
                <>
                  <ModalHeader className='flex flex-col pb-0 pt-2 md:p-4 gap-0 w-full'>
                    <h1 className='font-extrabold text-sm md:text-md text-slate-900 dark:text-zinc-100'>
                      {data.name}
                    </h1>
                    <small className='text-slate-500 dark:text-zinc-400 font-normal text-xs font-mono'>
                      Dibujado: {new Date(data.created_at).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}
                    </small>
                    <small className='text-slate-500 dark:text-zinc-400 font-normal text-xs'>
                      Palabra del día: <span className='text-slate-700 dark:text-zinc-200 font-medium'>{dailyWord}</span>
                    </small>
                    <div className='flex flex-row items-center justify-start gap-2 mt-1'>
                      <Avatar size='sm' src={userData?.avatar_url} className='border border-slate-200 dark:border-zinc-700 w-6 h-6' />
                      <small className='text-slate-600 dark:text-zinc-300 font-normal text-sm'>
                        {userData?.username
                          ? (
                            <WouterLink
                              href={`/u/${encodeURIComponent(userData.username)}`}
                              className='hover:underline'
                            >
                              <strong>{userData.username}</strong>
                            </WouterLink>
                          )
                          : <strong>Autor desconocido</strong>}
                      </small>
                    </div>
                  </ModalHeader>
                  <ModalBody className='flex flex-col items-start justify-start gap-3 p-3 w-full h-full overflow-auto'>
                    <div className='w-full bg-white rounded-xl overflow-hidden border border-slate-200/60 dark:border-zinc-700/60'>
                      <Image
                        radius='none'
                        className='w-full object-scale-down'
                        src={imageSrc}
                        alt={data.name}
                        classNames={{ wrapper: 'w-full !max-w-none' }}
                      />
                    </div>
                    <CommentsSection drawId={data.id} />
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
                        color='secondary'
                        variant='flat'
                        onPress={openReplay}
                        startContent={<PlayIcon />}
                        isIconOnly={window.innerWidth <= 1000}
                        aria-label='Ver timelapse'
                      >
                        {window.innerWidth <= 1000 ? '' : 'Timelapse'}
                      </Button>
                      <Button
                        color='success'
                        variant='flat'
                        onPress={() => {
                          var a = document.createElement('a')
                          a.href = imageSrc
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
          <ReplayModal
            isOpen={replayOpen}
            onClose={closeReplay}
            drawId={data.id}
            drawName={data.name}
          />
        </section>
      </Link>
    </Tooltip>
  )
}
