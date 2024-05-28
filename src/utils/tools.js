export const TOOLS = {
  PENCIL: 0,
  ERASER: 1,
  BUCKER: 2,
  EYEDROPPER: 3
}

export function fillArea (canvas, x, y, fillColor) {
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

export function handleUndoChanges (
  lines = [],
  setLines = () => {},
  redoLines = [],
  setRedoLines = () => {},
  isDrawing = false
) {
  if (!isDrawing.current && lines.length > 0) {
    const newLines = [...lines]
    const removedLine = newLines.pop()
    setLines(newLines)
    setRedoLines([...redoLines, removedLine])
  }
}

export function handleRedoChanges (
  lines = [],
  setLines = () => {},
  redoLines = [],
  setRedoLines = () => {},
  isDrawing = false
) {
  if (!isDrawing.current && redoLines.length > 0) {
    const newRedoLines = [...redoLines]
    const restoredLine = newRedoLines.pop()
    setLines([...lines, restoredLine])
    setRedoLines(newRedoLines)
  }
}
