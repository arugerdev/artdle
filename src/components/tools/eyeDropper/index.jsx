/* eslint-disable react/prop-types */
import { TOOLS } from '../../../utils/tools'
import { ToolBarButton } from './../../toolBarButton/index'
import { ColoPickerIcon } from './../../../assets/icons/index'
import { useCallback, useEffect } from 'react'
import toast from 'react-hot-toast'
import useEyeDropper from 'use-eye-dropper'

export const EyeDropper = ({
  activeTool,
  setActiveTool = () => {},
  setColor = () => {},
  isDrawed = false
}) => {
  const { open, close, isSupported } = useEyeDropper()

  const pickColor = useCallback(() => {
    setActiveTool(TOOLS.EYEDROPPER)
    const openPicker = async () => {
      try {
        const color = await open()
        setColor(color.sRGBHex)
        setActiveTool(TOOLS.PENCIL)
      } catch (e) {
        close()
        setActiveTool(TOOLS.PENCIL)
        if (!e.canceled) toast.error('La selección de color ha sido cancelada.')
      }
    }
    openPicker()
  }, [open])

  const handleKeyDown = e => {
    if (e.key === 'c' || e.key === 'C' || e.key === '4') {
      e.preventDefault()
      if (isSupported()) {
        pickColor()
      } else {
        setActiveTool(TOOLS.EYEDROPPER)
      }
    }
  }

  useEffect(() => {
    document.addEventListener('keypress', handleKeyDown)
    return () => window.removeEventListener('keypress', handleKeyDown)
  }, [])

  return (
    <ToolBarButton
      active={activeTool === TOOLS.EYEDROPPER}
      icon={<ColoPickerIcon className='w-full h-full' />}
      onPress={() =>
        isSupported() ? pickColor() : setActiveTool(TOOLS.EYEDROPPER)
      }
      isDisabled={isDrawed}
      name='Color Picker ( C / 4 )'
      description={
        'Se utiliza para seleccionar un color de el lienzo, se puede usar para cuando se quiere el mismo color que ya esta dibujado.'
      }
    />
  )
}
