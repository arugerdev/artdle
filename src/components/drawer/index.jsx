/* eslint-disable react/prop-types */
import { Button, Slider, Input } from '@nextui-org/react'
import {
  BucketIcon,
  ColoPickerIcon,
  DownloadIcon,
  EraserIcon,
  PaperIcon,
  PencilIcon,
  RedoIcon,
  SendIcon,
  UndoIcon
} from './../../assets/icons/index'
import { useEffect, useRef, useState } from 'react'
import { clamp } from '../../utils/maths.js'
import supabase from '../../utils/supabase.js'
import toast from 'react-hot-toast'
import usePreventZoom from '../../hooks/usePreventZoom.js'
import { ToolBarButton } from './../tool-bar-button/index'
import { rgbToHex } from '../../utils/colors.js'
import { Stage, Layer, Line } from 'react-konva'
import { URLImage } from '../URLImage/index.jsx'

export const Drawer = ({ className, drawed = false, data = null }) => {
  //------------TOOLS-------------
  // const TOOL_PENCIL = 0
  // const TOOL_ERASER = 1
  const TOOL_BUCKET = 2
  const TOOL_EYEDROPPER = 3
  //------------------------------

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
  const [redoLines, setRedoLines] = useState([]) // Estado para almacenar las líneas deshechas

  usePreventZoom()

  const handleMouseDown = e => {
    isDrawing.current = true
    const pos = e.target.getStage().getPointerPosition()

    if (activeTool === TOOL_BUCKET) {
      const layer = stageRef.current.children[0]
      const canvas = layer.getCanvas()._canvas

      fill(canvas, pos.x, pos.y, color)

      const dataURL = canvas.toDataURL()
      const newImage = { tool: TOOL_BUCKET, dataURL: dataURL, x: 0, y: 0 }

      setLines(prevLines => [...prevLines, newImage])
      setRedoLines([])
    } else if (activeTool === TOOL_EYEDROPPER) {
      if (activeTool !== 3) return
      const layer = stageRef.current.children[0]
      const canvas = layer.getCanvas()._canvas

      setColor(getColorOnPos(canvas, pos.x, pos.y))
    } else {
      setLines(prevLines => [
        ...prevLines,
        {
          tool: activeTool,
          points: [pos.x, pos.y],
          stroke: color,
          strokeWidth: size
        }
      ])

      setRedoLines([])
    }
  }

  const handleMouseMove = e => {
    if (
      !isDrawing.current ||
      activeTool === TOOL_BUCKET ||
      !lines[lines.length - 1].points
    )
      return
    const stage = e.target.getStage()
    const point = stage.getPointerPosition()
    const lastLine = lines[lines.length - 1]
    lastLine.points = lastLine.points.concat([point.x, point.y])

    setLines(lines.slice(0, -1).concat(lastLine))
  }

  const handleMouseUp = () => {
    isDrawing.current = false
  }

  const handleUndoChanges = () => {
    if (!isDrawing.current && lines.length > 0) {
      const newLines = [...lines]
      const removedLine = newLines.pop()
      setLines(newLines)
      setRedoLines([...redoLines, removedLine])
    }
  }

  const handleRedoChanges = () => {
    if (!isDrawing.current && redoLines.length > 0) {
      const newRedoLines = [...redoLines]
      const restoredLine = newRedoLines.pop()
      setLines([...lines, restoredLine])
      setRedoLines(newRedoLines)
    }
  }

  function fill (canvas, x, y, fillColor) {
    const cx = canvas.getContext('2d')
    const imageData = cx.getImageData(0, 0, canvas.width, canvas.height)
    const sample = { x, y }
    const isPainted = new Array(canvas.width * canvas.height)
    const toPaint = [sample]

    const forEachNeighbor = (point, fn) => {
      fn({ x: point.x - 1, y: point.y })
      fn({ x: point.x + 1, y: point.y })
      fn({ x: point.x, y: point.y - 1 })
      fn({ x: point.x, y: point.y + 1 })
    }

    const isSameColor = (data, point1, point2) => {
      const offset1 = (point1.x + point1.y * data.width) * 4
      const offset2 = (point2.x + point2.y * data.width) * 4

      for (let i = 0; i < 4; i++) {
        if (data.data[offset1 + i] !== data.data[offset2 + i]) {
          return false
        }
      }
      return true
    }

    cx.fillStyle = fillColor
    while (toPaint.length) {
      const current = toPaint.pop()
      const id = current.x + current.y * imageData.width

      if (isPainted[id]) {
        continue
      } else {
        cx.fillRect(current.x - 0.5, current.y - 0.5, 2, 2)
        isPainted[id] = true
      }

      forEachNeighbor(current, function (neighbor) {
        if (
          neighbor.x >= 0 &&
          neighbor.x < imageData.width &&
          neighbor.y >= 0 &&
          neighbor.y < imageData.height &&
          isSameColor(imageData, sample, neighbor)
        ) {
          toPaint.push(neighbor)
        }
      })
    }
  }

  const isMacOs = () => window.navigator.appVersion.indexOf('Mac') !== -1

  const handleKeyDown = e => {
    if ((e.ctrlKey || e.metaKey) && !isDrawing.current) {
      switch (e.key) {
        case 'z':
          e.preventDefault()
          handleUndoChanges()
          return
        case 'y':
          e.preventDefault()
          handleRedoChanges()
          return
      }
    }
  }

  const renderLines = () => {
    return lines.map((line, i) => {
      if (line.tool === TOOL_BUCKET) {
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

  const getColorOnPos = (canvas, x, y) => {
    const cx = canvas.getContext('2d')
    x = Math.floor(x)
    y = Math.floor(y)
    const imageData = cx.getImageData(0, 0, canvas.width, canvas.height)
    const index = (y * canvas.width + x) * 4

    return rgbToHex(
      imageData.data[index],
      imageData.data[index + 1],
      imageData.data[index + 2]
    )
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lines, redoLines])

  useEffect(() => {
    const handleMouseMoveGlobal = e => {
      setMousePosition({ x: e.clientX, y: e.clientY + scrollY })
    }

    const handleWheelGlobal = e => {
      if ((!isMacOs() && e.ctrlKey) || e.metaKey) {
        e.preventDefault()
        setSize(old => clamp(old + e.wheelDeltaY * 0.01, 1, 120))
      }
    }

    window.addEventListener('mousemove', handleMouseMoveGlobal)
    window.addEventListener('wheel', handleWheelGlobal, { passive: false })

    return () => {
      window.removeEventListener('mousemove', handleMouseMoveGlobal)
      window.removeEventListener('wheel', handleWheelGlobal)
    }
  }, [])

  const handleSave = (fromDB = false) => {
    var a = document.createElement('a')
    a.href = fromDB ? uriData : stageRef.current.toDataURL()
    a.download = `${name}-${new Date().toDateString()}-draw.png`
    a.click()
    return
  }

  return (
    <section
      className={`${className} flex flex-col bg-slate-100 items-start justify gap-2 p-4 w-full h-full shadow-lg rounded-xl`}
    >
      <section className='flex flex-row gap-2'>
        <section className='flex flex-col border-r-2 items-center justify-start shadow-lg h-auto rounded-lg bg-white gap-2 p-2'>
          <ToolBarButton
            active={activeTool === 0}
            icon={<PencilIcon className='w-full h-full' />}
            onPress={() => setActiveTool(0)}
            isDisabled={isDrawed}
            name='Pencil / Lapiz'
            description={
              'Se utiliza para dibujar en el lienzo. Puedes cambiar el color y el tamaño.'
            }
          />
          <ToolBarButton
            active={activeTool === 1}
            icon={<EraserIcon className='w-full h-full' />}
            onPress={() => setActiveTool(1)}
            isDisabled={isDrawed}
            name='Eraser / Borrador'
            description={
              'Se utiliza para borrar el color de una zona del lienzo. Puedes variar su tamaño.'
            }
          />

          <ToolBarButton
            active={activeTool === 2}
            icon={<BucketIcon className='w-full h-full' />}
            onPress={() => setActiveTool(2)}
            isDisabled={isDrawed}
            name='Esta función aun no esta desarrollada, esta en proceso, por favor intentalo mas tarde 😥'
            description={''}
          />

          <ToolBarButton
            active={activeTool === 3}
            icon={<ColoPickerIcon className='w-full h-full' />}
            onPress={() => setActiveTool(3)}
            isDisabled={isDrawed}
            name='Color Picker'
            description={
              'Se utiliza para seleccionar un color de el lienzo, se puede usar para cuando se quiere el mismo color que ya esta dibujado.'
            }
          />

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

          <input
            type='color'
            value={color}
            onChange={e => setColor(e.target.value)}
            className='bg-transparent outline-none justify-center p-1 w-[40px] h-[40px] rounded-full cursor-pointer'
            disabled={isDrawed}
          ></input>

          <ToolBarButton
            icon={<UndoIcon className='w-full h-full' />}
            onPress={() => handleUndoChanges()}
            isDisabled={isDrawed}
            name='Undo / Deshacer'
            description={
              'Se utiliza para deshacer o borrar el último paso o acción realizado/a.'
            }
          />
          <ToolBarButton
            icon={<RedoIcon className='w-full h-full' />}
            onPress={() => handleRedoChanges()}
            isDisabled={isDrawed}
            name='Redo / Rehacer'
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

          {(activeTool === 0 || activeTool === 1) && (
            <Slider
              size='sm'
              step={1}
              maxValue={120}
              minValue={1}
              orientation='vertical'
              aria-label='Size'
              defaultValue={30}
              value={size}
              startContent={<small>{size.toFixed(0)}px</small>}
              onChange={setSize}
              className='max-h-[150px] h-[150px]'
              isDisabled={isDrawed}
            />
          )}
        </section>

        {!isDrawed && (
          <Stage
            width={960}
            height={540}
            // onMouseDown={handleMouseDown}
            // onMouseMove={handleMouseMove}
            // onMouseUp={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
            onPointerDown={handleMouseDown}
            onPointerMove={handleMouseMove}
            onPointerUp={handleMouseUp}
            ref={stageRef}
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
          variant='underlined'
          isClearable={true}
          placeholder='Pon un nombre a tu creacción...'
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
          onPress={() => {
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
                    'El dibujo no se ha podido subir, ha ocurrido un error: ' +
                      e
                  )
                })
            })
          }}
          isDisabled={isDrawed || name.length < 2}
        >
          <SendIcon className='w-full h-full text-white' />
        </Button>
      </section>
    </section>
  )
}
