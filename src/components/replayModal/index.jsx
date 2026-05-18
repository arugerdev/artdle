/* eslint-disable react/prop-types */
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Slider } from '@nextui-org/react'
import supabase from '../../utils/supabase'
import { TOOLS } from '../../utils/tools'
import { PlayIcon } from '../../assets/icons'
import { strokePath } from '../../utils/canvasRender'

const VW = 960
const VH = 540

const SPEED_OPTIONS = [
  { label: '0.5x', factor: 0.5 },
  { label: '1x', factor: 1 },
  { label: '2x', factor: 2 },
  { label: '4x', factor: 4 }
]

function totalPointCount (strokes) {
  return strokes.reduce((n, s) => n + (s.points?.length ?? 0) / 2, 0)
}

// Snapshot the strokes sliced by the current progress fraction. The last
// visible stroke is truncated to a fractional set of its points so the
// playback looks continuous instead of stepping per-stroke.
function sliceForProgress (strokes, totalPoints, progress) {
  if (!strokes) return []
  const targetPoints = totalPoints * progress
  let acc = 0
  const out = []
  for (const s of strokes) {
    const sPoints = (s.points?.length ?? 0) / 2
    if (acc + sPoints <= targetPoints) {
      out.push(s)
      acc += sPoints
    } else {
      const remaining = targetPoints - acc
      const take = Math.max(2, Math.floor(remaining) * 2)
      out.push({ ...s, points: s.points.slice(0, take) })
      break
    }
  }
  return out
}

export const ReplayModal = ({ isOpen, onClose, drawId, drawName }) => {
  const [strokes, setStrokes] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [progress, setProgress] = useState(0)
  const [speedIdx, setSpeedIdx] = useState(1)
  const [playing, setPlaying] = useState(false)
  const canvasRef = useRef(null)
  const rafRef = useRef(0)
  const startedAtRef = useRef(0)
  const startProgressRef = useRef(0)

  // Fetch strokes from DB whenever the modal opens.
  useEffect(() => {
    if (!isOpen || !drawId) return
    setStrokes(null)
    setLoadError(null)
    setProgress(0)
    setPlaying(false)
    supabase
      .from('draw_strokes')
      .select('strokes')
      .eq('draw_id', drawId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) { setLoadError(error.message); return }
        if (!data) { setLoadError('Este dibujo no tiene timelapse guardado.'); return }
        setStrokes(data.strokes ?? [])
      })
  }, [isOpen, drawId])

  // DPR-aware sizing when the modal opens and strokes are ready.
  useLayoutEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !strokes) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = VW * dpr
    canvas.height = VH * dpr
    const ctx = canvas.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, VW, VH)
  }, [strokes])

  const totalPoints = strokes ? totalPointCount(strokes) : 0
  const speed = SPEED_OPTIONS[speedIdx].factor
  // 200 pts/sec at 1x → typical drawing replays in ~10s.
  const pointsPerMs = 0.2 * speed

  // Drive the animation by accumulating progress on each RAF tick.
  useEffect(() => {
    if (!playing || !strokes || totalPoints === 0) return
    startedAtRef.current = performance.now()
    startProgressRef.current = progress
    const tick = now => {
      const elapsed = now - startedAtRef.current
      const advanced = (elapsed * pointsPerMs) / totalPoints
      const next = Math.min(1, startProgressRef.current + advanced)
      setProgress(next)
      if (next < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setPlaying(false)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, speedIdx, strokes])

  // Paint the canvas every time progress changes.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !strokes) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, VW, VH)
    const visible = sliceForProgress(strokes, totalPoints, progress)
    for (const p of visible) {
      // Bucket strokes aren't stored in draw_strokes (filtered at save).
      if (p.tool === TOOLS.BUCKET) continue
      strokePath(ctx, p)
    }
  }, [progress, strokes, totalPoints])

  const onPlayPause = () => {
    if (progress >= 1) setProgress(0)
    setPlaying(p => !p)
  }
  const onRestart = () => {
    setProgress(0)
    setPlaying(true)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      backdrop='blur'
      className='w-full max-w-4xl'
      classNames={{ base: 'ios-card text-slate-900 dark:text-zinc-100' }}
    >
      <ModalContent>
        {close => (
          <>
            <ModalHeader className='flex flex-col gap-0 pb-2'>
              <h1 className='font-extrabold text-md'>Timelapse · {drawName}</h1>
              <small className='text-slate-500 dark:text-zinc-400 font-normal text-sm'>
                Mira cómo se dibujó paso a paso
              </small>
            </ModalHeader>
            <ModalBody className='flex flex-col items-center justify-center gap-3 p-2'>
              {!strokes && !loadError && <div className='loader' role='status' aria-busy='true' aria-label='Cargando timelapse'></div>}
              {loadError && (
                <div className='flex flex-col items-center justify-center text-center'>
                  <h2 className='font-bold text-md'>No se puede reproducir</h2>
                  <p className='text-slate-500 text-sm'>{loadError}</p>
                </div>
              )}
              {strokes && strokes.length === 0 && !loadError && (
                <p className='text-slate-500 text-sm'>Este dibujo no tiene trazos guardados.</p>
              )}
              {strokes && strokes.length > 0 && (
                <>
                  <canvas
                    ref={canvasRef}
                    width={VW}
                    height={VH}
                    className='paper block rounded-2xl max-w-full h-auto'
                    style={{ width: `min(${VW}px, 100%)`, aspectRatio: `${VW}/${VH}` }}
                    role='img'
                    aria-label={`Timelapse de ${drawName}`}
                  />
                  <Slider
                    size='sm'
                    aria-label='Posición del timelapse'
                    step={0.001}
                    minValue={0}
                    maxValue={1}
                    value={progress}
                    onChange={v => {
                      setPlaying(false)
                      setProgress(Array.isArray(v) ? v[0] : v)
                    }}
                    className='w-full max-w-prose'
                  />
                  <div className='flex flex-row items-center justify-center gap-2'>
                    <Button
                      isIconOnly
                      radius='full'
                      aria-label={playing ? 'Pausar' : 'Reproducir'}
                      className='bg-slate-900 text-white dark:bg-zinc-50 dark:text-slate-900'
                      onPress={onPlayPause}
                    >
                      <PlayIcon size={16} />
                    </Button>
                    <Button size='sm' variant='light' onPress={onRestart}>
                      Reiniciar
                    </Button>
                    <div className='flex flex-row items-center gap-1'>
                      {SPEED_OPTIONS.map((opt, i) => (
                        <Button
                          key={opt.label}
                          size='sm'
                          variant={i === speedIdx ? 'solid' : 'light'}
                          className={i === speedIdx ? 'bg-slate-900 text-white dark:bg-zinc-50 dark:text-slate-900' : ''}
                          onPress={() => setSpeedIdx(i)}
                        >
                          {opt.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </ModalBody>
            <ModalFooter>
              <Button color='danger' variant='light' onPress={close}>Cerrar</Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
