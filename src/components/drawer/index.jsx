/* eslint-disable react/prop-types */
import { Button, Slider, Input, Tooltip } from '@nextui-org/react'
import { DownloadIcon, PaperIcon, RedoIcon, SendIcon, UndoIcon, SvgExportIcon } from './../../assets/icons/index'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { clamp } from '../../utils/maths.js'
import supabase from '../../utils/supabase.js'
import toast from 'react-hot-toast'
import { ToolBarButton } from '../toolBarButton/index'
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
import { LayerPanel } from '../layerPanel/index.jsx'
import { ColorPickerPopover } from '../colorPickerPopover/index.jsx'
import { PaletteSwatches } from '../paletteSwatches/index.jsx'
import { downloadSVG } from '../../utils/svg.js'
import { paintScene, strokePath, applyBucket, sampleColor } from '../../utils/canvasRender.js'

// Logical drawing surface. Physical canvas pixels are scaled by DPR for
// crispness on retina + zoom. Everything in `lines[].points` is stored
// in these logical coords so the data is resolution-independent.
const VW = 960
const VH = 540

export const Drawer = ({ className, drawed = false, data = null, dailyWord = '' }) => {
  const [activeTool, setActiveTool] = useState(TOOLS.PENCIL)
  const [size, setSize] = useState(10)
  const [color, setColor] = useState('#000000')
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(
    drawed && data ? data[0].name : 'draw-' + Date.now()
  )
  const [isDrawed, setIsDrawed] = useState(drawed)
  const [uriData, setUriData] = useState(
    data && data[0]
      ? resolveDrawImage(data[0], { supabaseUrl: import.meta.env.VITE_SUPABASE_URL })
      : null
  )
  const [drawData, setDrawData] = useState(data)
  const [layers, setLayers] = useState([
    { id: 0, name: 'Capa 1', visible: true },
    { id: 1, name: 'Capa 2', visible: true }
  ])
  const [activeLayer, setActiveLayer] = useState(0)
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100, visible: false })

  // ----------------------------------------------------------------
  // Persistence: paths array drives everything. Drafts auto-save on
  // each commit so a refresh doesn't trash work in progress.
  // ----------------------------------------------------------------
  const TODAY = new Date().toISOString().split('T')[0]
  const [paths, setPaths] = useState(() => {
    if (drawed) return []
    const draft = loadDraft(TODAY)
    return draft?.lines ?? []
  })
  const [redoStack, setRedoStack] = useState([])

  // ----------------------------------------------------------------
  // Refs: two-canvas system.
  //   committedCanvasRef → bottom layer; one draw call per commit.
  //   liveCanvasRef      → top layer; cleared + redrawn per frame
  //                        for the in-progress stroke only.
  // The split means a 200-stroke drawing never has to redraw 200
  // strokes per pointermove — only the current one.
  // ----------------------------------------------------------------
  const wrapperRef = useRef(null)
  const committedCanvasRef = useRef(null)
  const liveCanvasRef = useRef(null)
  const currentPathRef = useRef(null)
  const isDrawingRef = useRef(false)
  const rafScheduledRef = useRef(0)
  const visibleLayerIdsRef = useRef(new Set(layers.filter(l => l.visible).map(l => l.id)))

  // Keep the visibleLayerIds ref in sync.
  useEffect(() => {
    visibleLayerIdsRef.current = new Set(layers.filter(l => l.visible).map(l => l.id))
    // Re-paint with new visibility
    repaintCommitted()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layers])

  // ----------------------------------------------------------------
  // DPR-aware canvas sizing. The CSS width is responsive; the backing
  // store is logical-size × DPR for sharpness; we then transform 1:1
  // back to logical coords so all our drawing math stays in VW×VH.
  // ----------------------------------------------------------------
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
    const visible = visibleLayerIdsRef.current
    const visiblePaths = paths.filter(p =>
      p.tool === TOOLS.BUCKET || visible.has(p.layerId ?? 0)
    )
    paintScene(ctx, visiblePaths)
  }, [paths])

  // Initial mount: size canvases, paint whatever paths we restored from
  // the draft (or render the finished drawing if drawed=true).
  useLayoutEffect(() => {
    setupCanvas(committedCanvasRef.current)
    setupCanvas(liveCanvasRef.current)
    repaintCommitted()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Repaint when paths change (undo/redo/clear).
  useEffect(() => {
    repaintCommitted()
  }, [paths, repaintCommitted])

  // ----------------------------------------------------------------
  // Pointer → logical coordinates. The canvas has a CSS size that
  // differs from its backing store; we map clientX/Y through the
  // bounding rect to the logical VW×VH plane.
  // ----------------------------------------------------------------
  const clientToCanvas = useCallback(evt => {
    const rect = liveCanvasRef.current.getBoundingClientRect()
    const x = ((evt.clientX - rect.left) / rect.width) * VW
    const y = ((evt.clientY - rect.top) / rect.height) * VH
    return { x, y }
  }, [])

  // ----------------------------------------------------------------
  // Drawing: redraw the live overlay with the current in-progress
  // stroke. Scheduled through RAF so high-rate pointer events don't
  // pile up.
  // ----------------------------------------------------------------
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

  // ----------------------------------------------------------------
  // Pointer handlers — work for mouse, touch and stylus thanks to
  // Pointer Events.
  // ----------------------------------------------------------------
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
      // Apply directly to the committed canvas: flood fill needs real
      // pixels (the overlay is transparent). Then push the bucket path
      // so undo/redo + persistence work.
      const path = { tool: TOOLS.BUCKET, x, y, stroke: color, layerId: activeLayer }
      applyBucket(committedCanvasRef.current.getContext('2d'), path)
      setPaths(prev => {
        const next = [...prev, path]
        if (!isDrawed) saveDraft(TODAY, next, name)
        return next
      })
      setRedoStack([])
      return
    }

    // Pencil / Eraser / Line / Rect — start a stroke.
    isDrawingRef.current = true
    currentPathRef.current = {
      tool: activeTool,
      points: [x, y, x, y],
      stroke: color,
      strokeWidth: size,
      layerId: activeLayer
    }
    scheduleLiveDraw()
  }

  const onPointerMove = e => {
    setCursorPos({ x: e.clientX, y: e.clientY, visible: !isMobile() })
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

    // Commit to bottom canvas + state. Clear the overlay.
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

  // ----------------------------------------------------------------
  // Undo / Redo / Clear
  // ----------------------------------------------------------------
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

  // Keyboard shortcuts: Ctrl/Cmd + Z / Y
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

  // ----------------------------------------------------------------
  // Save flow → Storage upload + DB insert (unchanged semantics from
  // the previous Konva-based Drawer, just uses canvas.toDataURL).
  // ----------------------------------------------------------------
  const handleSave = () => {
    const a = document.createElement('a')
    a.href = uriData ?? committedCanvasRef.current.toDataURL('image/png')
    a.download = `${name}-${new Date().toDateString()}-draw.png`
    a.click()
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
        // Strip bucket entries (they're not points-based) and the rendering
        // helper handles them on replay via re-fill if needed.
        const strokesForReplay = paths
          .filter(l => l.tool !== TOOLS.BUCKET && l.points)
          .map(l => ({
            tool: l.tool,
            points: l.points,
            stroke: l.stroke,
            strokeWidth: l.strokeWidth
          }))
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

  // ----------------------------------------------------------------
  // Render
  // ----------------------------------------------------------------
  const Divider = () => (
    <div
      role='separator'
      aria-hidden='true'
      className='bg-slate-200/70 self-stretch h-px w-full lg:h-px lg:w-full lg:my-0.5'
    />
  )

  return (
    <section
      className={`${className} glass flex flex-col items-start gap-3 p-3 sm:p-4 w-full h-full max-w-screen rounded-3xl`}
    >
      <section className='flex flex-col-reverse items-center lg:items-start justify-center w-full lg:flex-row gap-3'>
        {/* TOOLBAR */}
        <section className='glass-strong flex flex-row flex-wrap w-full lg:max-w-[68px] h-auto lg:flex-col items-center justify-start rounded-2xl gap-1.5 p-2'>
          <Pencil activeTool={activeTool} setActiveTool={setActiveTool} isDrawed={isDrawed} />
          <Eraser activeTool={activeTool} setActiveTool={setActiveTool} isDrawed={isDrawed} />
          <ColorBucket activeTool={activeTool} setActiveTool={setActiveTool} isDrawed={isDrawed} />
          <LineTool activeTool={activeTool} setActiveTool={setActiveTool} isDrawed={isDrawed} />
          <RectTool activeTool={activeTool} setActiveTool={setActiveTool} isDrawed={isDrawed} />
          <EyeDropper activeTool={activeTool} setActiveTool={setActiveTool} setColor={setColor} isDrawed={isDrawed} />

          <Divider />

          <ColorPickerPopover color={color} setColor={setColor} isDisabled={isDrawed} />
          <PaletteSwatches color={color} setColor={setColor} isDisabled={isDrawed} />

          <Divider />

          <ToolBarButton
            icon={<UndoIcon className='w-5 h-5' />}
            onPress={undo}
            isDisabled={isDrawed || paths.length === 0}
            name='Deshacer ( Ctrl + Z )'
            description='Deshace el último trazo o acción.'
          />
          <ToolBarButton
            icon={<RedoIcon className='w-5 h-5' />}
            onPress={redo}
            isDisabled={isDrawed || redoStack.length === 0}
            name='Rehacer ( Ctrl + Y )'
            description='Rehace el último trazo deshecho.'
          />
          <ToolBarButton
            icon={<PaperIcon className='w-5 h-5' />}
            onPress={clear}
            isDisabled={isDrawed || paths.length === 0}
            name='Limpiar lienzo'
            description='⚠ Borra todo el lienzo. Úsalo si quieres empezar de cero.'
          />

          {!isDrawed && (
            <>
              <Divider />
              <LayerPanel
                layers={layers}
                activeLayer={activeLayer}
                setLayers={setLayers}
                setActiveLayer={setActiveLayer}
              />
            </>
          )}

          {(activeTool === TOOLS.PENCIL || activeTool === TOOLS.ERASER) && (
            <>
              <Divider />
              <Tooltip
                content={`Tamaño del pincel: ${size.toFixed(0)} px`}
                placement='right'
                delay={400}
                closeDelay={0}
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
                    <small className='text-xs font-mono text-slate-500 w-7 text-right'>
                      {size.toFixed(0)}
                    </small>
                  }
                  onChange={setSize}
                  className='max-h-[140px] h-auto lg:h-[150px]'
                  isDisabled={isDrawed}
                />
              </Tooltip>
            </>
          )}
        </section>

        {/* CANVAS SURFACE */}
        <div ref={wrapperRef} className='relative w-fit max-w-full'>
          {!isMobile() && cursorPos.visible && !isDrawed && (
            <div
              aria-hidden='true'
              className='fixed pointer-events-none z-10 rounded-full border border-slate-700 bg-slate-700/10 mix-blend-multiply'
              style={{
                left: `${cursorPos.x - size / 2}px`,
                top: `${cursorPos.y - size / 2}px`,
                width: `${size}px`,
                height: `${size}px`
              }}
            />
          )}

          {!isDrawed && (
            <>
              <canvas
                ref={committedCanvasRef}
                width={VW}
                height={VH}
                className='block rounded-2xl bg-white shadow-inner border border-slate-200/70 max-w-full h-auto'
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
              className='w-[960px] max-w-full h-auto rounded-2xl border border-slate-200/70 shadow-inner'
            />
          )}
        </div>
      </section>

      {/* ACTION BAR */}
      <section className='glass-strong flex flex-row flex-wrap items-center justify-end w-full h-auto rounded-2xl gap-2 p-2.5'>
        <Input
          type='title'
          variant='bordered'
          isClearable
          placeholder='Pon un nombre a tu creación...'
          label={<span className='text-xs font-medium uppercase tracking-wider text-slate-500'>Nombre</span>}
          labelPlacement='outside'
          isDisabled={isDrawed}
          value={name}
          onValueChange={setName}
          classNames={{
            inputWrapper: 'min-h-[2.5rem] bg-white/50 backdrop-blur-md border-slate-200/70 data-[hover=true]:border-slate-300 group-data-[focus=true]:border-slate-400 group-data-[focus=true]:bg-white/70',
            input: 'text-sm'
          }}
        />

        <Tooltip content='Descargar PNG' placement='top' delay={200} closeDelay={0}>
          <Button
            variant='flat'
            radius='full'
            isIconOnly
            aria-label='Descargar PNG'
            onPress={handleSave}
            className='bg-white/60 backdrop-blur-md border border-slate-200/60'
          >
            <DownloadIcon className='w-5 h-5 text-slate-700' />
          </Button>
        </Tooltip>

        <Tooltip content='Descargar SVG' placement='top' delay={200} closeDelay={0}>
          <Button
            variant='flat'
            radius='full'
            isIconOnly
            aria-label='Descargar SVG'
            isDisabled={paths.length === 0}
            onPress={() => downloadSVG(paths, `${name}-${Date.now()}.svg`)}
            className='bg-white/60 backdrop-blur-md border border-slate-200/60'
          >
            <SvgExportIcon className='w-5 h-5 text-slate-700' />
          </Button>
        </Tooltip>

        {isDrawed && <ShareButton data={drawData[0]} dailyWord={dailyWord} />}

        <Tooltip
          content={
            <div className='flex flex-col'>
              <span className='font-semibold text-xs'>{isDrawed ? 'Dibujo enviado' : 'Enviar dibujo'}</span>
              <span className='text-[10px] text-slate-500'>{name.length < 2 ? 'Pon un nombre primero' : 'Subir y publicar'}</span>
            </div>
          }
          placement='top'
          delay={200}
          closeDelay={0}
          isDisabled={isDrawed}
        >
          <Button
            radius='full'
            isIconOnly
            aria-label='Enviar dibujo'
            isLoading={loading}
            onPress={sendDraw}
            isDisabled={isDrawed || name.length < 2}
            className='bg-slate-900 text-white hover:bg-slate-700 transition-colors'
          >
            <SendIcon className='w-5 h-5' />
          </Button>
        </Tooltip>
      </section>
    </section>
  )
}
