/* eslint-disable react/prop-types */
import {
  Button,
  User,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem
} from '@nextui-org/react'
import toast from 'react-hot-toast'

export const UserButton = ({ userData = null, signOut = () => {} }) => {
  if (!userData) return

  return (
    <Button
      as={Button}
      className='flex items-center justify-center bg-transparent rounded-full w-[40px] h-[40px] max-w-[40px] max-h-[40px] min-w-[40px] min-h-[40px]'
    >
      <Dropdown placement='bottom-end'>
        <DropdownTrigger>
          <User
            isBordered
            as={Button}
            className='flex items-center justify-center gap-0 p-0'
            avatarProps={{
              src: userData.identities[0].identity_data.picture
            }}
          />
        </DropdownTrigger>
        <DropdownMenu
          aria-label='Acciones de cuenta'
          variant='flat'
          classNames={{ base: 'ios-card' }}
        >
          <DropdownItem
            key='profile'
            className='h-14 gap-2'
            onPress={() => {
              navigator.clipboard.writeText(userData.email.toString())
              toast.success('Correo copiado correctamente')
            }}
          >
            <p className='font-semibold text-slate-900 dark:text-zinc-100 text-xs uppercase tracking-widest'>Registrado como:</p>
            <p className='text-slate-600 dark:text-zinc-400 text-sm truncate'>{userData.email}</p>
          </DropdownItem>
          <DropdownItem
            key='signOut'
            onPress={() => signOut().then(() => window.location.reload())}
            className='font-semibold text-danger-500 hover:bg-danger-100 dark:hover:bg-danger-900/20 transition-background cursor-pointer'
          >
            Cerrar sesión
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </Button>
  )
}
