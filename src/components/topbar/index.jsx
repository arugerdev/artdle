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
import { ThemeToggle } from '../themeToggle'
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
        base: 'ios-card border-b backdrop-saturate-150',
        wrapper: 'max-w-screen-2xl px-4 sm:px-6',
        item: [
          'data-[active=true]:font-semibold',
          'data-[active=true]:text-slate-900',
          'dark:data-[active=true]:text-zinc-50'
        ],
        menu: 'ios-card border-l border-slate-200 dark:border-zinc-800 mt-0',
        menuItem: 'text-slate-700 dark:text-zinc-300',
        toggleIcon: 'text-slate-700 dark:text-zinc-200'
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
          <ThemeToggle />
        </NavbarItem>
        <NavbarItem className='hidden sm:flex'>
          <button
            type='button'
            onClick={toggleLang}
            aria-label={`Idioma actual: ${lang.toUpperCase()}. Cambiar a ${lang === 'es' ? 'inglés' : 'español'}`}
            className='group relative inline-flex h-8 w-14 items-center rounded-full ios-chip px-1 text-[10px] font-mono uppercase tracking-wider'
          >
            <span
              className={`absolute top-0.5 h-7 w-6 rounded-full bg-white/90 dark:bg-zinc-50/95 shadow-sm transition-all duration-300 ${
                lang === 'es' ? 'left-0.5' : 'left-[1.65rem]'
              }`}
            />
            <span className={`relative z-10 flex-1 text-center ${lang === 'es' ? 'text-slate-900' : 'text-slate-500 dark:text-zinc-500'}`}>ES</span>
            <span className={`relative z-10 flex-1 text-center ${lang === 'en' ? 'text-slate-900' : 'text-slate-500 dark:text-zinc-500'}`}>EN</span>
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
                className='bg-slate-900 text-white dark:bg-zinc-50 dark:text-slate-900 font-semibold hover:bg-slate-700 dark:hover:bg-zinc-200 transition-colors cursor-pointer'
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
            className='flex flex-row gap-2 items-center cursor-pointer text-slate-900 dark:text-zinc-50'
            onPress={() => pushLocation('/')}
          >
            <Image src={Logo} width={32} height={32} radius='full' className='ring-1 ring-slate-200 dark:ring-zinc-700' />
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
