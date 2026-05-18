/* eslint-disable react/prop-types */
import { createPortal } from 'react-dom'
import { Button, Slider, Input, Tooltip } from '@nextui-org/react'
import { DownloadIcon, PaperIcon, RedoIcon, SendIcon, UndoIcon, SvgExportIcon } from './../../assets/icons/index'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { clamp } from '../../utils/maths.js'
import supabase from '../../utils/supabase.js'
import toast from 'react-hot-toast'
import { isMacOs, isMobile } from '../../utils/system.js'
import { TOOLS } from '../../utils/tools.js'
import { EyeDropper } from './../tools/eyeDropper/index'
import { Pencil } from './../tools/pencil/index'
import { Eraser } from './../tools/eraser/index'
import { ColorBucket } from './../tools/colorBucket/index'
import { Line as LineTool } from './../tools/line/index'
import { Rect as RectTool } from './../tools/rect/index'
import { ShareButton } from '../shareButton/index.jsx'
import { canvasToCompressedDataURL, dataURLToBlob, resolveDrawImage } from '../../utils/image.js'
import { loadDraft, saveDraft, clearDraft } from '../../utils/offlineDraft.js'
import { ColorPickerPopover } from '../colorPickerPopover/index.jsx'
import { canvasToSVG } from '../../utils/svg.js'
import { paintScene, strokePath, applyBucket, sampleColor } from '../../utils/canvasRender.js'
import { ToolBarButton } from '../toolBarButton/index'

const VW = 960
const VH = 540

export const Drawer = ({ className, drawed = false, data = null, dailyWord = '' }) => {
  const [activeTool, setActiveTool] = useState(TOOLS.PENCIL)
  const [size, setSize] = useState(10)
  const [color, setColor] = useState('#000000')
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(drawed && data ? data[0].name : 'draw-' + Date.now())
  const [isDrawed, setIsDrawed] = useState(drawed)
  const [uriData, setUriData] = useState(
    data && data[0]
      ? resolveDrawImage(data[0], { supabaseUrl: import.meta.env.VITE_SUPABASE_URL })
      : null
  )
  const [drawData, setDrawData] = useState(data)
  // x, y are viewport coords. scale is the canvas's CSS-px-per-logical-px
  // ratio so the brush preview matches the actual stroke width on screen.
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100, scale: 1, visible: false })

  const TODAY = new Date().toISOString().split('T')[0]
  const [paths, setPaths] = useState(() => {
    if (drawed) return []
    const draft = loadDraft(TODAY)
    return draft?.lines ?? []
  })
  const [redoStack, setRedoStack] = useState([])

  const wrapperRef = useRef(null)
  const committedCanvasRef = useRef(null)
  const liveCanvasRef = useRef(null)
  const currentPathRef = useRef(null)
  const isDrawingRef = useRef(false)
  const rafScheduledRef = useRef(0)

  const setupCanvas = useCallback(canvas => {
    if (!canvas) return null
    const dpr = window.devicePixelRatio || 1
    canvas.width = VW * dpr
    canvas.height = VH * dpr
    const ctx = canvas.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    return ctx
  }, [])

  const repaintCommitted = useCallback(() => {
    const canvas = committedCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    paintScene(ctx, paths)
  }, [paths])

  useLayoutEffect(() => {
    setupCanvas(committedCanvasRef.current)
    setupCanvas(liveCanvasRef.current)
    repaintCommitted()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    repaintCommitted()
  }, [paths, repaintCommitted])

  const clientToCanvas = useCallback(evt => {
    const rect = liveCanvasRef.current.getBoundingClientRect()
    const x = ((evt.clientX - rect.left) / rect.width) * VW
    const y = ((evt.clientY - rect.top) / rect.height) * VH
    return { x, y }
  }, [])

  const drawLiveStroke = useCallback(() => {
    rafScheduledRef.current = 0
    const canvas = liveCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, VW, VH)
    if (currentPathRef.current) strokePath(ctx, currentPathRef.current)
  }, [])

  const scheduleLiveDraw = useCallback(() => {
    if (rafScheduledRef.current) return
    rafScheduledRef.current = requestAnimationFrame(drawLiveStroke)
  }, [drawLiveStroke])

  const onPointerDown = e => {
    if (isDrawed) return
    if (e.pointerType === 'mouse' && e.button !== 0) return
    e.preventDefault()
    try { liveCanvasRef.current?.setPointerCapture?.(e.pointerId) } catch { /* noop */ }
    const { x, y } = clientToCanvas(e)

    if (activeTool === TOOLS.EYEDROPPER) {
      const sampled = sampleColor(committedCanvasRef.current.getContext('2d'), x, y)
      setColor(sampled)
      setActiveTool(TOOLS.PENCIL)
      return
    }

    if (activeTool === TOOLS.BUCKET) {
      const path = { tool: TOOLS.BUCKET, x, y, stroke: color }
      applyBucket(committedCanvasRef.current.getContext('2d'), path)
      setPaths(prev => {
        const next = [...prev, path]
        if (!isDrawed) saveDraft(TODAY, next, name)
        return next
      })
      setRedoStack([])
      return
    }

    isDrawingRef.current = true
    currentPathRef.current = {
      tool: activeTool,
      points: [x, y, x, y],
      stroke: color,
      strokeWidth: size
    }
    scheduleLiveDraw()
  }

  const onPointerMove = e => {
    const rect = liveCanvasRef.current?.getBoundingClientRect()
    const scale = rect && rect.width > 0 ? rect.width / VW : 1
    setCursorPos({ x: e.clientX, y: e.clientY, scale, visible: !isMobile() })
    if (!isDrawingRef.current) return
    e.preventDefault()
    const { x, y } = clientToCanvas(e)
    const cp = currentPathRef.current
    if (!cp) return
    if (cp.tool === TOOLS.LINE || cp.tool === TOOLS.RECT) {
      cp.points = [cp.points[0], cp.points[1], x, y]
    } else {
      cp.points.push(x, y)
    }
    scheduleLiveDraw()
  }

  const onPointerUp = e => {
    if (!isDrawingRef.current) return
    isDrawingRef.current = false
    if (rafScheduledRef.current) {
      cancelAnimationFrame(rafScheduledRef.current)
      rafScheduledRef.current = 0
    }
    const cp = currentPathRef.current
    currentPathRef.current = null

    const liveCtx = liveCanvasRef.current.getContext('2d')
    liveCtx.clearRect(0, 0, VW, VH)

    if (cp && cp.points && cp.points.length >= 2) {
      const ctx = committedCanvasRef.current.getContext('2d')
      strokePath(ctx, cp)
      setPaths(prev => {
        const next = [...prev, cp]
        if (!isDrawed) saveDraft(TODAY, next, name)
        return next
      })
      setRedoStack([])
    }

    try { liveCanvasRef.current?.releasePointerCapture?.(e.pointerId) } catch { /* noop */ }
  }

  const onPointerLeave = () => {
    setCursorPos(c => ({ ...c, visible: false }))
  }

  const undo = () => {
    if (isDrawed || paths.length === 0) return
    setPaths(prev => {
      const last = prev[prev.length - 1]
      setRedoStack(s => [...s, last])
      const next = prev.slice(0, -1)
      saveDraft(TODAY, next, name)
      return next
    })
  }
  const redo = () => {
    if (isDrawed || redoStack.length === 0) return
    setRedoStack(s => {
      const last = s[s.length - 1]
      setPaths(p => {
        const next = [...p, last]
        saveDraft(TODAY, next, name)
        return next
      })
      return s.slice(0, -1)
    })
  }
  const clear = () => {
    if (isDrawed || paths.length === 0) return
    setRedoStack(paths)
    setPaths([])
    saveDraft(TODAY, [], name)
  }

  useEffect(() => {
    const handleKeyDown = e => {
      if (!(e.ctrlKey || e.metaKey)) return
      if (isDrawingRef.current) return
      if (e.key === 'z' || e.key === 'Z') {
        if (e.shiftKey) { e.preventDefault(); redo() }
        else { e.preventDefault(); undo() }
      } else if (e.key === 'y' || e.key === 'Y') {
        e.preventDefault()
        redo()
      }
    }
    const handleWheel = e => {
      if ((!isMacOs() && e.ctrlKey) || e.metaKey) {
        e.preventDefault()
        setSize(old => clamp(old + e.wheelDeltaY * 0.01, 1, 120))
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('wheel', handleWheel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paths, redoStack, isDrawed])

  const handleSave = () => {
    const a = document.createElement('a')
    a.href = uriData ?? committedCanvasRef.current.toDataURL('image/png')
    a.download = `${name}-${new Date().toDateString()}-draw.png`
    a.click()
  }

  const handleSaveSvg = () => {
    const canvas = committedCanvasRef.current
    if (!canvas) return
    const svg = canvasToSVG(canvas)
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${name}-${Date.now()}.svg`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const sendDraw = async () => {
    setLoading(true)
    try {
      const uri = canvasToCompressedDataURL(committedCanvasRef.current)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No estás autenticado')

      const blob = dataURLToBlob(uri)
      const ext = blob.type === 'image/webp' ? 'webp' : 'png'
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('draws')
        .upload(path, blob, { contentType: blob.type, upsert: false, cacheControl: '86400' })

      let storagePath = path
      let legacyUri = null
      if (uploadError) {
        console.warn('[Drawer] Storage upload failed, falling back to base64:', uploadError.message)
        storagePath = null
        legacyUri = uri
      }

      const { data: inserted, error: insertError } = await supabase
        .from('draws')
        .insert({ name, creator: user.id, storage_path: storagePath, uridata: legacyUri })
        .select()

      if (insertError) throw insertError

      const drawId = inserted?.[0]?.id
      if (drawId) {
        // Save bucket fills too — they're cheap to store ({x, y, stroke},
        // ~40 bytes) and the replay can re-execute them via flood-fill.
        const strokesForReplay = paths
          .map(l => {
            if (l.tool === TOOLS.BUCKET) {
              return { tool: l.tool, x: l.x, y: l.y, stroke: l.stroke }
            }
            if (!l.points || l.points.length < 2) return null
            return {
              tool: l.tool,
              points: l.points,
              stroke: l.stroke,
              strokeWidth: l.strokeWidth
            }
          })
          .filter(Boolean)
        if (strokesForReplay.length > 0) {
          supabase
            .from('draw_strokes')
            .insert({ draw_id: drawId, strokes: strokesForReplay })
            .then(({ error }) => {
              if (error) console.warn('[Drawer] timelapse save failed:', error.message)
            })
        }
      }

      setDrawData(inserted)
      clearDraft()
      toast.success('El dibujo se ha subido correctamente, gracias por jugar! Espera hasta mañana para otra palabra diferente!')
      setIsDrawed(true)
      setUriData(resolveDrawImage(inserted?.[0], { supabaseUrl: import.meta.env.VITE_SUPABASE_URL }) ?? uri)
    } catch (e) {
      toast.error('El dibujo no se ha podido subir, ha ocurrido un error: ' + (e?.message ?? e))
    } finally {
      setLoading(false)
    }
  }

  // -----------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------
  const Divider = () => (
    <div
      role='separator'
      aria-hidden='true'
      className='bg-slate-200/70 dark:bg-zinc-700/60 self-stretch h-px w-full lg:h-px lg:w-full lg:my-1'
    />
  )

  return (
    <section
      className={`${className} ios-card flex flex-col items-start gap-3 p-3 sm:p-4 w-full h-full max-w-screen rounded-3xl`}
    >
      <section className='flex flex-col-reverse items-center lg:items-start justify-center w-full lg:flex-row gap-3'>
        {/* TOOLBAR */}
        <section className='ios-chip flex flex-row flex-wrap w-full lg:max-w-[60px] h-auto lg:flex-col items-center justify-start rounded-2xl gap-1 p-1.5'>
          <Pencil activeTool={activeTool} setActiveTool={setActiveTool} isDrawed={isDrawed} />
          <Eraser activeTool={activeTool} setActiveTool={setActiveTool} isDrawed={isDrawed} />
          <ColorBucket activeTool={activeTool} setActiveTool={setActiveTool} isDrawed={isDrawed} />
          <LineTool activeTool={activeTool} setActiveTool={setActiveTool} isDrawed={isDrawed} />
          <RectTool activeTool={activeTool} setActiveTool={setActiveTool} isDrawed={isDrawed} />
          <EyeDropper activeTool={activeTool} setActiveTool={setActiveTool} setColor={setColor} isDrawed={isDrawed} />

          <Divider />

          <ColorPickerPopover color={color} setColor={setColor} isDisabled={isDrawed} />

          <Divider />

          <ToolBarButton
            icon={<UndoIcon size={20} />}
            onPress={undo}
            isDisabled={isDrawed || paths.length === 0}
            name='Deshacer ( Ctrl + Z )'
            description='Deshace el último trazo o acción.'
          />
          <ToolBarButton
            icon={<RedoIcon size={20} />}
            onPress={redo}
            isDisabled={isDrawed || redoStack.length === 0}
            name='Rehacer ( Ctrl + Y )'
            description='Rehace el último trazo deshecho.'
          />
          <ToolBarButton
            icon={<PaperIcon size={20} />}
            onPress={clear}
            isDisabled={isDrawed || paths.length === 0}
            name='Limpiar lienzo'
            description='⚠ Borra todo el lienzo. Úsalo si quieres empezar de cero.'
          />

          {(activeTool === TOOLS.PENCIL || activeTool === TOOLS.ERASER) && (
            <>
              <Divider />
              <Tooltip
                content={`Tamaño del pincel: ${size.toFixed(0)} px`}
                placement='right'
                delay={400}
                closeDelay={0}
                classNames={{ content: 'ios-chip text-slate-700 dark:text-zinc-200' }}
              >
                <Slider
                  size='sm'
                  step={1}
                  maxValue={120}
                  minValue={1}
                  orientation={typeof window !== 'undefined' && window.innerWidth >= 1024 ? 'vertical' : 'horizontal'}
                  aria-label='Tamaño del pincel'
                  defaultValue={10}
                  value={size}
                  startContent={
                    <small className='text-[10px] font-mono text-slate-500 dark:text-zinc-400 w-6 text-right'>
                      {size.toFixed(0)}
                    </small>
                  }
                  onChange={setSize}
                  className='max-h-[140px] h-auto lg:h-[150px]'
                  isDisabled={isDrawed}
                  classNames={{
                    track: 'bg-slate-200/70 dark:bg-zinc-700/70',
                    filler: 'bg-slate-700 dark:bg-zinc-100',
                    thumb: 'bg-white dark:bg-zinc-50 border-2 border-slate-300 dark:border-zinc-300'
                  }}
                />
              </Tooltip>
            </>
          )}
        </section>

        {/* CANVAS */}
        <div ref={wrapperRef} className='relative w-fit max-w-full'>
          {/* Brush preview is portalled to <body> so it isn't trapped
              inside the ios-card's backdrop-filter containing block —
              that was making the cursor drift relative to the panel
              instead of the viewport. */}
          {!isMobile() && cursorPos.visible && !isDrawed && typeof document !== 'undefined' && (() => {
            const displaySize = Math.max(2, size * cursorPos.scale)
            return createPortal(
              <div
                aria-hidden='true'
                className='fixed pointer-events-none z-[1000] rounded-full border border-slate-700/70 dark:border-zinc-300/70 bg-slate-700/10 dark:bg-zinc-100/10'
                style={{
                  left: `${cursorPos.x - displaySize / 2}px`,
                  top: `${cursorPos.y - displaySize / 2}px`,
                  width: `${displaySize}px`,
                  height: `${displaySize}px`
                }}
              />,
              document.body
            )
          })()}

          {!isDrawed && (
            <>
              <canvas
                ref={committedCanvasRef}
                width={VW}
                height={VH}
                className='paper block rounded-2xl max-w-full h-auto'
                style={{ width: `min(${VW}px, 100%)`, aspectRatio: `${VW}/${VH}` }}
                role='img'
                aria-label={`Lienzo de dibujo, palabra del día: ${dailyWord}`}
              />
              <canvas
                ref={liveCanvasRef}
                width={VW}
                height={VH}
                className='absolute inset-0 block rounded-2xl max-w-full h-auto touch-none'
                style={{ width: `min(${VW}px, 100%)`, aspectRatio: `${VW}/${VH}` }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                onPointerLeave={onPointerLeave}
              />
            </>
          )}
          {isDrawed && (
            <img
              src={uriData}
              alt={name}
              className='paper w-[960px] max-w-full h-auto rounded-2xl'
            />
          )}
        </div>
      </section>

      {/* ACTION BAR */}
      <section className='ios-chip flex flex-row flex-wrap items-center justify-end w-full h-auto rounded-2xl gap-2 p-2'>
        <Input
          type='title'
          variant='bordered'
          isClearable
          placeholder='Pon un nombre a tu creación...'
          label={<span className='text-[10px] font-medium uppercase tracking-widest text-slate-500 dark:text-zinc-400'>Nombre</span>}
          labelPlacement='outside'
          isDisabled={isDrawed}
          value={name}
          onValueChange={setName}
          classNames={{
            inputWrapper: 'min-h-[2.5rem] bg-white/60 dark:bg-zinc-900/40 border-slate-200 dark:border-zinc-700 data-[hover=true]:border-slate-300 dark:data-[hover=true]:border-zinc-600',
            input: 'text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500'
          }}
        />

        <Tooltip content='Descargar PNG' placement='top' delay={200} closeDelay={0} classNames={{ content: 'ios-chip' }}>
          <Button
            radius='full'
            isIconOnly
            aria-label='Descargar PNG'
            onPress={handleSave}
            className='ios-chip text-slate-700 dark:text-zinc-200'
          >
            <DownloadIcon size={20} />
          </Button>
        </Tooltip>

        <Tooltip content='Descargar SVG (con todo lo que ves)' placement='top' delay={200} closeDelay={0} classNames={{ content: 'ios-chip' }}>
          <Button
            radius='full'
            isIconOnly
            aria-label='Descargar SVG'
            isDisabled={paths.length === 0}
            onPress={handleSaveSvg}
            className='ios-chip text-slate-700 dark:text-zinc-200'
          >
            <SvgExportIcon size={20} />
          </Button>
        </Tooltip>

        {isDrawed && <ShareButton data={drawData[0]} dailyWord={dailyWord} />}

        <Tooltip
          content={
            <div className='flex flex-col'>
              <span className='font-semibold text-xs'>{isDrawed ? 'Dibujo enviado' : 'Enviar dibujo'}</span>
              <span className='text-[10px] text-slate-500 dark:text-zinc-400'>{name.length < 2 ? 'Pon un nombre primero' : 'Subir y publicar'}</span>
            </div>
          }
          placement='top'
          delay={200}
          closeDelay={0}
          isDisabled={isDrawed}
          classNames={{ content: 'ios-chip' }}
        >
          <Button
            radius='full'
            isIconOnly
            aria-label='Enviar dibujo'
            isLoading={loading}
            onPress={sendDraw}
            isDisabled={isDrawed || name.length < 2}
            className='bg-slate-900 text-white dark:bg-zinc-50 dark:text-zinc-950 hover:bg-slate-700 dark:hover:bg-zinc-200 disabled:opacity-40 transition-colors'
          >
            <SendIcon size={20} />
          </Button>
        </Tooltip>
      </section>
    </section>
  )
}
