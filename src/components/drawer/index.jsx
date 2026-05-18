/* eslint-disable react/prop-types */
import { Button, Slider, Input } from '@nextui-org/react'
import {
  DownloadIcon,
  PaperIcon,
  RedoIcon,
  SendIcon,
  UndoIcon
} from './../../assets/icons/index'
import { useCallback, useEffect, useRef, useState } from 'react'
import { clamp } from '../../utils/maths.js'
import supabase from '../../utils/supabase.js'
import toast from 'react-hot-toast'
import { ToolBarButton } from '../toolBarButton/index'
import { getColorOnPos } from '../../utils/colors.js'
import { Stage, Layer, Line, Rect as KonvaRect } from 'react-konva'
import { URLImage } from '../URLImage/index.jsx'
import { isMacOs, isMobile } from '../../utils/system.js'
import {
  TOOLS,
  fillArea as fill,
  handleRedoChanges,
  handleUndoChanges
} from '../../utils/tools.js'
import { EyeDropper } from './../tools/eyeDropper/index'
import { Pencil } from './../tools/pencil/index'
import { Eraser } from './../tools/eraser/index'
import { ColorBucket } from './../tools/colorBucket/index'
import { Line as LineTool } from './../tools/line/index'
import { Rect as RectTool } from './../tools/rect/index'
import { ShareButton } from '../shareButton/index.jsx'
import { stageToCompressedDataURL, dataURLToBlob, resolveDrawImage } from '../../utils/image.js'
import { loadDraft, saveDraft, clearDraft } from '../../utils/offlineDraft.js'
import { LayerPanel } from '../layerPanel/index.jsx'
import { Tooltip } from '@nextui-org/react'
import { PaletteSwatches } from '../paletteSwatches/index.jsx'
import { downloadSVG } from '../../utils/svg.js'
import { SvgExportIcon } from '../../assets/icons'

export const Drawer = ({
  className,
  drawed = false,
  data = null,
  dailyWord = ''
}) => {
  const [activeTool, setActiveTool] = useState(0)
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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  // Restore an offline draft if the user was mid-drawing and got disconnected
  // or refreshed. Scoped to today so yesterday's WIP doesn't leak in.
  const TODAY = new Date().toISOString().split('T')[0]
  const [lines, setLines] = useState(() => {
    if (drawed) return []
    const draft = loadDraft(TODAY)
    return draft?.lines ?? []
  })
  const isDrawing = useRef(false)
  const stageRef = useRef()
  const [redoLines, setRedoLines] = useState([])
  const [drawData, setDrawData] = useState(data)
  // Light-touch layers — strokes are tagged with a layerId at creation
  // time. Visibility flips by toggling the layer in `layers` state.
  // Bucket fills capture the whole canvas snapshot so they intentionally
  // ignore the layer boundary (documented limitation).
  const [layers, setLayers] = useState([
    { id: 0, name: 'Capa 1', visible: true },
    { id: 1, name: 'Capa 2', visible: true }
  ])
  const [activeLayer, setActiveLayer] = useState(0)

  const handleMouseDown = e => {
    isDrawing.current = true
    const pos = e.target.getStage().getPointerPosition()
    const stageTransform = e.target.getStage().getAbsoluteTransform().copy()
    const position = stageTransform.invert().point(pos)

    const layer = stageRef.current.children[0]
    const canvas = layer.getCanvas()._canvas

    switch (activeTool) {
      case TOOLS.BUCKET:
        fill(canvas, position.x, position.y, color)
        setLines(prevLines => [
          ...prevLines,
          {
            tool: TOOLS.BUCKET,
            dataURL: canvas.toDataURL(),
            x: 0,
            y: 0
          }
        ])

        setRedoLines([])

        break
      case TOOLS.EYEDROPPER:
        setColor(getColorOnPos(canvas, position.x, position.y))
        setActiveTool(TOOLS.PENCIL)
        break
      case TOOLS.LINE:
      case TOOLS.RECT:
        setLines(prevLines => [
          ...prevLines,
          {
            tool: activeTool,
            points: [position.x, position.y, position.x, position.y],
            stroke: color,
            strokeWidth: size,
            layerId: activeLayer
          }
        ])
        setRedoLines([])
        break
      case TOOLS.PENCIL:
      default:
        setLines(prevLines => [
          ...prevLines,
          {
            tool: activeTool,
            points: [position.x, position.y, position.x, position.y],
            stroke: color,
            strokeWidth: size,
            layerId: activeLayer
          }
        ])
        setRedoLines([])
        break
    }
  }

  const handleMouseMove = e => {
    if (
      !isDrawing.current ||
      activeTool === TOOLS.BUCKET ||
      !lines[lines.length - 1].points
    )
      return
    const stage = e.target.getStage()
    const point = stage.getPointerPosition()
    const stageTransform = e.target.getStage().getAbsoluteTransform().copy()
    const position = stageTransform.invert().point(point)

    const lastLine = lines[lines.length - 1]
    if (lastLine.tool === TOOLS.LINE || lastLine.tool === TOOLS.RECT) {
      // Shape tools resize from the original anchor instead of appending.
      lastLine.points = [
        lastLine.points[0],
        lastLine.points[1],
        Math.round(position.x),
        Math.round(position.y)
      ]
    } else {
      lastLine.points = lastLine.points.concat([
        Math.round(position.x),
        Math.round(position.y)
      ])
    }
    setLines(lines => [...lines])
  }

  const handleMouseUp = () => {
    isDrawing.current = false
    if (!isDrawed) saveDraft(TODAY, lines, name)
  }

  const handleKeyDown = useCallback(
    e => {
      if ((e.ctrlKey || e.metaKey) && !isDrawing.current) {
        switch (e.key) {
          case 'z':
            e.preventDefault()
            handleUndoChanges(
              lines,
              setLines,
              redoLines,
              setRedoLines,
              isDrawed
            )
            return
          case 'y':
            e.preventDefault()
            handleRedoChanges(
              lines,
              setLines,
              redoLines,
              setRedoLines,
              isDrawed
            )
            return
        }
      }
    },
    [lines, redoLines, isDrawed]
  )

  const visibleLayerIds = new Set(layers.filter(l => l.visible).map(l => l.id))

  const renderLines = () => {
    return lines.map((line, i) => {
      // Bucket strokes are full-canvas snapshots — keep them visible so
      // older drawings still render correctly even when layers are hidden.
      const visible = line.tool === TOOLS.BUCKET || visibleLayerIds.has(line.layerId ?? 0)
      if (!visible) return null
      if (line.tool === TOOLS.BUCKET) {
        return <URLImage key={i} src={line.dataURL} />
      }
      if (line.tool === TOOLS.RECT && line.points?.length >= 4) {
        const [x1, y1, x2, y2] = line.points
        return (
          <KonvaRect
            key={i}
            x={Math.min(x1, x2)}
            y={Math.min(y1, y2)}
            width={Math.abs(x2 - x1)}
            height={Math.abs(y2 - y1)}
            stroke={line.stroke}
            strokeWidth={line.strokeWidth}
            fill='transparent'
          />
        )
      }
      return (
        <Line
          key={i}
          points={line.points}
          stroke={line.stroke}
          strokeWidth={line.strokeWidth}
          tension={line.tool === TOOLS.LINE ? 0 : 0.0001}
          lineCap='round'
          lineJoin='round'
          shadowBlur={0}
          shadowColor={line.stroke}
          globalCompositeOperation={
            line.tool === TOOLS.ERASER ? 'destination-out' : 'source-over'
          }
        />
      )
    })
  }

  const sendDraw = async () => {
    setLoading(true)
    try {
      const uri = stageToCompressedDataURL(stageRef.current)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No estás autenticado')

      const blob = dataURLToBlob(uri)
      const ext = blob.type === 'image/webp' ? 'webp' : 'png'
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

      const { error: uploadError } = await supabase
        .storage
        .from('draws')
        .upload(path, blob, {
          contentType: blob.type,
          upsert: false,
          cacheControl: '86400'
        })

      let storagePath = path
      let legacyUri = null
      if (uploadError) {
        // Storage push failed (free-tier limit, etc.) — fall back to base64
        // so the user doesn't lose their drawing.
        console.warn('[Drawer] Storage upload failed, falling back to base64:', uploadError.message)
        storagePath = null
        legacyUri = uri
      }

      const { data: inserted, error: insertError } = await supabase
        .from('draws')
        .insert({
          name,
          creator: user.id,
          storage_path: storagePath,
          uridata: legacyUri
        })
        .select()

      if (insertError) throw insertError

      // Best-effort timelapse upload — failing here should NOT roll back
      // the draw. Bucket strokes are skipped: their payload includes the
      // whole canvas dataURL, which doesn't fit our 500 KB JSON budget.
      const drawId = inserted?.[0]?.id
      if (drawId) {
        const strokesForReplay = lines
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
            .then(({ error: strokesError }) => {
              if (strokesError) {
                console.warn('[Drawer] Failed to save timelapse:', strokesError.message)
              }
            })
        }
      }

      setDrawData(inserted)
      clearDraft()
      toast.success(
        'El dibujo se ha subido correctamente, gracias por jugar! Espera hasta mañana para otra palabra diferente!'
      )
      setIsDrawed(true)
      setUriData(resolveDrawImage(inserted?.[0], { supabaseUrl: import.meta.env.VITE_SUPABASE_URL }) ?? uri)
    } catch (e) {
      toast.error('El dibujo no se ha podido subir, ha ocurrido un error: ' + (e?.message ?? e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // The custom brush-size cursor lives in position: fixed coordinates,
    // so we want viewport-relative client{X,Y} — no scrollY math needed.
    const handleMouseMoveGlobal = e => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    const handleWheelGlobal = e => {
      if ((!isMacOs() && e.ctrlKey) || e.metaKey) {
        e.preventDefault()
        setSize(old => clamp(old + e.wheelDeltaY * 0.01, 1, 120))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('wheel', handleWheelGlobal, { passive: false })

    const mobile = isMobile()
    if (!mobile) {
      window.addEventListener('mousemove', handleMouseMoveGlobal)
    }

    return () => {
      window.removeEventListener('wheel', handleWheelGlobal)
      window.removeEventListener('keydown', handleKeyDown)
      if (!mobile) {
        window.removeEventListener('mousemove', handleMouseMoveGlobal)
      }
    }
  }, [handleKeyDown])

  const handleSave = (fromDB = false) => {
    var a = document.createElement('a')
    a.href = fromDB ? uriData : stageRef.current.toDataURL()
    a.download = `${name}-${new Date().toDateString()}-draw.png`
    a.click()
    return
  }

  const CANVAS_VIRTUAL_WIDTH = 960
  const CANVAS_VIRTUAL_HEIGHT = 540

  const [canvasSize, setCanvasSize] = useState({
    x: clamp(window.innerWidth - 200, 192, CANVAS_VIRTUAL_WIDTH),
    y:
      CANVAS_VIRTUAL_HEIGHT *
      (clamp(window.innerWidth - 200, 108, CANVAS_VIRTUAL_WIDTH) /
        CANVAS_VIRTUAL_WIDTH)
  })

  useEffect(() => {
    const handleResize = () => {
      setCanvasSize({
        x: clamp(window.innerWidth - 200, 192, CANVAS_VIRTUAL_WIDTH),
        y:
          CANVAS_VIRTUAL_HEIGHT *
          (clamp(window.innerWidth - 200, 108, CANVAS_VIRTUAL_WIDTH) /
            CANVAS_VIRTUAL_WIDTH)
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  // Visual separator between tool groups in the toolbar. Horizontal on
  // mobile, vertical on desktop because the toolbar pivots orientation.
  const Divider = () => (
    <div
      role='separator'
      aria-hidden='true'
      className='bg-slate-200 self-stretch h-px w-full lg:h-px lg:w-full lg:my-0.5'
    />
  )

  return (
    <section
      className={`${className} flex flex-col bg-slate-50 items-start gap-3 p-3 sm:p-4 w-full h-full max-w-screen shadow-lg rounded-2xl border border-slate-200`}
    >
      <section className='flex flex-col-reverse items-center lg:items-start justify-center w-full lg:flex-row gap-3'>
        <section className='flex flex-row flex-wrap w-full lg:max-w-[72px] h-auto lg:flex-col items-center justify-start shadow-md rounded-xl bg-white gap-1.5 p-2 border border-slate-200'>
          {!isMobile() && (
            <div
              aria-hidden='true'
              className='fixed left-0 top-0 w-3 h-3 z-10 bg-transparent border border-black rounded-full'
              style={{
                pointerEvents: 'none',
                left: `${mousePosition.x - size / 2}px`,
                top: `${mousePosition.y - size / 2}px`,
                height: `${size}px`,
                width: `${size}px`
              }}
            ></div>
          )}

          {/* Drawing tools */}
          <Pencil
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            isDrawed={isDrawed}
          />
          <Eraser
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            isDrawed={isDrawed}
          />
          {!isMobile() && (
            <ColorBucket
              activeTool={activeTool}
              setActiveTool={setActiveTool}
              isDrawed={isDrawed}
            />
          )}
          <LineTool
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            isDrawed={isDrawed}
          />
          <RectTool
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            isDrawed={isDrawed}
          />
          <EyeDropper
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            setColor={setColor}
            isDrawed={isDrawed}
          />

          <Divider />

          {/* Colour controls */}
          <Tooltip
            content={
              <div className='flex flex-col gap-0'>
                <span className='font-semibold text-xs'>Selector de color</span>
                <span className='text-[10px] text-gray-500 font-mono'>{color.toUpperCase()}</span>
              </div>
            }
            placement='right'
            delay={200}
            closeDelay={0}
          >
            <input
              type='color'
              value={color}
              onChange={e => setColor(e.target.value)}
              className='bg-transparent rounded-full justify-center p-1 w-9 h-9 cursor-pointer border border-slate-200 hover:border-slate-400 transition-colors'
              disabled={isDrawed}
              aria-label='Selector de color'
            />
          </Tooltip>
          <PaletteSwatches color={color} setColor={setColor} isDisabled={isDrawed} />

          <Divider />

          {/* History / cleanup */}
          <ToolBarButton
            icon={<UndoIcon className='w-full h-full' />}
            onPress={() =>
              handleUndoChanges(lines, setLines, redoLines, setRedoLines, isDrawed)
            }
            isDisabled={isDrawed || lines.length === 0}
            name='Deshacer ( Ctrl + Z )'
            description='Deshace el último trazo o acción.'
          />
          <ToolBarButton
            icon={<RedoIcon className='w-full h-full' />}
            onPress={() =>
              handleRedoChanges(lines, setLines, redoLines, setRedoLines, isDrawed)
            }
            isDisabled={isDrawed || redoLines.length === 0}
            name='Rehacer ( Ctrl + Y )'
            description='Rehace el último trazo deshecho.'
          />
          <ToolBarButton
            icon={<PaperIcon className='w-full h-full' />}
            onPress={() => setLines([])}
            isDisabled={isDrawed || lines.length === 0}
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
                  orientation={
                    window.innerWidth >= 1024 ? 'vertical' : 'horizontal'
                  }
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

        {!isDrawed && (
          <Stage
            width={canvasSize.x}
            height={canvasSize.y}
            scaleX={
              clamp(window.innerWidth - 200, 108, CANVAS_VIRTUAL_WIDTH) /
              CANVAS_VIRTUAL_WIDTH
            }
            scaleY={
              clamp(window.innerWidth - 200, 108, CANVAS_VIRTUAL_WIDTH) /
              CANVAS_VIRTUAL_WIDTH
            }
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
            onPointerDown={handleMouseDown}
            onPointerMove={handleMouseMove}
            onPointerUp={handleMouseUp}
            ref={stageRef}
            className='touch-none border border-slate-300 shadow-inner rounded-lg bg-white p-px w-fit h-fit'
          >
            <Layer>{renderLines()}</Layer>
          </Stage>
        )}
        {isDrawed && (
          <img
            src={uriData}
            alt={name}
            className='w-[960px] max-w-full h-auto rounded-lg border border-slate-300 shadow-inner'
          />
        )}
      </section>

      <section className='flex flex-row flex-wrap items-center justify-end shadow-md w-full h-auto rounded-xl bg-white gap-2 p-2.5 border border-slate-200'>
        <Input
          type='title'
          variant='faded'
          color='primary'
          isClearable
          placeholder='Pon un nombre a tu creación...'
          label={<strong>Nombre de tu creación</strong>}
          labelPlacement='inside'
          isDisabled={isDrawed}
          value={name}
          onValueChange={setName}
          classNames={{
            inputWrapper: 'min-h-[3rem]'
          }}
        />

        <Tooltip
          content={
            <div className='flex flex-col'>
              <span className='font-semibold text-xs'>Descargar PNG</span>
              <span className='text-[10px] text-gray-500'>Imagen rasterizada</span>
            </div>
          }
          placement='top'
          delay={200}
          closeDelay={0}
        >
          <Button
            variant='flat'
            isIconOnly
            aria-label='Descargar PNG'
            onPress={() => handleSave(uriData !== null)}
          >
            <DownloadIcon className='w-full h-full p-2' />
          </Button>
        </Tooltip>

        <Tooltip
          content={
            <div className='flex flex-col'>
              <span className='font-semibold text-xs'>Descargar SVG</span>
              <span className='text-[10px] text-gray-500'>Vectorial · sin pérdida</span>
            </div>
          }
          placement='top'
          delay={200}
          closeDelay={0}
        >
          <Button
            variant='flat'
            isIconOnly
            aria-label='Descargar SVG'
            isDisabled={lines.length === 0}
            onPress={() => downloadSVG(lines, `${name}-${Date.now()}.svg`)}
          >
            <SvgExportIcon className='w-full h-full p-2' />
          </Button>
        </Tooltip>

        {isDrawed && <ShareButton data={drawData[0]} dailyWord={dailyWord} />}

        <Tooltip
          content={
            <div className='flex flex-col'>
              <span className='font-semibold text-xs'>
                {isDrawed ? 'Dibujo enviado' : 'Enviar dibujo'}
              </span>
              <span className='text-[10px] text-gray-500'>
                {name.length < 2 ? 'Pon un nombre primero' : 'Subir y publicar'}
              </span>
            </div>
          }
          placement='top'
          delay={200}
          closeDelay={0}
          isDisabled={isDrawed}
        >
          <Button
            color='success'
            variant='shadow'
            isIconOnly
            aria-label='Enviar dibujo'
            isLoading={loading}
            onPress={sendDraw}
            isDisabled={isDrawed || name.length < 2}
            className='shadow-success/30'
          >
            <SendIcon className='w-full h-full p-2 text-white' />
          </Button>
        </Tooltip>
      </section>
    </section>
  )
}
