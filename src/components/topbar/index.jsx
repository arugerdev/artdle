import {
  Navbar,
  NavbarBrand,
  NavbarMenuToggle,
  NavbarMenuItem,
  NavbarMenu,
  NavbarContent,
  NavbarItem,
  Link,
  Image,
  Button,
  User,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem
} from '@nextui-org/react'
import { useEffect, useState } from 'react'
import Logo from '../../assets/img/icon.png'
import { useLocation } from 'wouter'
import { getAuthData, loginWithGoogle, signOut } from '../../utils/supabase'
import toast from 'react-hot-toast'
export const Topbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [location, pushLocation] = useLocation()

  const menuItems = [
    { label: 'Inicio', path: '/' },
    { label: 'Explorar dibujos', path: '/explore' },
    { label: '¿Cómo jugar?', path: '/howtoplay' },
    { label: 'Sobre Mí', path: '/about' }
  ]
  const [userData, setUserData] = useState(null)

  useEffect(() => {
    getAuthData().then(data => {
      setUserData(data.data.user)
    })
  }, [])

  return (
    <Navbar
      isBordered
      shouldHideOnScroll
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      className='flex flex-row w-full max-w-screen items-center justify-center'
    >
      {/* -------------- PC -------------- */}
      <NavbarContent className='hidden sm:flex gap-4 w-full' justify='center'>
        <NavbarBrand>
          <Link
            className='flex flex-row gap-4 text-black cursor-pointer'
            onPress={() => pushLocation('/')}
          >
            <Image href={''} src={Logo} width={'64px'} height={'64px'} />
            <p className='font-bold text-inherit'>Artdle</p>
          </Link>
        </NavbarBrand>

        {menuItems.map((item, i) => (
          <NavbarItem key={item.label + i} isActive={location == item.path}>
            <Link
              color='foreground'
              href=''
              onPress={() => pushLocation(item.path)}
            >
              {item.label}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>
      <NavbarContent justify='end'>
        <NavbarItem className='hidden sm:flex'>
          {(!userData || !userData.email) && (
            <Button
              as={Link}
              onPress={() =>
                loginWithGoogle().then(data => {
                  console.log(data)
                })
              }
              color='primary'
              variant='light'
            >
              Iniciar Sesión
            </Button>
          )}
          {userData && userData.email && userData.identities.length > 0 && (
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
                <DropdownMenu aria-label='Acciones de cuenta' variant='flat'>
                  <DropdownItem
                    key='profile'
                    className='h-14 gap-2'
                    onPress={() => {
                      navigator.clipboard.writeText(userData.email.toString())
                      toast.success('Correo copiado correctamente')
                    }}
                  >
                    <p className='font-semibold'>Registrado como:</p>
                    <p className='font-semibold text-gray-500'>
                      {userData.email}
                    </p>
                  </DropdownItem>
                  <DropdownItem
                    key='signOut'
                    onPress={() => {
                      signOut().then(() => {
                        window.location.reload()
                      })
                    }}
                    className='font-extrabold text-danger-500 bg-transparent hover:bg-danger-200 transition-background cursor-pointer'
                  >
                    <p>Cerrar sesión</p>
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </Button>
          )}
        </NavbarItem>
      </NavbarContent>
      {/* -------------- END PC -------------- */}

      {/* -------------- MOBILE -------------- */}
      <NavbarContent className='flex sm:hidden w-full' justify='center'>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        />
      </NavbarContent>

      <NavbarContent className='sm:hidden pr-3 w-full' justify='center'>
        <NavbarBrand>
          <Link
            className='flex flex-row gap-4 text-black cursor-pointer'
            onPress={() => pushLocation('/')}
          >
            <Image src={Logo} width={'64px'} height={'64px'} />
            <p className='font-bold text-inherit'>Artdle</p>
          </Link>
        </NavbarBrand>
        <NavbarItem className='sm:hidden pr-3 w-full'>
          {(!userData || !userData.email) && (
            <Button
              as={Link}
              onPress={() =>
                loginWithGoogle().then(data => {
                  console.log(data)
                })
              }
              color='primary'
              variant='light'
            >
              Iniciar Sesión
            </Button>
          )}
          {userData && userData.email && userData.identities.length > 0 && (
            <Button
              as={Link}
              onPress={() => {
                signOut().then(() => {
                  window.location.reload()
                })
              }}
              className='flex items-center justify-center bg-transparent rounded-full w-[40px] h-[40px] max-w-[40px] max-h-[40px] min-w-[40px] min-h-[40px]'
            >
              <User
                className='flex items-center justify-center'
                avatarProps={{
                  src: userData.identities[0].identity_data.picture
                }}
              />
            </Button>
          )}
        </NavbarItem>
      </NavbarContent>

      <NavbarMenu>
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item.label}-${index}`}>
            <Link
              className='w-full cursor-pointer'
              color={'foreground'}
              href=''
              size='lg'
              onPress={() => pushLocation(item.path)}
            >
              {item.label}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
      {/* -------------- END MOBILE -------------- */}
    </Navbar>
  )
}
