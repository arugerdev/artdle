import { Tooltip } from '@nextui-org/react'
import { SunIcon, MoonIcon, MonitorIcon } from '../../assets/icons'
import { useTheme } from '../../utils/theme'

const ORDER = ['light', 'system', 'dark']
const ICONS = { light: SunIcon, system: MonitorIcon, dark: MoonIcon }
const LABELS = { light: 'Tema claro', system: 'Sistema', dark: 'Tema oscuro' }

/**
 * Segmented control — three pills (sun / monitor / moon) with a
 * sliding active background. Behaviour: light / system / dark.
 */
export const ThemeToggle = () => {
  const { preference, setPreference } = useTheme()
  const activeIdx = ORDER.indexOf(preference)
  return (
    <div
      role='radiogroup'
      aria-label='Selector de tema'
      className='relative inline-flex items-center rounded-full ios-chip h-8 p-0.5'
    >
      <span
        aria-hidden='true'
        className='absolute top-0.5 bottom-0.5 w-7 rounded-full bg-slate-900 dark:bg-zinc-50 shadow-md transition-all duration-300'
        style={{ left: `calc(${activeIdx} * 1.75rem + 0.125rem)` }}
      />
      {ORDER.map(opt => {
        const Icon = ICONS[opt]
        const active = preference === opt
        return (
          <Tooltip
            key={opt}
            content={LABELS[opt]}
            placement='bottom'
            delay={300}
            closeDelay={0}
            size='sm'
          >
            <button
              type='button'
              role='radio'
              aria-checked={active}
              aria-label={LABELS[opt]}
              onClick={() => setPreference(opt)}
              className={`relative z-10 inline-flex w-7 h-7 items-center justify-center rounded-full transition-colors ${
                active
                  ? 'text-white dark:text-slate-900'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
              }`}
            >
              <Icon size={16} />
            </button>
          </Tooltip>
        )
      })}
    </div>
  )
}
