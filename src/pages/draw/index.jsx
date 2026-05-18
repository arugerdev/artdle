import { Topbar } from '../../components/topbar/index'
import { useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { Avatar, Button } from '@nextui-org/react'
import { useLocation, useSearch, Link as WouterLink } from 'wouter'
import supabase, { getUserData } from '../../utils/supabase'
import { resolveDrawImage } from '../../utils/image'
import { LikeButton } from '../../components/likeButton'
import { ShareButton } from '../../components/shareButton'
import { OptionsButton } from '../../components/optionsButton'
import { CommentsSection } from '../../components/commentsSection'
import { ReplayModal } from '../../components/replayModal'
import { DownloadIcon, PlayIcon } from '../../assets/icons'

export default function DrawPage () {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [author, setAuthor] = useState(null)
  const [replayOpen, setReplayOpen] = useState(false)
  const searchString = useSearch()
  const [id, setId] = useState(null)
  const [, pushLocation] = useLocation()

  useEffect(() => {
    const match = searchString.split('&').find(e => e.includes('id='))
    setId(match ? match.replace('id=', '') : null)
  }, [searchString])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    supabase
      .from('draws_with_meta')
      .select()
      .eq('id', id)
      .then(result => {
        const row = result.data?.[0] ?? null
        setData(row)
        if (row?.creator) getUserData(row.creator).then(setAuthor)
        setLoading(false)
      })
  }, [id])

  useEffect(() => {
    if (!id) return
    if (loading) return
    if (!data) pushLocation('/404')
  }, [id, data, loading, pushLocation])

  const imageSrc = data ? resolveDrawImage(data, { supabaseUrl: import.meta.env.VITE_SUPABASE_URL }) : null

  const handleDownload = () => {
    if (!imageSrc) return
    const a = document.createElement('a')
    a.href = imageSrc
    a.download = `${data.name}-${data.created_at}-draw.png`
    a.click()
  }

  return (
    <main className='flex flex-col gap-6 justify-start items-center h-full w-full min-w-screen min-h-screen pb-12'>
      <Toaster />
      <Topbar />
      <section className='flex flex-col p-4 gap-4 items-center justify-center w-full max-w-[1100px]'>
        {loading && (
          <div className='loader mt-12' role='status' aria-busy='true' aria-label='Cargando dibujo' />
        )}

        {!loading && data && (
          <>
            {/* Header: title + meta */}
            <header className='flex flex-col items-center gap-1 w-full text-center'>
              <small className='text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-zinc-500'>
                {data.daily_word ? `Palabra del día · ${data.daily_word}` : 'Dibujo'}
              </small>
              <h1 className='text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-zinc-50'>
                {data.name}
              </h1>
              <p className='text-xs font-mono text-slate-500 dark:text-zinc-400'>
                {new Date(data.created_at).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}
              </p>
            </header>

            {/* Image card */}
            <article className='ios-card w-full rounded-3xl p-3 sm:p-4'>
              <div className='w-full bg-white rounded-2xl overflow-hidden border border-slate-200/60 dark:border-zinc-700/60 shadow-inner'>
                <img
                  src={imageSrc}
                  alt={data.name}
                  className='w-full h-auto object-contain block'
                  style={{ aspectRatio: '960 / 540' }}
                />
              </div>

              {/* Action bar */}
              <div className='flex flex-row flex-wrap items-center justify-between gap-3 mt-3 px-1'>
                <div className='flex flex-row items-center gap-3 min-w-0'>
                  {author?.username
                    ? (
                      <WouterLink
                        href={`/u/${encodeURIComponent(author.username)}`}
                        className='flex flex-row items-center gap-2 hover:opacity-80 transition-opacity truncate'
                      >
                        <Avatar size='sm' src={author.avatar_url} className='border border-slate-200 dark:border-zinc-700 w-7 h-7' />
                        <strong className='text-sm text-slate-700 dark:text-zinc-200 truncate'>{author.username}</strong>
                      </WouterLink>
                    )
                    : (
                      <div className='flex flex-row items-center gap-2'>
                        <Avatar size='sm' className='border border-slate-200 dark:border-zinc-700 w-7 h-7' />
                        <span className='text-sm text-slate-500 dark:text-zinc-400'>Autor desconocido</span>
                      </div>
                    )}
                </div>

                <div className='flex flex-row items-center gap-2'>
                  <LikeButton data={data} />
                  <OptionsButton data={data} userData={author} />
                  <ShareButton data={data} dailyWord={data.daily_word} />
                  <Button
                    isIconOnly
                    radius='full'
                    aria-label='Ver timelapse'
                    onPress={() => setReplayOpen(true)}
                    className='bg-white/70 dark:bg-zinc-800/70 border border-slate-200/60 dark:border-zinc-700/60 text-slate-700 dark:text-zinc-200'
                  >
                    <PlayIcon size={18} />
                  </Button>
                  <Button
                    isIconOnly
                    radius='full'
                    aria-label='Descargar PNG'
                    onPress={handleDownload}
                    className='bg-slate-900 text-white dark:bg-zinc-50 dark:text-slate-900 hover:bg-slate-700 dark:hover:bg-zinc-200'
                  >
                    <DownloadIcon size={18} />
                  </Button>
                </div>
              </div>
            </article>

            {/* Comments */}
            <section className='ios-card w-full rounded-3xl p-4 mt-2'>
              <CommentsSection drawId={data.id} />
            </section>

            <ReplayModal
              isOpen={replayOpen}
              onClose={() => setReplayOpen(false)}
              drawId={data.id}
              drawName={data.name}
            />
          </>
        )}

        {!loading && !data && (
          <section className='ios-card flex flex-col items-center justify-center p-8 mt-6 max-w-md rounded-3xl text-center'>
            <h1 className='font-bold text-2xl text-slate-900 dark:text-zinc-100'>
              Dibujo no encontrado
            </h1>
            <p className='text-slate-500 dark:text-zinc-400 mt-2'>
              No existe ningún dibujo con identificador <strong>{id}</strong>.
            </p>
          </section>
        )}
      </section>
    </main>
  )
}
