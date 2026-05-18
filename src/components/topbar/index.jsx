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
        base: 'bg-white/60 backdrop-blur-xl border-b border-white/60 shadow-[0_2px_20px_rgb(15,23,42,0.04)]',
        wrapper: 'max-w-screen-2xl px-4 sm:px-6',
        item: ['data-[active=true]:font-semibold', 'data-[active=true]:text-slate-900']
      }}
    >
      {/* -------------- PC -------------- */}
      <NavbarContent className='hidden sm:flex gap-6 w-full' justify='start'>
        <NavbarBrand>
          <Link
            className='flex flex-row gap-2 items-center text-slate-900 cursor-pointer'
            onPress={() => pushLocation('/')}
          >
            <Image src={Logo} width={36} height={36} radius='full' />
            <p className='font-bold text-base tracking-tight'>Artdle</p>
          </Link>
        </NavbarBrand>

        {menuItems.map((item, i) => (
          <NavbarItem key={item.label + i} isActive={location === item.path}>
            <Link
              className={`text-sm cursor-pointer transition-colors ${
                location === item.path
                  ? 'text-slate-900 font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
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
          <Button
            size='sm'
            variant='flat'
            radius='full'
            onPress={toggleLang}
            aria-label='Change language'
            className='bg-white/50 backdrop-blur-md border border-slate-200/60 text-xs font-medium text-slate-600'
          >
            {lang === 'es' ? 'EN' : 'ES'}
          </Button>
        </NavbarItem>
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
