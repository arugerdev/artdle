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
  Skeleton
} from '@nextui-org/react'
import { useEffect, useState } from 'react'
import Logo from '../../assets/img/icon.png'
import { useLocation } from 'wouter'
import { getAuthData, loginWithGoogle, signOut } from '../../utils/supabase'
import toast from 'react-hot-toast'
import { UserButton } from '../userButton'
import { isMobile } from '../../utils/system'
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
  const [loadingUserData, setLoadingUserData] = useState(true)

  useEffect(() => {
    getAuthData()
      .then(data => {
        setUserData(data.data.user)
      })
      .finally(() => {
        setLoadingUserData(false)
      })
  }, [])

  return (
    <Navbar
      isBordered
      shouldHideOnScroll={!isMobile()}
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      position='static'
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
          <Skeleton isLoaded={!loadingUserData} className='rounded-xl'>
            {(!userData || !userData.email) && (
              <Button
                as={Link}
                onPress={() =>
                  loginWithGoogle().then(() => {
                    toast.success('Sesión iniciada correctamente')
                  })
                }
                color='primary'
                variant='light'
              >
                Iniciar Sesión
              </Button>
            )}
            {userData && userData.email && userData.identities.length > 0 && (
              <UserButton userData={userData} signOut={signOut} />
            )}
          </Skeleton>
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
                loginWithGoogle().then(() => {
                  toast.success('Sesión iniciada correctamente')
                })
              }
              color='primary'
              variant='light'
            >
              Iniciar Sesión
            </Button>
          )}
          {userData && userData.email && userData.identities.length > 0 && (
            <UserButton userData={userData} signOut={signOut} />
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
