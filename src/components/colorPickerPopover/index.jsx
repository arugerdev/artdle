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
        content: 'p-0 border border-slate-200/70 bg-white/80 backdrop-blur-xl shadow-xl'
      }}
    >
      <PopoverTrigger>
        <button
          type='button'
          disabled={isDisabled}
          aria-label={`Abrir selector de color · ${color.toUpperCase()}`}
          title={`Color · ${color.toUpperCase()}`}
          className='w-9 h-9 rounded-full border-2 border-white shadow-inner ring-1 ring-slate-300 hover:ring-slate-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
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
                className='w-5 h-5 rounded-md border border-slate-200'
                style={{ background: /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : color }}
              />
            }
            classNames={{
              input: 'font-mono text-sm uppercase',
              inputWrapper: 'min-h-[2rem] h-8'
            }}
          />
          <div>
            <p className='text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1'>
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
                      ? 'border-2 border-slate-900 scale-110'
                      : 'border-slate-200'
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
