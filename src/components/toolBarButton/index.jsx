/* eslint-disable react/prop-types */
import { Tooltip, Button } from '@nextui-org/react'
import React from 'react'
export const ToolBarButton = ({
  active = false,
  onPress = () => {},
  icon = React.Fragment,
  isDisabled = false,
  name = 'A button',
  description = 'A description of a button'
}) => {
  return (
    <Tooltip
      size='sm'
      shadow='xl'
      showArrow={true}
      placement={'left'}
      content={
        <div className='flex flex-col items-start justify-center'>
          <h1 className='font-extrabold max-w-prose text-pretty'>{name}</h1>
          <p className='max-w-[200px] text-pretty'>{description}</p>
        </div>
      }
    >
      <Button
        className={`${
          active ? 'border-2 border-blue-500 bg-slate-300' : ''
        } bg-transparent justify-center p-2`}
        isIconOnly
        onPress={() => onPress()}
        isDisabled={isDisabled}
      >
        {icon}
      </Button>
    </Tooltip>
  )
}
