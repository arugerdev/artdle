/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'
import { COLORBLIND_PALETTE } from '../../utils/tools'

const STORAGE_KEY = 'artdle.palette'
const MAX_CUSTOM = 6

function loadCustom () {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

export const PaletteSwatches = ({ color, setColor, isDisabled }) => {
  const [custom, setCustom] = useState(() => loadCustom())

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(custom))
  }, [custom])

  const saveCurrent = () => {
    setCustom(prev => {
      const next = [color, ...prev.filter(c => c !== color)].slice(0, MAX_CUSTOM)
      return next
    })
  }

  return (
    <div className='flex flex-row lg:flex-col gap-1 items-center justify-center flex-wrap'>
      <div
        className='flex flex-row lg:flex-col gap-1'
        role='listbox'
        aria-label='Paleta accesible'
      >
        {COLORBLIND_PALETTE.map(c => (
          <button
            key={c}
            type='button'
            role='option'
            aria-selected={color.toLowerCase() === c.toLowerCase()}
            aria-label={`Color ${c}`}
            disabled={isDisabled}
            onClick={() => setColor(c)}
            className={`w-5 h-5 rounded-full border ${color.toLowerCase() === c.toLowerCase() ? 'border-2 border-blue-500' : 'border-slate-300'}`}
            style={{ background: c }}
          />
        ))}
      </div>
      {custom.length > 0 && (
        <div
          className='flex flex-row lg:flex-col gap-1 mt-0 lg:mt-1 pt-0 lg:pt-1 lg:border-t lg:border-slate-200'
          role='listbox'
          aria-label='Paleta personalizada'
        >
          {custom.map(c => (
            <button
              key={c}
              type='button'
              role='option'
              aria-selected={color.toLowerCase() === c.toLowerCase()}
              aria-label={`Color personalizado ${c}`}
              disabled={isDisabled}
              onClick={() => setColor(c)}
              className={`w-5 h-5 rounded-sm border ${color.toLowerCase() === c.toLowerCase() ? 'border-2 border-blue-500' : 'border-slate-300'}`}
              style={{ background: c }}
            />
          ))}
        </div>
      )}
      <button
        type='button'
        disabled={isDisabled}
        onClick={saveCurrent}
        aria-label='Guardar color actual en paleta'
        title='Guardar color actual'
        className='w-5 h-5 rounded-sm border border-dashed border-slate-400 text-slate-500 text-xs leading-[1.1rem] hover:bg-slate-100 disabled:opacity-50'
      >
        ＋
      </button>
    </div>
  )
}
