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
import { Stage, Layer, Line } from 'react-konva'
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

export const Drawer = ({ className, drawed = false, data = null }) => {
  const [activeTool, setActiveTool] = useState(0)
  const [size, setSize] = useState(10)
  const [color, setColor] = useState('#000000')
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(
    drawed && data ? data[0].name : 'draw-' + Date.now()
  )
  const [isDrawed, setIsDrawed] = useState(drawed)
  const [uriData, setUriData] = useState(
    data && data[0] ? data[0].uridata : null
  )
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [lines, setLines] = useState([])
  const isDrawing = useRef(false)
  const stageRef = useRef()
  const [redoLines, setRedoLines] = useState([])

  const handleMouseDown = e => {
    isDrawing.current = true
    const pos = e.target.getStage().getPointerPosition()
    const layer = stageRef.current.children[0]
    const canvas = layer.getCanvas()._canvas

    switch (activeTool) {
      case TOOLS.BUCKET:
        fill(canvas, pos.x, pos.y, color, 1)
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
        setColor(getColorOnPos(canvas, pos.x, pos.y))
        setActiveTool(TOOLS.PENCIL)
        break
      case TOOLS.PENCIL:
      default:
        setLines(prevLines => [
          ...prevLines,
          {
            tool: activeTool,
            points: [pos.x, pos.y, pos.x, pos.y],
            stroke: color,
            strokeWidth: size
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
    const lastLine = lines[lines.length - 1]
    lastLine.points = lastLine.points.concat([
      Math.round(point.x),
      Math.round(point.y)
    ])
    setLines(lines => [...lines])
  }

  const handleMouseUp = () => {
    isDrawing.current = false
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

  const renderLines = () => {
    return lines.map((line, i) => {
      if (line.tool === TOOLS.BUCKET) {
        return <URLImage key={i} src={line.dataURL} />
      } else {
        return (
          <Line
            key={i}
            points={line.points}
            stroke={line.stroke}
            strokeWidth={line.strokeWidth}
            tension={0.0001}
            lineCap='round'
            lineJoin='round'
            shadowBlur={0}
            shadowColor={line.stroke}
            globalCompositeOperation={
              line.tool === 1 ? 'destination-out' : 'source-over'
            }
          />
        )
      }
    })
  }

  const sendDraw = () => {
    setLoading(true)
    const uri = stageRef.current.toDataURL()
    supabase.auth.getUser().then(user => {
      supabase
        .from('draws')
        .insert({
          name: name,
          uridata: uri,
          creator: user.data.user.id
        })
        .then(result => {
          if (result.status === 201) {
            toast.success(
              'El dibujo se ha subido correctamente, gracias por jugar! Espera hasta mañana para otra palabra diferente!'
            )
            setIsDrawed(true)
            setUriData(uri)
          }
          setLoading(false)
        })
        .catch(e => {
          toast.error(
            'El dibujo no se ha podido subir, ha ocurrido un error: ' + e
          )
        })
    })
  }

  useEffect(() => {
    const handleMouseMoveGlobal = e => {
      if (!isMobile) return
      setMousePosition({ x: e.clientX, y: e.clientY + scrollY })
    }

    const handleWheelGlobal = e => {
      if ((!isMacOs() && e.ctrlKey) || e.metaKey) {
        e.preventDefault()
        setSize(old => clamp(old + e.wheelDeltaY * 0.01, 1, 120))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('wheel', handleWheelGlobal, { passive: false })
    if (!isMobile) return
    window.addEventListener('mousemove', handleMouseMoveGlobal)

    return () => {
      window.removeEventListener('wheel', handleWheelGlobal)
      window.removeEventListener('keydown', handleKeyDown)
      if (!isMobile) return
      window.removeEventListener('mousemove', handleMouseMoveGlobal)
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
    x: clamp(window.innerWidth, CANVAS_VIRTUAL_WIDTH / 3, CANVAS_VIRTUAL_WIDTH),
    y: clamp(
      window.innerHeight,
      CANVAS_VIRTUAL_HEIGHT / 3,
      CANVAS_VIRTUAL_HEIGHT
    )
  })

  useEffect(() => {
    const handleResize = () => {
      const ratioW = 1920 / window.innerWidth
      const ratioH = 1080 / window.innerHeight

      const ratio = Math.min(ratioW, ratioH)

      const newWidth = CANVAS_VIRTUAL_WIDTH / ratio
      const newHeight = CANVAS_VIRTUAL_HEIGHT / ratio

      setCanvasSize({
        x: newWidth,
        y: newHeight
      })
      console.log({
        x: newWidth,
        y: newHeight
      })
      console.log(canvasSize)
      console.log(ratioW, ratioH)
      console.log(ratio)
      console.log(canvasSize.x / canvasSize.y)
      console.log(
        canvasSize.x / canvasSize.y == 1.777777777777778 ||
          canvasSize.x / canvasSize.y == 1.7777777777777777
      )
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [canvasSize])

  return (
    <section
      className={`${className} flex flex-col bg-slate-100 items-start justify gap-2 p-4 w-full h-full max-w-screen shadow-lg rounded-xl`}
    >
      <section className='flex flex-row gap-2'>
        <section className='flex flex-col border-r-2 items-center justify-start shadow-lg h-auto rounded-lg bg-white gap-2 p-2'>
          {!isMobile() && (
            <div
              className={`fixed left-0 top-0 w-3 h-3 z-10 bg-transparent border-1 border-black rounded-full `}
              style={{
                pointerEvents: 'none',
                left: `${mousePosition.x - size / 2}px`,
                top: `${mousePosition.y - size / 2 - scrollY}px`,
                height: `${size}px`,
                width: `${size}px`
              }}
            ></div>
          )}
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

          <EyeDropper
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            setColor={setColor}
            isDrawed={isDrawed}
          />

          <input
            type='color'
            value={color}
            onChange={e => setColor(e.target.value)}
            className='bg-transparent rounded-full justify-center p-1 w-[40px] h-[40px] cursor-pointer'
            disabled={isDrawed}
          ></input>

          <ToolBarButton
            icon={<UndoIcon className='w-full h-full' />}
            onPress={() =>
              handleUndoChanges(
                lines,
                setLines,
                redoLines,
                setRedoLines,
                isDrawed
              )
            }
            isDisabled={isDrawed}
            name='Undo / Deshacer ( CTRL + Z )'
            description={
              'Se utiliza para deshacer o borrar el último paso o acción realizado/a.'
            }
          />
          <ToolBarButton
            icon={<RedoIcon className='w-full h-full' />}
            onPress={() =>
              handleRedoChanges(
                lines,
                setLines,
                redoLines,
                setRedoLines,
                isDrawed
              )
            }
            isDisabled={isDrawed}
            name='Redo / Rehacer ( CTRL + Y )'
            description={
              'Se utiliza para rehacer o volver al último paso o acción realizado/a.'
            }
          />

          <ToolBarButton
            icon={<PaperIcon className='w-full h-full' />}
            onPress={() => setLines([])}
            isDisabled={isDrawed}
            name='Clear / Limpiar'
            description={
              'Se utiliza para borrar todo el lienzo CUIDADO CON ESTO, BORRARÁ TODO EL DIBUJO, se utiliza cuando quieres empezar desde el comienzo a dibujar.'
            }
          />

          {(activeTool === TOOLS.PENCIL || activeTool === TOOLS.ERASER) && (
            <Slider
              size='sm'
              step={1}
              maxValue={120}
              minValue={1}
              orientation='vertical'
              aria-label='Size'
              defaultValue={10}
              value={size}
              startContent={<small>{size.toFixed(0)}px</small>}
              onChange={setSize}
              className='max-h-[140px] h-[150px]'
              isDisabled={isDrawed}
            />
          )}
        </section>

        {!isDrawed && (
          <Stage
            width={canvasSize.x}
            height={canvasSize.y}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
            onPointerDown={handleMouseDown}
            onPointerMove={handleMouseMove}
            onPointerUp={handleMouseUp}
            ref={stageRef}
            className='touch-none border-2 border-slate-600 rounded-sm p-px w-fit h-fit'
          >
            <Layer>{renderLines()}</Layer>
          </Stage>
        )}
        {isDrawed && <img src={uriData} className='w-[960px] h-[540px]' />}
      </section>

      <section className='flex flex-row border-r-2 items-center justify-end shadow-lg w-full h-auto rounded-lg bg-white gap-2 p-2'>
        <Input
          type='title'
          title='Nombre'
          variant='faded'
          color='primary'
          isClearable={true}
          placeholder='Pon un nombre a tu creacción...'
          label={<strong>Nombre de tu creacción</strong>}
          labelPlacement='inside'
          isDisabled={isDrawed}
          value={name}
          onValueChange={setName}
        ></Input>

        <Button
          className={`${
            activeTool === 3 ? 'border-2 border-blue-500 bg-slate-300' : ''
          } bg-transparent justify-center p-2`}
          isIconOnly
          onPress={() => handleSave(uriData !== null)}
        >
          <DownloadIcon className='w-full h-full' />
        </Button>
        <Button
          className={`bg-success justify-center items-center p-2 shadow-xl`}
          isIconOnly
          isLoading={loading}
          onPress={sendDraw}
          isDisabled={isDrawed || name.length < 2}
        >
          <SendIcon className='w-full h-full text-white' />
        </Button>
      </section>
    </section>
  )
}
