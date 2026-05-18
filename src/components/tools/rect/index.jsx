/* eslint-disable react/prop-types */
import { RectIcon } from '../../../assets/icons'
import { ToolBarButton } from '../../toolBarButton/index'
import { TOOLS } from '../../../utils/tools'

export const Rect = ({ activeTool, setActiveTool = () => {}, isDrawed = false }) => (
  <ToolBarButton
    active={activeTool === TOOLS.RECT}
    icon={<RectIcon className='w-full h-full' />}
    onPress={() => setActiveTool(TOOLS.RECT)}
    isDisabled={isDrawed}
    name='Rectángulo / Rectangle ( R )'
    description='Dibuja un rectángulo arrastrando desde una esquina a la otra.'
  />
)
