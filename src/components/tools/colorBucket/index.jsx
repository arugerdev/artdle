/* eslint-disable react/prop-types */
import { BucketIcon } from '../../../assets/icons/index'
import { ToolBarButton } from '../../toolBarButton/index'
import { TOOLS } from '../../../utils/tools'
import { useEffect } from 'react'

export const ColorBucket = ({
  activeTool,
  setActiveTool = () => {},
  isDrawed = false
}) => {
  const handleKeyDown = e => {
    if (e.key === 'b' || e.key === 'B' || e.key === '3') {
      e.preventDefault()
      setActiveTool(TOOLS.BUCKET)
    }
  }

  useEffect(() => {
    document.addEventListener('keypress', handleKeyDown)
    return () => window.removeEventListener('keypress', handleKeyDown)
  }, [])

  return (
    <ToolBarButton
      active={activeTool === TOOLS.BUCKET}
      icon={<BucketIcon className='w-full h-full' />}
      onPress={() => setActiveTool(TOOLS.BUCKET)}
      isDisabled={isDrawed}
      name='Bucket / Cubo ( B / 3 )'
      description={
        'Pinta de color toda un área que sea del mismo color. En areas grandes o complejas puede ser un proceso costoso y afectar al rendimiento.'
      }
    />
  )
}
