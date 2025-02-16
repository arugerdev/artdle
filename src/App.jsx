import { Switch, Route } from 'wouter'
import MainPage from './pages/main'
import NotFoundPage from './pages/notfoundpage'
import AboutPage from './pages/about'
import ExplorePage from './pages/explore'
import HowToPlayPage from './pages/howtoplay'
import { useEffect, useState } from 'react'
import PrivacyPage from './pages/privacy'
import TermsOfServicePage from './pages/termsOfService'
import TurnPhonePage from './pages/turnphone'
import DrawPage from './pages/draw'

function App () {
  const [screen, setScreen] = useState({
    x: window.innerWidth,
    y: window.innerHeight
  })

  useEffect(() => {
    const handleResize = () => {
      setScreen({
        x: window.innerWidth,
        y: window.innerHeight
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <>
      <Switch>
        {!(screen.x <= screen.y) && <Route path='/' component={MainPage} />}
        {screen.x <= screen.y && <Route path='/' component={TurnPhonePage} />}

        <Route path='/api/draw' component={DrawPage} />
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
