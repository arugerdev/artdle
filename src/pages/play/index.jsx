import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLocation, useParams } from 'wouter'
import { Toaster, default as toast } from 'react-hot-toast'
import { Button, Input, Slider } from '@nextui-org/react'
import supabase, { getDailyWord } from '../../utils/supabase'
import { Topbar } from '../../components/topbar/index'
import { TOOLS } from '../../utils/tools'
import { strokePath } from '../../utils/canvasRender'

const VW = 960
const VH = 540

function makeCode () {
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = ''
  for (let i = 0; i < 6; i++) out += A[Math.floor(Math.random() * A.length)]
  return out
}

function LobbyView () {
  const [, navigate] = useLocation()
  const [joinCode, setJoinCode] = useState('')
  const [creating, setCreating] = useState(false)

  const createRoom = async () => {
    setCreating(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast('Inicia sesión para crear una sala')
        return
      }
      const today = new Date().toISOString().split('T')[0]
      const word = await getDailyWord(today)
      const code = makeCode()
      const { error } = await supabase
        .from('rooms')
        .insert({ code, host_id: user.id, word, status: 'open' })
      if (error) throw error
      navigate('/play/' + code)
    } catch (e) {
      toast.error('No se pudo crear la sala: ' + (e?.message ?? e))
    } finally {
      setCreating(false)
    }
  }

  const join = () => {
    const trimmed = joinCode.trim().toUpperCase()
    if (trimmed.length < 4) return toast.error('Código demasiado corto')
    navigate('/play/' + trimmed)
  }

  return (
    <section className='ios-card flex flex-col items-center gap-4 p-6 max-w-md w-full rounded-3xl mt-4'>
      <h1 className='text-3xl font-bold text-slate-900 dark:text-zinc-50'>Jugar en vivo 🎮</h1>
      <p className='text-slate-500 dark:text-zinc-400 text-center text-sm'>
        Crea una sala compartida o únete a una existente con su código de 6
        caracteres. Todos los jugadores dibujan a la vez sobre el mismo
        lienzo, viendo los trazos en tiempo real.
      </p>
      <Button
        size='lg'
        radius='full'
        onPress={createRoom}
        isLoading={creating}
        className='bg-slate-900 text-white dark:bg-zinc-50 dark:text-slate-900 w-full font-semibold'
      >
        Crear sala
      </Button>
      <div className='flex flex-col w-full gap-2'>
        <Input
          variant='bordered'
          label='Código de sala'
          placeholder='ABCDEF'
          value={joinCode}
          onValueChange={setJoinCode}
          maxLength={6}
          classNames={{
            label: 'text-slate-500 dark:text-zinc-400',
            inputWrapper: 'bg-white/60 dark:bg-zinc-900/40 border-slate-200 dark:border-zinc-700',
            input: 'text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500'
          }}
        />
        <Button onPress={join} variant='flat' radius='full' className='ios-chip text-slate-700 dark:text-zinc-200'>
          Unirse
        </Button>
      </div>
    </section>
  )
}

// eslint-disable-next-line react/prop-types
function RoomView ({ code }) {
  const [, navigate] = useLocation()
  const [room, setRoom] = useState(null)
  const [color, setColor] = useState('#000000')
  const [size, setSize] = useState(10)
  const [strokeCount, setStrokeCount] = useState(0)
  const canvasRef = useRef(null)
  const liveCanvasRef = useRef(null)
  const userRef = useRef(null)
  const seenIdsRef = useRef(new Set())
  const isDrawingRef = useRef(false)
  const currentStrokeRef = useRef(null)
  const rafRef = useRef(0)

  // ----------------------------------------------------------------
  // Initial load: resolve the room + replay existing strokes.
  // ----------------------------------------------------------------
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      userRef.current = user
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', code)
        .maybeSingle()
      if (cancelled) return
      if (error || !data) {
        toast.error('Sala no encontrada')
        navigate('/play')
        return
      }
      setRoom(data)
      const { data: existing } = await supabase
        .from('room_strokes')
        .select('stroke, player_id, id')
        .eq('room_id', data.id)
        .order('created_at', { ascending: true })
        .limit(1000)
      if (cancelled) return
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        const dpr = window.devicePixelRatio || 1
        canvas.width = VW * dpr
        canvas.height = VH * dpr
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        ctx.fillStyle = '#fff'
        ctx.fillRect(0, 0, VW, VH)
        for (const r of existing ?? []) {
          seenIdsRef.current.add(r.id)
          strokePath(ctx, r.stroke)
        }
        setStrokeCount(existing?.length ?? 0)
      }
      const live = liveCanvasRef.current
      if (live) {
        const dpr = window.devicePixelRatio || 1
        live.width = VW * dpr
        live.height = VH * dpr
        live.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0)
      }
    })()
    return () => { cancelled = true }
  }, [code, navigate])

  // ----------------------------------------------------------------
  // Realtime subscription: append incoming strokes from other players.
  // Our own strokes are already painted client-side, so we dedupe on
  // server-issued row id.
  // ----------------------------------------------------------------
  useEffect(() => {
    if (!room?.id) return
    const channel = supabase
      .channel('room_strokes:' + room.id)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'room_strokes',
        filter: `room_id=eq.${room.id}`
      }, payload => {
        const r = payload.new
        if (seenIdsRef.current.has(r.id)) return
        seenIdsRef.current.add(r.id)
        const ctx = canvasRef.current?.getContext('2d')
        if (ctx) strokePath(ctx, r.stroke)
        setStrokeCount(n => n + 1)
      })
      .subscribe()
    return () => { channel.unsubscribe() }
  }, [room?.id])

  // ----------------------------------------------------------------
  // Pointer handling.
  // ----------------------------------------------------------------
  const clientToCanvas = e => {
    const rect = liveCanvasRef.current.getBoundingClientRect()
    return {
      x: ((e.clientX - rect.left) / rect.width) * VW,
      y: ((e.clientY - rect.top) / rect.height) * VH
    }
  }

  const drawLive = () => {
    rafRef.current = 0
    const ctx = liveCanvasRef.current?.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, VW, VH)
    if (currentStrokeRef.current) strokePath(ctx, currentStrokeRef.current)
  }

  const onDown = e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    e.preventDefault()
    try { liveCanvasRef.current?.setPointerCapture?.(e.pointerId) } catch { /* noop */ }
    const { x, y } = clientToCanvas(e)
    currentStrokeRef.current = {
      tool: TOOLS.PENCIL,
      points: [x, y, x, y],
      stroke: color,
      strokeWidth: size
    }
    isDrawingRef.current = true
    if (!rafRef.current) rafRef.current = requestAnimationFrame(drawLive)
  }
  const onMove = e => {
    if (!isDrawingRef.current || !currentStrokeRef.current) return
    e.preventDefault()
    const { x, y } = clientToCanvas(e)
    currentStrokeRef.current.points.push(x, y)
    if (!rafRef.current) rafRef.current = requestAnimationFrame(drawLive)
  }
  const onUp = async e => {
    if (!isDrawingRef.current) return
    isDrawingRef.current = false
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
    }
    const stroke = currentStrokeRef.current
    currentStrokeRef.current = null

    // Commit to bottom canvas + clear overlay
    const ctx = canvasRef.current?.getContext('2d')
    if (stroke && ctx) strokePath(ctx, stroke)
    liveCanvasRef.current?.getContext('2d')?.clearRect(0, 0, VW, VH)
    try { liveCanvasRef.current?.releasePointerCapture?.(e.pointerId) } catch { /* noop */ }

    // Send to peers via DB
    if (!room || !userRef.current || !stroke) return
    setStrokeCount(n => n + 1)
    const { error } = await supabase.from('room_strokes').insert({
      room_id: room.id,
      player_id: userRef.current.id,
      stroke
    })
    if (error) console.warn('[Room] persist failed:', error.message)
  }

  // ----------------------------------------------------------------
  // Resize: keep the CSS aspect-ratio responsive.
  // ----------------------------------------------------------------
  useLayoutEffect(() => {
    // canvas backing store already sized in load effect; no resize handler
    // needed because CSS handles fluid sizing via aspect-ratio.
  }, [])

  return (
    <section className='flex flex-col items-center gap-3 p-4 w-full max-w-[1100px]'>
      <div className='ios-card flex flex-row items-center gap-3 w-full justify-between rounded-2xl p-3'>
        <div className='flex flex-col'>
          <h1 className='font-bold text-xl text-slate-900 dark:text-zinc-50'>
            Sala <span className='font-mono text-base bg-slate-100 dark:bg-zinc-800 px-2 rounded ml-1'>{code}</span>
          </h1>
          {room?.word && (
            <small className='text-slate-500 dark:text-zinc-400'>Palabra: <strong className='text-slate-700 dark:text-zinc-200'>{room.word}</strong></small>
          )}
        </div>
        <Button
          size='sm'
          radius='full'
          onPress={() => {
            navigator.clipboard?.writeText(window.location.href).then(
              () => toast.success('Enlace copiado'),
              () => toast.error('No se pudo copiar')
            )
          }}
          className='bg-slate-900 text-white dark:bg-zinc-50 dark:text-slate-900 font-semibold'
        >
          Compartir enlace
        </Button>
      </div>
      {!room && <div className='loader' role='status' aria-busy='true'></div>}
      {room && (
        <>
          <div className='ios-card flex flex-row items-center gap-3 p-2 rounded-2xl w-full'>
            <input
              type='color'
              value={color}
              onChange={e => setColor(e.target.value)}
              aria-label='Color'
              className='w-9 h-9 rounded-full cursor-pointer border-2 border-white dark:border-zinc-700 shadow-inner ring-1 ring-slate-300 dark:ring-zinc-700'
            />
            <Slider
              size='sm'
              minValue={1}
              maxValue={60}
              value={size}
              onChange={setSize}
              className='max-w-[200px]'
              aria-label='Tamaño de pincel'
              startContent={<small className='text-xs font-mono text-slate-500 dark:text-zinc-400 w-7 text-right'>{size}</small>}
              classNames={{
                track: 'bg-slate-200/70 dark:bg-zinc-700/70',
                filler: 'bg-slate-900 dark:bg-zinc-100',
                thumb: 'bg-white dark:bg-zinc-50 border-2 border-slate-300 dark:border-zinc-300'
              }}
            />
            <span className='text-xs uppercase tracking-widest text-slate-500 dark:text-zinc-400 ml-auto font-mono'>
              {strokeCount} trazo{strokeCount === 1 ? '' : 's'}
            </span>
          </div>
          <div className='relative w-fit max-w-full'>
            <canvas
              ref={canvasRef}
              width={VW}
              height={VH}
              className='paper block rounded-2xl max-w-full h-auto'
              style={{ width: `min(${VW}px, 100%)`, aspectRatio: `${VW}/${VH}` }}
              role='img'
              aria-label='Lienzo compartido de la sala'
            />
            <canvas
              ref={liveCanvasRef}
              width={VW}
              height={VH}
              className='absolute inset-0 block rounded-2xl max-w-full h-auto touch-none'
              style={{ width: `min(${VW}px, 100%)`, aspectRatio: `${VW}/${VH}` }}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
            />
          </div>
        </>
      )}
    </section>
  )
}

export default function PlayPage () {
  const params = useParams()
  const code = params?.code?.toUpperCase()
  return (
    <main className='flex flex-col gap-4 justify-start items-center h-full w-full min-w-screen min-h-screen pb-12'>
      <Toaster />
      <Topbar />
      {!code && <LobbyView />}
      {code && <RoomView code={code} />}
    </main>
  )
}
