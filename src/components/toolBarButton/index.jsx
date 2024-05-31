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
export const ToolBarButton = ({
  active = false,
  onPress = () => {},
  icon = React.Fragment,
  isDisabled = false,
  name = 'A button',
  description = 'A description of a button',
  placement = 'left',
  modal = false,
  modalContent = null,
  modalTitle = ''
}) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  return (
    <>
      <Tooltip
        size='sm'
        shadow='xl'
        showArrow={true}
        placement={placement}
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
          placement='bottom-center'
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
