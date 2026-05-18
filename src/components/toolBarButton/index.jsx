/* eslint-disable react/prop-types */
import {
  Tooltip,
  Button,
  Modal,
  useDisclosure,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter
} from '@nextui-org/react'
import React from 'react'

function parseShortcut (raw = '') {
  const match = /^(.*?)\s*\(\s*([^)]+)\s*\)\s*$/.exec(raw)
  if (!match) return { label: raw, shortcut: null }
  return { label: match[1].trim(), shortcut: match[2].trim() }
}

export const ToolBarButton = ({
  active = false,
  onPress = () => {},
  icon = React.Fragment,
  isDisabled = false,
  name = 'A button',
  description = 'A description of a button',
  placement = 'right',
  modal = false,
  modalContent = null,
  modalTitle = ''
}) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const { label, shortcut } = parseShortcut(name)

  return (
    <>
      <Tooltip
        size='sm'
        shadow='lg'
        showArrow
        delay={200}
        closeDelay={0}
        placement={placement}
        content={
          <div className='flex flex-col gap-0 max-w-[220px] py-1 px-1'>
            <div className='flex flex-row items-center gap-2'>
              <span className='font-semibold text-sm text-pretty text-slate-900 dark:text-zinc-100'>{label}</span>
              {shortcut && (
                <kbd className='text-[10px] font-mono px-1 py-px rounded bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300'>
                  {shortcut}
                </kbd>
              )}
            </div>
            {description && (
              <p className='text-xs text-slate-500 dark:text-zinc-400 text-pretty mt-0.5'>
                {description}
              </p>
            )}
          </div>
        }
        classNames={{
          content: 'ios-card'
        }}
      >
        <Button
          className={`min-w-8 w-8 h-8 transition-colors ${
            active
              ? 'bg-slate-900 text-white dark:bg-zinc-50 dark:text-slate-900 shadow-md'
              : 'bg-transparent text-slate-600 dark:text-zinc-400 hover:bg-white/60 dark:hover:bg-zinc-700/60 hover:text-slate-900 dark:hover:text-zinc-100'
          }`}
          isIconOnly
          radius='full'
          aria-label={label}
          aria-pressed={active}
          onPress={modal && onPress === null ? onOpen : () => onPress()}
          isDisabled={isDisabled}
        >
          {icon}
        </Button>
      </Tooltip>
      {modal && (
        <Modal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          className='w-full min-w-[40%] max-w-screen-md max-h-screen'
          placement={placement}
          backdrop='blur'
          classNames={{
            base: 'ios-card text-slate-900 dark:text-zinc-100',
            closeButton: 'text-slate-500 dark:text-zinc-400'
          }}
        >
          <ModalContent>
            {onClose => (
              <>
                <ModalHeader className='flex flex-col gap-1'>
                  {modalTitle}
                </ModalHeader>
                <ModalBody className='flex flex-col gap-2 w-full'>
                  {modalContent}
                </ModalBody>
                <ModalFooter>
                  <Button color='danger' variant='light' onPress={onClose}>
                    Cerrar
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      )}
    </>
  )
}
