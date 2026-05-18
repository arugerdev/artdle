import { useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { Avatar, Tooltip } from '@nextui-org/react'
import { useParams } from 'wouter'
import supabase from '../../utils/supabase'
import { Topbar } from '../../components/topbar/index'
import { DrawCard } from '../../components/drawCard'
import { earnedBadges } from '../../utils/badges'

export default function ProfilePage () {
  const { username } = useParams()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [draws, setDraws] = useState([])
  const [stats, setStats] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    ;(async () => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .ilike('username', username)
        .limit(1)
      if (cancelled) return
      if (error || !profiles || profiles.length === 0) {
        setProfile(null)
        setLoading(false)
        return
      }
      const profileRow = profiles[0]
      setProfile(profileRow)
      const [drawsResp, statsResp] = await Promise.all([
        supabase
          .from('draws_with_meta')
          .select('*')
          .eq('creator', profileRow.id)
          .order('created_at', { ascending: false })
          .limit(40),
        supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', profileRow.id)
          .maybeSingle()
      ])
      if (cancelled) return
      setDraws(drawsResp.data ?? [])
      setStats(statsResp.data ?? null)
      setLoading(false)
    })()
    return () => { cancelled = true }
  }, [username])

  const totalLikes = draws.reduce((acc, d) => acc + (d.likes_count ?? 0), 0)
  const badges = earnedBadges({ ...(stats ?? {}), total_likes: totalLikes })

  return (
    <main className='flex flex-col gap-8 justify-start items-center h-full w-full min-w-screen min-h-screen'>
      <Toaster />
      <Topbar />
      {loading && (
        <section className='flex flex-col items-center justify-center h-[60vh] w-full' role='status' aria-busy='true'>
          <div className='loader'></div>
        </section>
      )}
      {!loading && !profile && (
        <section className='ios-card flex flex-col items-center justify-center p-8 text-center mt-6 rounded-3xl max-w-md'>
          <h1 className='font-bold text-2xl text-slate-900 dark:text-zinc-100'>Usuario no encontrado 🔍</h1>
          <p className='text-slate-500 dark:text-zinc-400 mt-2'>
            No existe ningún perfil con el nombre <strong>{username}</strong>.
          </p>
        </section>
      )}
      {!loading && profile && (
        <>
          <section className='ios-card flex flex-col items-center justify-center gap-2 px-4 py-6 mt-4 w-full max-w-md rounded-3xl'>
            <Avatar src={profile.avatar_url} size='lg' className='w-24 h-24 text-large ring-2 ring-slate-200 dark:ring-zinc-700' />
            <h1 className='text-3xl font-bold text-slate-900 dark:text-zinc-50'>{profile.username}</h1>
            {profile.full_name && (
              <p className='text-slate-500 dark:text-zinc-400'>{profile.full_name}</p>
            )}
            <div className='flex flex-row gap-6 mt-2 text-slate-900 dark:text-zinc-100'>
              <div className='flex flex-col items-center'>
                <span className='font-bold text-xl'>{stats?.total_draws ?? draws.length}</span>
                <span className='text-[10px] uppercase tracking-widest text-slate-500 dark:text-zinc-500'>Dibujos</span>
              </div>
              <div className='flex flex-col items-center'>
                <span className='font-bold text-xl'>{totalLikes}</span>
                <span className='text-[10px] uppercase tracking-widest text-slate-500 dark:text-zinc-500'>Likes</span>
              </div>
              <div className='flex flex-col items-center'>
                <span className='font-bold text-xl'>🔥 {stats?.current_streak ?? 0}</span>
                <span className='text-[10px] uppercase tracking-widest text-slate-500 dark:text-zinc-500'>Racha</span>
              </div>
              <div className='flex flex-col items-center'>
                <span className='font-bold text-xl'>{stats?.longest_streak ?? 0}</span>
                <span className='text-[10px] uppercase tracking-widest text-slate-500 dark:text-zinc-500'>Mejor</span>
              </div>
            </div>
            {badges.length > 0 && (
              <div className='flex flex-row flex-wrap gap-2 justify-center mt-2'>
                {badges.map(b => (
                  <Tooltip key={b.id} content={b.label} placement='bottom'>
                    <span className='text-2xl select-none' aria-label={b.label}>
                      {b.emoji}
                    </span>
                  </Tooltip>
                ))}
              </div>
            )}
          </section>
          <section className='w-full max-w-[1560px] px-4 pb-8'>
            <h2 className='text-sm uppercase tracking-widest font-medium text-slate-500 dark:text-zinc-400 mb-4 px-1'>
              Galería
            </h2>
            {draws.length === 0 && (
              <div className='ios-card flex flex-col items-center justify-center text-center text-slate-500 dark:text-zinc-400 py-12 rounded-2xl'>
                <p>Este artista todavía no ha subido nada 😶</p>
              </div>
            )}
            {draws.length > 0 && (
              <section className='w-full grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3'>
                {draws.map(d => (
                  <DrawCard key={d.id} data={d} />
                ))}
              </section>
            )}
          </section>
        </>
      )}
    </main>
  )
}
