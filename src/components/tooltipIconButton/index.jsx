/* eslint-disable react/prop-types */
import { Button, Tooltip } from '@nextui-org/react'

/**
 * Icon-only button that ALWAYS exposes a tooltip + aria-label.
 * Drop-in replacement for `<Button isIconOnly>` anywhere we'd otherwise
 * forget to add an accessible label.
 */
export const TooltipIconButton = ({
  tooltip,
  shortcut,
  placement = 'top',
  delay = 200,
  active = false,
  className = '',
  children,
  ...rest
}) => {
  return (
    <Tooltip
      content={
        <div className='flex flex-col gap-0 px-1 py-0.5'>
          <span className='text-xs font-semibold'>{tooltip}</span>
          {shortcut && (
            <kbd className='text-[10px] font-mono text-gray-400'>{shortcut}</kbd>
          )}
        </div>
      }
      placement={placement}
      delay={delay}
      closeDelay={0}
      showArrow
    >
      <Button
        isIconOnly
        size='sm'
        variant='light'
        aria-label={tooltip}
        aria-pressed={active}
        className={`transition-colors ${active ? 'border-2 border-primary bg-primary/10' : ''} ${className}`}
        {...rest}
      >
        {children}
      </Button>
    </Tooltip>
  )
}
