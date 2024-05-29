import { Switch, Route } from 'wouter'
import MainPage from './pages/main'
import NotFoundPage from './pages/notfoundpage'
import AboutPage from './pages/about'
import ExplorePage from './pages/explore'
import HowToPlayPage from './pages/howtoplay'
import { isMobile } from './utils/system'
import { useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import PrivacyPage from './pages/privacy'
import TermsOfServicePage from './pages/termsOfService'

function App () {
  useEffect(() => {
    if (isMobile()) {
      toast.error(
        <h1 className='text-sm font-extrabold text-start p-4 border-b-2'>
          Lo siento pero esta web aun no esta preparada para poder dibujar en
          dispositivos móviles, si quieres dibujar debe de ser en un ordenador
          😥
        </h1>
      )
    }
  }, [])

  return (
    <>
      <Toaster />
      <Switch>
        {!isMobile() && <Route path='/' component={MainPage} />}
        <Route path='/about' component={AboutPage} />
        <Route path='/explore' component={ExplorePage} />
        <Route path='/howtoplay' component={HowToPlayPage} />
        <Route path='/privacy' component={PrivacyPage} />
        <Route path='/conditions' component={TermsOfServicePage} />
        <Route path='' component={NotFoundPage} />
      </Switch>
    </>
  )
}

export default App
