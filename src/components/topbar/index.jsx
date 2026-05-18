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
import { useTranslation } from 'react-i18next'
import i18n from '../../i18n'
export const Topbar = () => {
  const { t } = useTranslation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [location, pushLocation] = useLocation()
  const [lang, setLang] = useState(i18n.language?.split('-')[0] ?? 'es')

  const menuItems = [
    { label: t('nav.home'), path: '/' },
    { label: t('nav.explore'), path: '/explore' },
    { label: t('nav.howToPlay'), path: '/howtoplay' },
    { label: t('nav.about'), path: '/about' }
  ]

  const toggleLang = () => {
    const next = lang === 'es' ? 'en' : 'es'
    i18n.changeLanguage(next)
    setLang(next)
  }
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
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      position='sticky'
      maxWidth='full'
      classNames={{
        base: 'bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800 shadow-none',
        wrapper: 'max-w-screen-2xl px-4 sm:px-6',
        item: ['data-[active=true]:font-semibold', 'data-[active=true]:text-zinc-50'],
        menu: 'bg-zinc-950 border-l border-zinc-800',
        menuItem: 'text-zinc-300',
        toggleIcon: 'text-zinc-300'
      }}
    >
      {/* -------------- PC -------------- */}
      <NavbarContent className='hidden sm:flex gap-6 w-full' justify='start'>
        <NavbarBrand>
          <Link
            className='flex flex-row gap-2 items-center cursor-pointer text-zinc-50'
            onPress={() => pushLocation('/')}
          >
            <Image src={Logo} width={32} height={32} radius='full' className='ring-1 ring-zinc-700' />
            <p className='font-semibold text-base tracking-tight'>Artdle</p>
          </Link>
        </NavbarBrand>

        {menuItems.map((item, i) => (
          <NavbarItem key={item.label + i} isActive={location === item.path}>
            <Link
              className={`text-sm cursor-pointer transition-colors ${
                location === item.path
                  ? 'text-zinc-50 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-50'
              }`}
              onPress={() => pushLocation(item.path)}
            >
              {item.label}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>
      <NavbarContent justify='end'>
        <NavbarItem className='hidden sm:flex'>
          <button
            type='button'
            onClick={toggleLang}
            aria-label={`Idioma actual: ${lang.toUpperCase()}. Cambiar a ${lang === 'es' ? 'inglés' : 'español'}`}
            className='group relative inline-flex h-7 w-14 items-center rounded-full border border-zinc-800 bg-zinc-900 px-1 text-[10px] font-mono uppercase tracking-wider transition-colors hover:border-zinc-700'
          >
            <span
              className={`absolute top-0.5 h-5 w-6 rounded-full bg-zinc-50 shadow-sm transition-all duration-300 ${
                lang === 'es' ? 'left-0.5' : 'left-[1.65rem]'
              }`}
            />
            <span className={`relative z-10 flex-1 text-center ${lang === 'es' ? 'text-zinc-950' : 'text-zinc-500'}`}>ES</span>
            <span className={`relative z-10 flex-1 text-center ${lang === 'en' ? 'text-zinc-950' : 'text-zinc-500'}`}>EN</span>
          </button>
        </NavbarItem>
        <NavbarItem className='hidden sm:flex'>
          <Skeleton isLoaded={!loadingUserData} className='rounded-xl'>
            {(!userData || !userData.email) && (
              <Button
                as={Link}
                size='sm'
                radius='full'
                onPress={() =>
                  loginWithGoogle().then(() => {
                    toast.success('Sesión iniciada correctamente')
                  })
                }
                className='bg-zinc-50 text-zinc-950 font-semibold hover:bg-zinc-200 transition-colors cursor-pointer'
              >
                {t('nav.signIn')}
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
            className='flex flex-row gap-2 items-center cursor-pointer text-zinc-50'
            onPress={() => pushLocation('/')}
          >
            <Image src={Logo} width={32} height={32} radius='full' className='ring-1 ring-zinc-700' />
            <p className='font-semibold text-base text-inherit'>Artdle</p>
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
