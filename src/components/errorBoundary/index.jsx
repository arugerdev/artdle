/* eslint-disable react/prop-types */
import { Component } from 'react'
import { Button } from '@nextui-org/react'

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

    return (
      <main className='flex flex-col gap-8 justify-center items-center h-full w-full min-w-screen min-h-screen p-6'>
        <section className='flex flex-col items-center justify-center text-center'>
          <h1 className='font-extrabold text-2xl'>
            Algo ha ido mal mientras dibujábamos esta página 🎨
          </h1>
          <h2 className='font-semibold text-gray-600 mt-2'>
            Lo sentimos, ha ocurrido un error inesperado.
          </h2>
          <p className='font-mono text-xs text-gray-400 mt-4 max-w-prose break-words'>
            {String(this.state.error?.message ?? this.state.error ?? 'Error desconocido')}
          </p>
        </section>
        <section className='flex flex-row items-center justify-center gap-2'>
          <Button
            variant='flat'
            color='primary'
            className='font-bold text-md'
            onPress={this.handleReload}
          >
            Recargar página
          </Button>
          <Button
            variant='light'
            className='font-bold text-md'
            onPress={this.handleHome}
          >
            Ir al inicio
          </Button>
        </section>
      </main>
    )
  }
}
