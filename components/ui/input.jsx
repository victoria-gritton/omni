import { useState, useRef, useId, forwardRef } from 'react'
import { Eye, EyeSlash } from '@phosphor-icons/react'

/**
 * Input component — SSO Rhythm
 *
 * Variants: "default" | "password" | "file"
 * Sizes: "default" (32px) | "lg" (40px, command center only)
 * States are derived from props: disabled, error, focus, filled
 */

const Input = forwardRef(function Input(
  {
    variant = 'default',
    size = 'default',
    isDark = true,
    disabled = false,
    error = false,
    placeholder = 'Placeholder',
    value: controlledValue,
    onChange: controlledOnChange,
    leadingIcon,
    trailingSlot,
    label,
    id,
    className = '',
    ...props
  },
  ref
) {
  const [internalValue, setInternalValue] = useState('')
  const [focused, setFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const fileRef = useRef(null)
  const autoId = useId()
  const computedId = label ? (id || autoId) : id

  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : internalValue
  const filled = value.length > 0

  const handleChange = (e) => {
    if (isControlled) {
      controlledOnChange?.(e)
    } else {
      setInternalValue(e.target.value)
    }
  }

  const radius = 'rounded-lg'

  // Border color + width
  const borderColor = error
    ? (isDark ? 'border-destructive' : 'border-red-500')
    : focused
      ? (isDark ? 'border-sky-400/60' : 'border-slate-500')
      : (isDark ? 'border-input-border' : 'border-slate-300')

  const focusPadding = ''

  const isLg = size === 'lg'

  const base = [
    'flex items-center border transition-all duration-200 w-full',
    isLg ? 'h-10 px-3 py-1.5' : 'h-8 px-3 py-1',
    isLg
      ? (isDark ? 'bg-background-surface-1' : 'bg-white')
      : (isDark ? 'bg-input' : 'bg-black/[0.03]'),
    borderColor,
    focusPadding,
    radius,
    disabled ? 'opacity-50 cursor-not-allowed' : '',
    className,
  ].filter(Boolean).join(' ')

  const textClasses = [
    isLg ? 'text-body-m' : 'text-xs',
    'font-medium font-sans',
    isDark ? 'text-foreground' : 'text-gray-900',
  ].join(' ')

  const placeholderClasses = 'placeholder-muted'

  // ── File variant ──
  if (variant === 'file') {
    const fileName = value || ''
    return (
      <>
        {label && <label htmlFor={computedId} className={`text-body-s font-medium mb-1 block ${isDark ? 'text-foreground-secondary' : 'text-gray-700'}`}>{label}</label>}
        <div className={base}>
          <button
            type="button"
            aria-label="Choose file"
            disabled={disabled}
            onClick={() => fileRef.current?.click()}
            className={`shrink-0 px-1.5 py-px text-xs font-medium ${
              isDark ? 'text-foreground' : 'text-gray-900'
            } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          >
            Choose file
          </button>
          <span
            className={`flex-1 min-w-0 truncate text-xs font-medium ${
              fileName
                ? (isDark ? 'text-foreground' : 'text-gray-900')
                : (isDark ? 'text-foreground-muted' : 'text-slate-500')
            }`}
          >
            {fileName || 'No file chosen'}
          </span>
          <input
            ref={(el) => {
              fileRef.current = el
              if (typeof ref === 'function') ref(el)
              else if (ref) ref.current = el
            }}
            id={computedId}
            type="file"
            disabled={disabled}
            className="hidden"
            onChange={(e) => {
              const name = e.target.files?.[0]?.name || ''
              if (isControlled) {
                controlledOnChange?.({ ...e, target: { ...e.target, value: name } })
              } else {
                setInternalValue(name)
              }
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            {...props}
          />
        </div>
      </>
    )
  }

  // ── Default & Password variants ──
  return (
    <>
      {label && <label htmlFor={computedId} className={`text-body-s font-medium mb-1 block ${isDark ? 'text-foreground-secondary' : 'text-gray-700'}`}>{label}</label>}
      <div className={base}>
        {leadingIcon && (
          <span className={`shrink-0 mr-1 flex items-center ${isDark ? 'text-foreground-muted' : 'text-gray-400'}`}>
            {leadingIcon}
          </span>
        )}
        <input
          ref={ref}
          id={computedId}
          type={variant === 'password' && !showPassword ? 'password' : 'text'}
          value={value}
          onChange={handleChange}
          onFocus={(e) => { setFocused(true); props.onFocus?.(e) }}
          onBlur={(e) => { setFocused(false); props.onBlur?.(e) }}
          disabled={disabled}
          placeholder={placeholder}
          className={`flex-1 min-w-0 bg-transparent outline-none ${textClasses} ${placeholderClasses} ${
            disabled ? 'cursor-not-allowed' : ''
          }`}
          {...props}
        />
        {variant === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={`shrink-0 ml-1 p-1 min-w-6 min-h-6 flex items-center justify-center ${
              isDark ? 'text-foreground-muted hover:text-foreground-secondary' : 'text-slate-500 hover:text-slate-700'
            } transition-colors`}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeSlash size={14} />
            ) : (
              <Eye size={14} />
            )}
          </button>
        )}
        {trailingSlot && (
          <span className="shrink-0 ml-1 flex items-center gap-0.5">
            {trailingSlot}
          </span>
        )}
      </div>
    </>
  )
})

export default Input
