/* eslint-disable react/prop-types */
import { Stage, Layer, Line } from 'react-konva'
import { useEffect, useRef, useState } from 'react'
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Slider } from '@nextui-org/react'
import supabase from '../../utils/supabase'
import { TOOLS } from '../../utils/tools'
import { PlayIcon } from '../../assets/icons'

const VIRTUAL_WIDTH = 960
const VIRTUAL_HEIGHT = 540

// Approximately one stroke segment every (1 / SPEED) milliseconds.
const SPEED_OPTIONS = [
  { label: '0.5x', factor: 0.5 },
  { label: '1x', factor: 1 },
  { label: '2x', factor: 2 },
  { label: '4x', factor: 4 }
]

function totalPointCount (strokes) {
  return strokes.reduce((n, s) => n + (s.points?.length ?? 0) / 2, 0)
}

export const ReplayModal = ({ isOpen, onClose, drawId, drawName }) => {
  const [strokes, setStrokes] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [progress, setProgress] = useState(0) // 0..1
  const [speedIdx, setSpeedIdx] = useState(1)
  const [playing, setPlaying] = useState(false)
  const rafRef = useRef(0)
  const startedAtRef = useRef(0)
  const startProgressRef = useRef(0)
  const stageRef = useRef(null)

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
        if (error) {
          setLoadError(error.message)
          return
        }
        if (!data) {
          setLoadError('Este dibujo no tiene timelapse guardado.')
          return
        }
        setStrokes(data.strokes ?? [])
      })
  }, [isOpen, drawId])

  const totalPoints = strokes ? totalPointCount(strokes) : 0
  const speed = SPEED_OPTIONS[speedIdx].factor
  // 200 pts/sec at 1x → a typical drawing replays in ~10s.
  const pointsPerMs = 0.2 * speed

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

  // Slice strokes by current progress so the canvas redraws live.
  const visibleStrokes = (() => {
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
  })()

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
    >
      <ModalContent>
        {close => (
          <>
            <ModalHeader className='flex flex-col gap-0 pb-2'>
              <h1 className='font-extrabold text-md'>Timelapse · {drawName}</h1>
              <small className='text-slate-500 font-normal text-sm'>
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
                  <Stage
                    ref={stageRef}
                    width={Math.min(window.innerWidth - 80, VIRTUAL_WIDTH)}
                    height={
                      VIRTUAL_HEIGHT *
                      (Math.min(window.innerWidth - 80, VIRTUAL_WIDTH) / VIRTUAL_WIDTH)
                    }
                    scaleX={Math.min(window.innerWidth - 80, VIRTUAL_WIDTH) / VIRTUAL_WIDTH}
                    scaleY={Math.min(window.innerWidth - 80, VIRTUAL_WIDTH) / VIRTUAL_WIDTH}
                    className='border-2 border-slate-300 rounded-md bg-white'
                  >
                    <Layer>
                      {visibleStrokes.map((l, i) => (
                        <Line
                          key={i}
                          points={l.points}
                          stroke={l.stroke}
                          strokeWidth={l.strokeWidth}
                          tension={0.0001}
                          lineCap='round'
                          lineJoin='round'
                          globalCompositeOperation={l.tool === TOOLS.ERASER ? 'destination-out' : 'source-over'}
                        />
                      ))}
                    </Layer>
                  </Stage>
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
                      aria-label={playing ? 'Pausar' : 'Reproducir'}
                      color='primary'
                      variant='flat'
                      onPress={onPlayPause}
                    >
                      <PlayIcon className='w-full h-full p-2' />
                    </Button>
                    <Button
                      size='sm'
                      variant='light'
                      onPress={onRestart}
                    >
                      Reiniciar
                    </Button>
                    <div className='flex flex-row items-center gap-1'>
                      {SPEED_OPTIONS.map((opt, i) => (
                        <Button
                          key={opt.label}
                          size='sm'
                          variant={i === speedIdx ? 'solid' : 'light'}
                          color={i === speedIdx ? 'primary' : 'default'}
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
              <Button color='danger' variant='light' onPress={close}>
                Cerrar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
