import { Switch, Route } from 'wouter'
import MainPage from './pages/main'
import NotFoundPage from './pages/notfoundpage'
import AboutPage from './pages/about'
import ExplorePage from './pages/explore'
import HowToPlayPage from './pages/howtoplay'

function App () {
  return (
    <>
      <Switch>
        <Route path='/' component={MainPage} />
        <Route path='/about' component={AboutPage} />
        <Route path='/explore' component={ExplorePage} />
        <Route path='/howtoplay' component={HowToPlayPage} />
        <Route path='' component={NotFoundPage} />
      </Switch>
    </>
  )
}

export default App
