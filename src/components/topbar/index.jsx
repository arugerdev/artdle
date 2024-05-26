import {
  Navbar,
  NavbarBrand,
  NavbarMenuToggle,
  NavbarMenuItem,
  NavbarMenu,
  NavbarContent,
  NavbarItem,
  Link,
  Image
} from '@nextui-org/react'
import { useState } from 'react'
import Logo from '../../assets/img/icon.png'
import { useLocation } from 'wouter'
export const Topbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [location, pushLocation] = useLocation()

  const menuItems = ['Inicio', 'Explorar', 'Sobre nosotros', 'Como jugar']

  return (
    <Navbar
      isBordered
      shouldHideOnScroll
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      className='flex flex-row w-full max-w-screen items-center justify-center'
    >
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
            ¿Como jugar?
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

      <NavbarMenu>
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item}-${index}`}>
            <Link
              className='w-full'
              color={
                index === 2
                  ? 'warning'
                  : index === menuItems.length - 1
                  ? 'danger'
                  : 'foreground'
              }
              href='#'
              size='lg'
            >
              {item}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </Navbar>
  )
}
