import { useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { Avatar } from '@nextui-org/react'
import { useParams } from 'wouter'
import supabase from '../../utils/supabase'
import { Topbar } from '../../components/topbar/index'
import { DrawCard } from '../../components/drawCard'

export default function ProfilePage () {
  const { username } = useParams()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [draws, setDraws] = useState([])

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
      const { data: drawRows } = await supabase
        .from('draws_with_meta')
        .select('*')
        .eq('creator', profileRow.id)
        .order('created_at', { ascending: false })
        .limit(40)
      if (cancelled) return
      setDraws(drawRows ?? [])
      setLoading(false)
    })()
    return () => { cancelled = true }
  }, [username])

  const totalLikes = draws.reduce((acc, d) => acc + (d.likes_count ?? 0), 0)

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
        <section className='flex flex-col items-center justify-center p-6 text-center'>
          <h1 className='font-extrabold text-2xl'>Usuario no encontrado 🔍</h1>
          <p className='text-gray-500 mt-2'>
            No existe ningún perfil con el nombre <strong>{username}</strong>.
          </p>
        </section>
      )}
      {!loading && profile && (
        <>
          <section className='flex flex-col items-center justify-center gap-2 px-4 pt-4 w-full max-w-[800px]'>
            <Avatar src={profile.avatar_url} size='lg' className='w-24 h-24 text-large' />
            <h1 className='text-3xl font-extrabold'>{profile.username}</h1>
            {profile.full_name && (
              <p className='text-gray-500'>{profile.full_name}</p>
            )}
            <div className='flex flex-row gap-6 mt-2'>
              <div className='flex flex-col items-center'>
                <span className='font-bold text-xl'>{draws.length}</span>
                <span className='text-xs text-gray-500'>Dibujos</span>
              </div>
              <div className='flex flex-col items-center'>
                <span className='font-bold text-xl'>{totalLikes}</span>
                <span className='text-xs text-gray-500'>Likes recibidos</span>
              </div>
            </div>
          </section>
          <section className='w-full max-w-[1560px] px-4 pb-8'>
            <h2 className='text-xl font-bold border-b-2 border-b-[#555] mb-4'>
              Galería
            </h2>
            {draws.length === 0 && (
              <div className='flex flex-col items-center justify-center text-center text-gray-500 py-12'>
                <p>Este artista todavía no ha subido nada 😶</p>
              </div>
            )}
            {draws.length > 0 && (
              <section className='w-full grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-2 bg-slate-100 p-4 rounded-xl shadow-lg'>
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
