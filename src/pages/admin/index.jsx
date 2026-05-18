import { useEffect, useState } from 'react'
import { Toaster, default as toast } from 'react-hot-toast'
import { Button, Image } from '@nextui-org/react'
import supabase from '../../utils/supabase'
import { Topbar } from '../../components/topbar/index'
import { resolveDrawImage } from '../../utils/image'

export default function AdminPage () {
  const [checking, setChecking] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [reports, setReports] = useState([])
  const [drawsById, setDrawsById] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsAdmin(false)
        setChecking(false)
        return
      }
      const { data, error } = await supabase.rpc('is_admin')
      if (error) {
        console.warn('is_admin RPC failed:', error.message)
        setIsAdmin(false)
      } else {
        setIsAdmin(!!data)
      }
      setChecking(false)
    })()
  }, [])

  const load = async () => {
    setLoading(true)
    const { data: reportRows, error } = await supabase
      .from('reports')
      .select('id, report_text, draw_id, created_at, created_by')
      .order('created_at', { ascending: false })
      .limit(100)
    if (error) {
      toast.error('No se pudieron cargar los reportes: ' + error.message)
      setLoading(false)
      return
    }
    setReports(reportRows ?? [])
    const ids = [...new Set((reportRows ?? []).map(r => r.draw_id))]
    if (ids.length > 0) {
      const { data: draws } = await supabase
        .from('draws_with_meta')
        .select('id, name, uridata, storage_path, creator_username')
        .in('id', ids)
      setDrawsById(Object.fromEntries((draws ?? []).map(d => [d.id, d])))
    }
    setLoading(false)
  }

  useEffect(() => {
    if (isAdmin) load()
  }, [isAdmin])

  const deleteDraw = async drawId => {
    if (!window.confirm('¿Eliminar este dibujo? Esta acción no se puede deshacer.')) return
    const { error } = await supabase.from('draws').delete().eq('id', drawId)
    if (error) toast.error('Error: ' + error.message)
    else { toast.success('Dibujo eliminado'); load() }
  }
  const dismissReport = async reportId => {
    const { error } = await supabase.from('reports').delete().eq('id', reportId)
    if (error) toast.error('Error: ' + error.message)
    else { toast.success('Reporte descartado'); load() }
  }

  return (
    <main className='flex flex-col gap-8 justify-start items-center h-full w-full min-w-screen min-h-screen'>
      <Toaster />
      <Topbar />
      <section className='flex flex-col w-full max-w-[1200px] px-4 gap-4'>
        <h1 className='text-3xl font-extrabold'>Admin</h1>
        {checking && <div className='loader' role='status' aria-busy='true'></div>}
        {!checking && !isAdmin && (
          <section className='flex flex-col items-center text-center p-6'>
            <h2 className='font-bold text-xl'>Acceso denegado</h2>
            <p className='text-gray-500'>
              Esta sección está reservada para administradores. Si crees que
              deberías tener acceso, contacta con el administrador del sistema.
            </p>
          </section>
        )}
        {!checking && isAdmin && (
          <>
            <h2 className='text-xl font-bold'>Reportes pendientes ({reports.length})</h2>
            {loading && <div className='loader' role='status' aria-busy='true'></div>}
            {!loading && reports.length === 0 && (
              <p className='text-gray-500'>No hay reportes pendientes. 🎉</p>
            )}
            <ul className='flex flex-col gap-3'>
              {reports.map(r => {
                const draw = drawsById[r.draw_id]
                const imgSrc = draw
                  ? resolveDrawImage(draw, { supabaseUrl: import.meta.env.VITE_SUPABASE_URL })
                  : null
                return (
                  <li key={r.id} className='flex flex-row gap-4 bg-slate-50 p-3 rounded-md shadow-sm'>
                    {imgSrc && (
                      <Image src={imgSrc} className='w-32 h-auto rounded-sm' alt={draw?.name ?? ''} />
                    )}
                    <div className='flex flex-col gap-1 flex-grow'>
                      <strong>{draw?.name ?? `(dibujo #${r.draw_id})`}</strong>
                      <small className='text-gray-500'>
                        Autor: {draw?.creator_username ?? '?'} ·
                        Reportado por {r.created_by?.slice(0, 8)}… ·
                        {new Date(r.created_at).toLocaleString('es-ES')}
                      </small>
                      <p className='text-sm whitespace-pre-wrap'>{r.report_text}</p>
                      <div className='flex flex-row gap-2 mt-1'>
                        <Button size='sm' color='warning' variant='flat' onPress={() => dismissReport(r.id)}>
                          Descartar reporte
                        </Button>
                        <Button size='sm' color='danger' variant='flat' onPress={() => deleteDraw(r.draw_id)}>
                          Eliminar dibujo
                        </Button>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </section>
    </main>
  )
}
