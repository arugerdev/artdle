/* eslint-disable react/prop-types */
import { Tooltip } from '@nextui-org/react'

/**
 * Compact layer panel: per-layer visibility toggle + active-layer
 * selector. Designed to live inside the Drawer toolbar.
 */
export const LayerPanel = ({ layers, activeLayer, setLayers, setActiveLayer }) => {
  const toggle = id =>
    setLayers(prev => prev.map(l => (l.id === id ? { ...l, visible: !l.visible } : l)))

  return (
    <div
      className='flex flex-row lg:flex-col gap-1.5 items-center justify-center'
      role='group'
      aria-label='Capas'
    >
      {layers.map(layer => (
        <div key={layer.id} className='flex flex-row items-center gap-1'>
          <Tooltip
            content={layer.visible ? `Ocultar ${layer.name}` : `Mostrar ${layer.name}`}
            placement='right'
            delay={200}
            closeDelay={0}
            size='sm'
          >
            <button
              type='button'
              aria-label={`${layer.visible ? 'Ocultar' : 'Mostrar'} ${layer.name}`}
              aria-pressed={!layer.visible}
              onClick={() => toggle(layer.id)}
              className={`text-xs w-6 h-6 flex items-center justify-center rounded-md border transition-colors ${
                layer.visible
                  ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                  : 'border-zinc-800 text-zinc-600 hover:bg-zinc-900'
              }`}
            >
              {layer.visible ? '👁' : '◌'}
            </button>
          </Tooltip>
          <Tooltip
            content={`Pintar en ${layer.name}`}
            placement='right'
            delay={200}
            closeDelay={0}
            size='sm'
          >
            <button
              type='button'
              aria-pressed={activeLayer === layer.id}
              aria-label={`Pintar en ${layer.name}`}
              onClick={() => setActiveLayer(layer.id)}
              className={`text-xs w-6 h-6 flex items-center justify-center rounded-md font-semibold transition-colors ${
                activeLayer === layer.id
                  ? 'bg-zinc-50 text-zinc-950 shadow-sm'
                  : 'bg-zinc-800/70 text-zinc-400 hover:bg-zinc-700/70'
              }`}
            >
              {layer.id + 1}
            </button>
          </Tooltip>
        </div>
      ))}
    </div>
  )
}
