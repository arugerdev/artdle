/* eslint-disable react/prop-types */
import { Component } from 'react'
import { Button } from '@nextui-org/react'
import i18n from '../../i18n'

export class ErrorBoundary extends Component {
  constructor (props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError (error) {
    return { hasError: true, error }
  }

  componentDidCatch (error, info) {
    if (typeof console !== 'undefined') {
      console.error('[ErrorBoundary]', error, info?.componentStack)
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  handleHome = () => {
    window.location.href = '/'
  }

  render () {
    if (!this.state.hasError) return this.props.children

    const t = (k) => i18n.t(k)
    return (
      <main className='flex flex-col gap-8 justify-center items-center h-full w-full min-w-screen min-h-screen p-6'>
        <section className='ios-card flex flex-col items-center justify-center text-center max-w-md rounded-3xl p-8'>
          <h1 className='font-extrabold text-2xl text-slate-900 dark:text-zinc-100'>{t('errorBoundary.title')}</h1>
          <h2 className='font-semibold text-slate-500 dark:text-zinc-400 mt-2'>{t('errorBoundary.subtitle')}</h2>
          <p className='font-mono text-xs text-slate-400 dark:text-zinc-500 mt-4 max-w-prose break-words'>
            {String(this.state.error?.message ?? this.state.error ?? 'Error desconocido')}
          </p>
          <section className='flex flex-row items-center justify-center gap-2 mt-6'>
            <Button
              radius='full'
              className='bg-slate-900 text-white dark:bg-zinc-50 dark:text-slate-900 font-semibold'
              onPress={this.handleReload}
            >
              {t('errorBoundary.reload')}
            </Button>
            <Button
              radius='full'
              variant='light'
              className='font-semibold text-slate-700 dark:text-zinc-300'
              onPress={this.handleHome}
            >
              {t('errorBoundary.home')}
            </Button>
          </section>
        </section>
      </main>
    )
  }
}
