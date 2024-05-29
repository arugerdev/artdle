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
  User
} from '@nextui-org/react'
import { useEffect, useState } from 'react'
import Logo from '../../assets/img/icon.png'
import { useLocation } from 'wouter'
import { getAuthData, loginWithGoogle, signOut } from '../../utils/supabase'
export const Topbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [location, pushLocation] = useLocation()

  const menuItems = [
    { label: 'Inicio', path: '/' },
    { label: 'Explorar dibujos', path: '/explore' },
    { label: '¿Cómo jugar?', path: '/howtoplay' },
    { label: 'Sobre nosotros', path: '/about' }
  ]
  const [userData, setUserData] = useState(null)

  useEffect(() => {
    getAuthData().then(data => {
      console.log(data)
      setUserData(data)
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
        <NavbarItem isActive={location == '/'}>
          <Link color='foreground' href='' onPress={() => pushLocation('/')}>
            Inicio
          </Link>
        </NavbarItem>
        <NavbarItem isActive={location == '/explore'}>
          <Link
            color='foreground'
            href=''
            onPress={() => pushLocation('/explore')}
          >
            Explorar dibujos
          </Link>
        </NavbarItem>
        <NavbarItem isActive={location == '/howtoplay'}>
          <Link
            color='foreground'
            href=''
            onPress={() => pushLocation('/howtoplay')}
          >
            ¿Cómo jugar?
          </Link>
        </NavbarItem>
        <NavbarItem isActive={location == '/about'}>
          <Link
            color='foreground'
            href=''
            onPress={() => pushLocation('/about')}
          >
            Sobre nosotros
          </Link>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify='end'>
        <NavbarItem className='hidden sm:flex'>
          {!userData && (
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
          {userData && (
            <Button
              as={Link}
              onPress={() => {
                signOut().then(data => {
                  console.log(data)
                  window.location.reload()
                })
              }}
              className='flex items-center justify-center bg-transparent rounded-full w-[40px] h-[40px] max-w-[40px] max-h-[40px] min-w-[40px] min-h-[40px]'
            >
              <User
                className='flex items-center justify-center'
                avatarProps={{
                  src: userData.identity_data.picture
                }}
              />
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
