/* eslint-disable react/prop-types */
import { EraserIcon } from '../../../assets/icons/index'
import { ToolBarButton } from '../../toolBarButton/index'
import { TOOLS } from '../../../utils/tools'
import { useEffect } from 'react'

export const Eraser = ({
  activeTool,
  setActiveTool = () => {},
  isDrawed = false
}) => {
  const handleKeyDown = e => {
    if (e.key === 'e' || e.key === 'E' || e.key === '2') {
      setActiveTool(TOOLS.ERASER)
    }
  }

  useEffect(() => {
    document.addEventListener('keypress', handleKeyDown)
    return () => window.removeEventListener('keypress', handleKeyDown)
  }, [])

  return (
    <ToolBarButton
      active={activeTool === TOOLS.ERASER}
      icon={<EraserIcon className='w-full h-full' />}
      onPress={() => setActiveTool(TOOLS.ERASER)}
      isDisabled={isDrawed}
      name='Eraser / Borrador ( E / 2 )'
      description={
        'Se utiliza para borrar el color de una zona del lienzo. Puedes variar su tamaño.'
      }
    />
  )
}
