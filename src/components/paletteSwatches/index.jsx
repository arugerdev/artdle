/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'
import { Tooltip } from '@nextui-org/react'
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
          <Tooltip key={c} content={c.toUpperCase()} delay={300} closeDelay={0} placement='right' size='sm'>
            <button
              type='button'
              role='option'
              aria-selected={color.toLowerCase() === c.toLowerCase()}
              aria-label={`Color ${c}`}
              disabled={isDisabled}
              onClick={() => setColor(c)}
              className={`w-5 h-5 rounded-full border transition-transform hover:scale-110 active:scale-95 ${color.toLowerCase() === c.toLowerCase() ? 'border-2 border-blue-500 ring-2 ring-blue-200' : 'border-slate-300'}`}
              style={{ background: c }}
            />
          </Tooltip>
        ))}
      </div>
      {custom.length > 0 && (
        <div
          className='flex flex-row lg:flex-col gap-1 mt-0 lg:mt-1 pt-0 lg:pt-1 lg:border-t lg:border-slate-200'
          role='listbox'
          aria-label='Paleta personalizada'
        >
          {custom.map(c => (
            <Tooltip key={c} content={`Color personalizado · ${c.toUpperCase()}`} delay={300} closeDelay={0} placement='right' size='sm'>
              <button
                type='button'
                role='option'
                aria-selected={color.toLowerCase() === c.toLowerCase()}
                aria-label={`Color personalizado ${c}`}
                disabled={isDisabled}
                onClick={() => setColor(c)}
                className={`w-5 h-5 rounded-md border transition-transform hover:scale-110 active:scale-95 ${color.toLowerCase() === c.toLowerCase() ? 'border-2 border-slate-900 scale-110' : 'border-slate-300'}`}
                style={{ background: c }}
              />
            </Tooltip>
          ))}
        </div>
      )}
      <Tooltip
        content={
          <div className='flex flex-col gap-0'>
            <span className='font-semibold text-xs'>Guardar color</span>
            <span className='text-[10px] text-gray-500'>Añade el color actual a tu paleta</span>
          </div>
        }
        delay={200}
        closeDelay={0}
        placement='right'
      >
        <button
          type='button'
          disabled={isDisabled}
          onClick={saveCurrent}
          aria-label='Guardar color actual en paleta'
          className='w-5 h-5 rounded-sm border border-dashed border-slate-400 text-slate-500 text-xs leading-[1.1rem] hover:bg-slate-100 hover:border-slate-500 disabled:opacity-50 transition-colors'
        >
          ＋
        </button>
      </Tooltip>
    </div>
  )
}
