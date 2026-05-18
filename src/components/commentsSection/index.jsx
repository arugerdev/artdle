/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'
import { Avatar, Button, Textarea } from '@nextui-org/react'
import toast from 'react-hot-toast'
import { Link } from 'wouter'
import supabase from '../../utils/supabase'

const MAX_LEN = 280

export const CommentsSection = ({ drawId }) => {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [user, setUser] = useState(null)
  const [posting, setPosting] = useState(false)

  const load = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('comments')
      .select('id, text, created_at, author')
      .eq('draw_id', drawId)
      .order('created_at', { ascending: false })
      .limit(50)
    if (error) {
      toast.error('No se pudieron cargar los comentarios')
      setLoading(false)
      return
    }
    const rows = data ?? []
    // Fetch authoring profiles in a single round trip and merge in.
    const authorIds = [...new Set(rows.map(r => r.author))]
    if (authorIds.length === 0) {
      setComments(rows)
      setLoading(false)
      return
    }
    const { data: profileRows } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .in('id', authorIds)
    const byId = Object.fromEntries((profileRows ?? []).map(p => [p.id, p]))
    setComments(rows.map(r => ({ ...r, profile: byId[r.author] ?? null })))
    setLoading(false)
  }

  useEffect(() => {
    if (!drawId) return
    load()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawId])

  const send = async () => {
    if (!user || !user.email) {
      toast('Inicia sesión para comentar')
      return
    }
    const trimmed = text.trim()
    if (!trimmed) return
    if (trimmed.length > MAX_LEN) {
      toast.error(`Máximo ${MAX_LEN} caracteres`)
      return
    }
    setPosting(true)
    const { error } = await supabase
      .from('comments')
      .insert({ draw_id: drawId, author: user.id, text: trimmed })
    setPosting(false)
    if (error) {
      toast.error('No se pudo publicar: ' + error.message)
      return
    }
    setText('')
    load()
  }

  return (
    <section className='flex flex-col gap-3 w-full' aria-label='Comentarios'>
      <h2 className='text-sm uppercase tracking-widest font-medium text-slate-500 dark:text-zinc-400 pb-1'>
        Comentarios {comments.length > 0 ? `(${comments.length})` : ''}
      </h2>
      {user && user.email && (
        <div className='flex flex-col gap-2'>
          <Textarea
            size='sm'
            value={text}
            onValueChange={setText}
            placeholder='Escribe un comentario...'
            maxLength={MAX_LEN + 50}
            classNames={{ input: 'min-h-[60px]' }}
          />
          <div className='flex flex-row items-center justify-end gap-2'>
            <small className={text.length > MAX_LEN ? 'text-red-500' : 'text-gray-500'}>
              {text.length}/{MAX_LEN}
            </small>
            <Button
              size='sm'
              color='primary'
              isLoading={posting}
              isDisabled={text.trim().length < 1 || text.length > MAX_LEN}
              onPress={send}
            >
              Publicar
            </Button>
          </div>
        </div>
      )}
      {(!user || !user.email) && (
        <p className='text-sm text-slate-500 dark:text-zinc-400'>Inicia sesión para comentar.</p>
      )}
      {loading && <div className='loader' role='status' aria-busy='true'></div>}
      {!loading && comments.length === 0 && (
        <p className='text-sm text-slate-500 dark:text-zinc-400'>Aún no hay comentarios. ¡Sé el primero!</p>
      )}
      <ul className='flex flex-col gap-2'>
        {comments.map(c => (
          <li key={c.id} className='ios-card flex flex-row gap-2 items-start p-3 rounded-2xl'>
            <Avatar size='sm' src={c.profile?.avatar_url} />
            <div className='flex flex-col gap-0 w-full'>
              <div className='flex flex-row items-center gap-2'>
                {c.profile?.username
                  ? (
                    <Link
                      href={`/u/${encodeURIComponent(c.profile.username)}`}
                      className='font-bold text-sm hover:underline'
                    >
                      {c.profile.username}
                    </Link>
                  )
                  : <strong className='text-sm text-slate-700 dark:text-zinc-200'>Autor desconocido</strong>}
                <small className='text-slate-400 dark:text-zinc-500 text-xs font-mono'>
                  {new Date(c.created_at).toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                </small>
              </div>
              <p className='text-sm whitespace-pre-wrap break-words text-slate-800 dark:text-zinc-200'>{c.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
