import { forwardRef, useRef } from 'react'
import { Check, Minus } from '@phosphor-icons/react'

/**
 * Checkbox component — SSO Rhythm
 */

const Checkbox = forwardRef(function Checkbox(
  {
    checked = false,
    indeterminate = false,
    onChange,
    disabled = false,
    label,
    description,
    isDark = true,
    className = '',
    ...props
  },
  ref
) {
  const internalRef = useRef(null)
  const inputRef = ref || internalRef

  const isActive = checked || indeterminate

  const boxBg = isActive
    ? (isDark ? 'bg-primary' : 'bg-slate-950')
    : (isDark ? 'bg-input' : 'bg-black/[0.03]')

  const boxBorder = isActive
    ? 'border-transparent'
    : (isDark ? 'border-input-border' : 'border-slate-300')

  const boxClasses = [
    'relative shrink-0 w-4 h-4 rounded-[4px] border transition-all duration-150',
    'flex items-center justify-center',
    boxBg,
    boxBorder,
    disabled ? 'opacity-50' : 'active:opacity-60',
    'peer-focus-visible:shadow-[0_0_0_3px_rgba(115,115,115,0.5)]',
  ].filter(Boolean).join(' ')

  const labelColor = isDark ? 'text-foreground' : 'text-gray-900'
  const descColor = isDark ? 'text-foreground-muted' : 'text-slate-500'

  return (
    <label
      className={`inline-flex items-start gap-2 select-none ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
      <input
        ref={inputRef}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e)}
        className="peer sr-only"
        {...props}
      />
      <span className={boxClasses}>
        {checked && !indeterminate && (
          <Check size={12} className={isDark ? 'text-slate-950' : 'text-white'} weight="bold" />
        )}
        {indeterminate && (
          <Minus size={12} className={isDark ? 'text-slate-950' : 'text-white'} weight="bold" />
        )}
      </span>
      {(label || description) && (
        <span className="flex flex-col min-w-0">
          {label && (
            <span className={`text-body-m font-medium leading-4 ${labelColor} ${disabled ? 'opacity-70' : ''}`}>
              {label}
            </span>
          )}
          {description && (
            <span className={`text-body-s leading-4 ${descColor} ${disabled ? 'opacity-70' : ''}`}>
              {description}
            </span>
          )}
        </span>
      )}
    </label>
  )
})

export default Checkbox
