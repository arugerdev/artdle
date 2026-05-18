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
import ProfilePage from './pages/profile'
import { ErrorBoundary } from './components/errorBoundary'

function App () {
  // Force the TurnPhone hint only when the device is a real phone in
  // portrait. A desktop user with a narrow window can still draw — the
  // old logic kicked them out too.
  const computeNeedsLandscape = () => {
    if (typeof window === 'undefined') return false
    const isPortrait = window.innerHeight > window.innerWidth
    const isTouchPrimary = window.matchMedia?.('(pointer: coarse)').matches
    return isPortrait && isTouchPrimary
  }

  const [needsLandscape, setNeedsLandscape] = useState(computeNeedsLandscape())

  useEffect(() => {
    const handleResize = () => setNeedsLandscape(computeNeedsLandscape())
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [])

  return (
    <ErrorBoundary>
      <Switch>
        {!needsLandscape && <Route path='/' component={MainPage} />}
        {needsLandscape && <Route path='/' component={TurnPhonePage} />}

        <Route path='/api/draw' component={DrawPage} />
        <Route path='/draw' component={DrawPage} />

        <Route path='/u/:username' component={ProfilePage} />
        <Route path='/about' component={AboutPage} />
        <Route path='/explore' component={ExplorePage} />
        <Route path='/howtoplay' component={HowToPlayPage} />
        <Route path='/privacy' component={PrivacyPage} />
        <Route path='/conditions' component={TermsOfServicePage} />
        <Route path='' component={NotFoundPage} />
      </Switch>
    </ErrorBoundary>
  )
}

export default App
