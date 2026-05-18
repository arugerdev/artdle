/* eslint-disable react/prop-types */
import { useState } from 'react'
import { Popover, PopoverTrigger, PopoverContent, Input } from '@nextui-org/react'
import { HexColorPicker } from 'react-colorful'
import { COLORBLIND_PALETTE } from '../../utils/tools'

/**
 * Glass popover color picker. Click the swatch → opens a panel with a
 * hue+saturation square, hex input and the accessible preset palette.
 * Replaces the native <input type="color"> dialog with something on-brand.
 */
export const ColorPickerPopover = ({ color, setColor, isDisabled = false }) => {
  const [open, setOpen] = useState(false)
  const [hex, setHex] = useState(color)

  // Keep the local hex string in sync with the parent — covers eyedropper
  // / palette picks that change color elsewhere.
  if (color.toLowerCase() !== hex.toLowerCase() && !open) {
    // outside-open updates are safe; inside-open we let the user finish typing
    setHex(color)
  }

  const commit = next => {
    setHex(next)
    if (/^#[0-9a-fA-F]{6}$/.test(next)) setColor(next)
  }

  return (
    <Popover
      placement='right'
      isOpen={open && !isDisabled}
      onOpenChange={setOpen}
      backdrop='transparent'
      classNames={{
        content: 'ios-card p-0 shadow-2xl'
      }}
    >
      <PopoverTrigger>
        <button
          type='button'
          disabled={isDisabled}
          aria-label={`Abrir selector de color · ${color.toUpperCase()}`}
          title={`Color · ${color.toUpperCase()}`}
          className='w-9 h-9 rounded-full border-2 border-white dark:border-zinc-700 shadow-inner ring-1 ring-slate-200 dark:ring-zinc-700 hover:ring-slate-400 dark:hover:ring-zinc-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
          style={{ background: color }}
        />
      </PopoverTrigger>
      <PopoverContent>
        <div className='flex flex-col gap-3 p-3 w-[220px]'>
          <HexColorPicker
            color={color}
            onChange={c => { setHex(c); setColor(c) }}
            style={{ width: '100%', height: 160 }}
          />
          <Input
            size='sm'
            variant='bordered'
            label='Hex'
            labelPlacement='outside-left'
            value={hex}
            onValueChange={commit}
            startContent={
              <span
                className='w-5 h-5 rounded-md border border-slate-200 dark:border-zinc-700'
                style={{ background: /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : color }}
              />
            }
            classNames={{
              label: 'text-slate-500 dark:text-zinc-400 text-xs',
              input: 'font-mono text-sm uppercase text-slate-900 dark:text-zinc-100',
              inputWrapper: 'min-h-[2rem] h-8 bg-white/60 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700 data-[hover=true]:border-slate-300 dark:data-[hover=true]:border-zinc-600 group-data-[focus=true]:border-slate-400 dark:group-data-[focus=true]:border-zinc-400'
            }}
          />
          <div>
            <p className='text-[10px] font-semibold uppercase tracking-widest text-slate-500 dark:text-zinc-500 mb-1'>
              Accesibles
            </p>
            <div className='grid grid-cols-8 gap-1'>
              {COLORBLIND_PALETTE.map(c => (
                <button
                  key={c}
                  type='button'
                  aria-label={`Color ${c}`}
                  onClick={() => { setHex(c); setColor(c) }}
                  className={`w-5 h-5 rounded-md border transition-transform hover:scale-110 ${
                    color.toLowerCase() === c.toLowerCase()
                      ? 'border-2 border-slate-900 dark:border-zinc-50 scale-110'
                      : 'border-slate-200 dark:border-zinc-700'
                  }`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
