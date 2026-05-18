import { useEffect, useRef, useState } from 'react'
import { useLocation, useParams } from 'wouter'
import { Toaster, default as toast } from 'react-hot-toast'
import { Button, Input, Slider } from '@nextui-org/react'
import { Stage, Layer, Line } from 'react-konva'
import supabase, { getDailyWord } from '../../utils/supabase'
import { Topbar } from '../../components/topbar/index'

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
    <section className='flex flex-col items-center gap-4 p-6 max-w-md w-full'>
      <h1 className='text-3xl font-extrabold'>Jugar en vivo 🎮</h1>
      <p className='text-gray-500 text-center'>
        Crea una sala compartida o únete a una existente con su código de 6
        caracteres. Todos los jugadores dibujan a la vez sobre el mismo
        lienzo, viendo los trazos en tiempo real.
      </p>
      <Button color='primary' size='lg' onPress={createRoom} isLoading={creating}>
        Crear sala
      </Button>
      <div className='flex flex-col w-full gap-2'>
        <Input
          label='Código de sala'
          placeholder='ABCDEF'
          value={joinCode}
          onValueChange={setJoinCode}
          maxLength={6}
        />
        <Button onPress={join} color='secondary' variant='flat'>
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
  const [strokes, setStrokes] = useState([])
  const [color, setColor] = useState('#000000')
  const [size, setSize] = useState(10)
  const isDrawing = useRef(false)
  const currentStrokeRef = useRef(null)
  const userRef = useRef(null)

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
      // Load existing strokes
      const { data: existing } = await supabase
        .from('room_strokes')
        .select('stroke, player_id, id')
        .eq('room_id', data.id)
        .order('created_at', { ascending: true })
        .limit(1000)
      if (cancelled) return
      setStrokes((existing ?? []).map(r => ({ ...r.stroke, _id: r.id, _player: r.player_id })))
    })()
    return () => { cancelled = true }
  }, [code, navigate])

  // Realtime subscribe
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
        // Skip our own optimistic strokes
        if (r.player_id && userRef.current?.id === r.player_id) {
          return
        }
        setStrokes(prev => [...prev, { ...r.stroke, _id: r.id, _player: r.player_id }])
      })
      .subscribe()
    return () => channel.unsubscribe()
  }, [room?.id])

  const persistStroke = async stroke => {
    if (!room || !userRef.current) return
    const { error } = await supabase.from('room_strokes').insert({
      room_id: room.id,
      player_id: userRef.current.id,
      stroke
    })
    if (error) console.warn('[Room] persist failed:', error.message)
  }

  const onDown = e => {
    isDrawing.current = true
    const pos = e.target.getStage().getPointerPosition()
    const t = e.target.getStage().getAbsoluteTransform().copy()
    const p = t.invert().point(pos)
    currentStrokeRef.current = {
      points: [p.x, p.y, p.x, p.y],
      stroke: color,
      strokeWidth: size
    }
    setStrokes(prev => [...prev, { ...currentStrokeRef.current, _local: true }])
  }
  const onMove = e => {
    if (!isDrawing.current || !currentStrokeRef.current) return
    const stage = e.target.getStage()
    const pos = stage.getPointerPosition()
    const t = stage.getAbsoluteTransform().copy()
    const p = t.invert().point(pos)
    currentStrokeRef.current.points.push(Math.round(p.x), Math.round(p.y))
    setStrokes(prev => {
      const next = [...prev]
      next[next.length - 1] = { ...currentStrokeRef.current, _local: true }
      return next
    })
  }
  const onUp = () => {
    if (!isDrawing.current) return
    isDrawing.current = false
    if (currentStrokeRef.current) {
      persistStroke(currentStrokeRef.current)
      currentStrokeRef.current = null
    }
  }

  const canvasW = Math.min(typeof window !== 'undefined' ? window.innerWidth - 80 : VW, VW)
  const scale = canvasW / VW

  return (
    <section className='flex flex-col items-center gap-3 p-4 w-full max-w-[1100px]'>
      <div className='flex flex-row items-center gap-3 w-full justify-between'>
        <div className='flex flex-col'>
          <h1 className='font-extrabold text-xl'>
            Sala <span className='font-mono bg-slate-100 px-2 rounded'>{code}</span>
          </h1>
          {room?.word && (
            <small className='text-gray-500'>Palabra: <strong>{room.word}</strong></small>
          )}
        </div>
        <Button
          size='sm'
          variant='flat'
          color='primary'
          onPress={() => {
            navigator.clipboard?.writeText(window.location.href).then(
              () => toast.success('Enlace copiado'),
              () => toast.error('No se pudo copiar')
            )
          }}
        >
          Compartir enlace
        </Button>
      </div>
      {!room && <div className='loader' role='status' aria-busy='true'></div>}
      {room && (
        <>
          <div className='flex flex-row items-center gap-3 bg-white p-2 rounded-md shadow-sm w-full'>
            <input
              type='color'
              value={color}
              onChange={e => setColor(e.target.value)}
              aria-label='Color'
              className='w-10 h-10 rounded cursor-pointer'
            />
            <Slider
              size='sm'
              minValue={1}
              maxValue={60}
              value={size}
              onChange={setSize}
              className='max-w-[200px]'
              aria-label='Tamaño de pincel'
              startContent={<small>{size}px</small>}
            />
            <span className='text-sm text-gray-500 ml-auto'>
              {strokes.length} trazo{strokes.length === 1 ? '' : 's'}
            </span>
          </div>
          <Stage
            width={canvasW}
            height={VH * scale}
            scaleX={scale}
            scaleY={scale}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            className='touch-none border-2 border-slate-600 rounded-md bg-white'
          >
            <Layer>
              {strokes.map((s, i) => (
                <Line
                  key={s._id ?? `local-${i}`}
                  points={s.points}
                  stroke={s.stroke}
                  strokeWidth={s.strokeWidth}
                  tension={0.0001}
                  lineCap='round'
                  lineJoin='round'
                />
              ))}
            </Layer>
          </Stage>
        </>
      )}
    </section>
  )
}

export default function PlayPage () {
  const params = useParams()
  const code = params?.code?.toUpperCase()
  return (
    <main className='flex flex-col gap-4 justify-start items-center h-full w-full min-w-screen min-h-screen'>
      <Toaster />
      <Topbar />
      {!code && <LobbyView />}
      {code && <RoomView code={code} />}
    </main>
  )
}
