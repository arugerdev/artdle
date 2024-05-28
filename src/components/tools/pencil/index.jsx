/* eslint-disable react/prop-types */
import { PencilIcon } from './../../../assets/icons/index'
import { ToolBarButton } from './../../toolBarButton/index'
import { TOOLS } from './../../../utils/tools'
import { useEffect } from 'react'

export const Pencil = ({
  activeTool,
  setActiveTool = () => {},
  isDrawed = false
}) => {
  const handleKeyDown = e => {
    if (e.key === 'p' || e.key === 'P' || e.key === '1') {
      e.preventDefault()
      setActiveTool(TOOLS.PENCIL)
    }
  }

  useEffect(() => {
    document.addEventListener('keypress', handleKeyDown)
    return () => window.removeEventListener('keypress', handleKeyDown)
  }, [])

  return (
    <ToolBarButton
      active={activeTool === TOOLS.PENCIL}
      icon={<PencilIcon className='w-full h-full' />}
      onPress={() => setActiveTool(TOOLS.PENCIL)}
      isDisabled={isDrawed}
      name='Pencil / Lapiz ( P / 1 )'
      description={
        'Se utiliza para dibujar en el lienzo. Puedes cambiar el color y el tamaño.'
      }
    />
  )
}
