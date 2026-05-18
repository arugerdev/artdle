/* eslint-disable react/prop-types */
import { LineIcon } from '../../../assets/icons'
import { ToolBarButton } from '../../toolBarButton/index'
import { TOOLS } from '../../../utils/tools'

export const Line = ({ activeTool, setActiveTool = () => {}, isDrawed = false }) => (
  <ToolBarButton
    active={activeTool === TOOLS.LINE}
    icon={<LineIcon className='w-full h-full' />}
    onPress={() => setActiveTool(TOOLS.LINE)}
    isDisabled={isDrawed}
    name='Línea / Line ( L )'
    description='Dibuja una línea recta arrastrando el ratón.'
  />
)
