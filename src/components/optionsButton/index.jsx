/* eslint-disable react/prop-types */
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea
} from '@nextui-org/react'
import { InfoIcon, OptionsIcon, ReportIcon } from '../../assets/icons'
import { useState } from 'react'
import supabase, { sendReport } from '../../utils/supabase'
import { CopyDetail } from './../copyDetail/index'

const TYPE = {
  INFO: 0,
  REPORT: 1
}

export const OptionsButton = ({ data = {} }) => {
  const [loading, setLoading] = useState(false)
  const [reportText, setReportText] = useState('')
  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  const [type, setType] = useState(TYPE.INFO)

  return (
    <>
      <Dropdown>
        <DropdownTrigger>
          <Button
            isIconOnly
            variant='light'
            className='flex items-center justify-center text-center p-0'
          >
            <OptionsIcon className='w-full h-full p-2 text-black' />
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          variant='faded'
          aria-label='Dropdown menu with description'
        >
          <DropdownItem
            key='info'
            description='Información sobre el dibujo'
            onPress={() => {
              setType(TYPE.INFO)
              onOpen()
            }}
            startContent={
              <InfoIcon className='w-[32px] h-[32px] p-0 text-black' />
            }
          >
            Información
          </DropdownItem>

          <DropdownItem
            key='report'
            className='text-danger'
            color='danger'
            description='Reporta el dibujo'
            onPress={() => {
              setType(TYPE.REPORT)
              onOpen()
            }}
            startContent={<ReportIcon className='w-[32px] h-[32px] p-0' />}
          >
            Reportar Dibujo
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        className='w-full min-w-[40%]'
        placement='bottom-center'
      >
        <ModalContent>
          {onClose => (
            <>
              {type === TYPE.INFO && (
                <>
                  <ModalHeader className='flex flex-col gap-1'>
                    Información
                  </ModalHeader>
                  <ModalBody className='flex flex-col gap-2 w-full'>
                    <CopyDetail title='Nombre del dibujo:' toCopy={data.name} />
                    <CopyDetail title='Dia de dibujo:' toCopy={data.day} />
                    <CopyDetail
                      title='Fecha de creacción:'
                      toCopy={data.created_at}
                    />
                    <CopyDetail title='Imagen en URI:' toCopy={data.uridata} />
                  </ModalBody>
                  <ModalFooter>
                    <Button color='danger' variant='light' onPress={onClose}>
                      Cerrar
                    </Button>
                  </ModalFooter>
                </>
              )}
              {type === TYPE.REPORT && (
                <>
                  <ModalHeader className='flex flex-col gap-1'>
                    Reporte
                  </ModalHeader>
                  <ModalBody>
                    <Textarea
                      autoFocus
                      label='Reporte'
                      placeholder='Escribe aquí una descripción del reporte...'
                      variant='bordered'
                      value={reportText}
                      onValueChange={setReportText}
                    />
                  </ModalBody>
                  <ModalFooter>
                    <Button color='success' variant='flat' onPress={onClose}>
                      Cerrar
                    </Button>
                    <Button
                      isLoading={loading}
                      color='danger'
                      onPress={() => {
                        setLoading(true)
                        supabase.auth.getUser().then(async user => {
                          sendReport(
                            user,
                            data,
                            reportText,
                            onClose,
                            setLoading
                          )
                        })
                      }}
                    >
                      Enviar
                    </Button>
                  </ModalFooter>
                </>
              )}
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
