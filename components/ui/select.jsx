import { useState, useRef, useEffect, forwardRef, useCallback } from 'react'
import { CaretDown } from '@phosphor-icons/react'

/**
 * Select component — SSO Rhythm
 *
 * States: default, focus, filled, filled+focus, disabled
 * Props:
 *   - options: [{ value, label, icon? }]
 *   - value / onChange: controlled
 *   - placeholder: string
 *   - icon: ReactNode (optional leading icon)
 *   - disabled: boolean
 *   - isDark: boolean
 *   - className: string
 *
 * Design tokens (dark):
 *   bg:         rgba(255,255,255,0.05)
 *   bg-focus:   rgba(255,255,255,0.08)
 *   border:     #334155
 *   border-focus:#64748b
 *   focus ring: 0 0 0 3px rgba(115,115,115,0.5)
 *   height:     32px (h-8)
 *   radius:     rounded-full
 *   shadow:     0 1px 2px rgba(0,0,0,0.05)
 *   text:       12px, tracking -0.12px
 *   placeholder:#94a3b8
 *   foreground: #f8fafc
 *   disabled:   opacity-50
 */

const Select = forwardRef(function Select(
  {
    options = [],
    value: controlledValue,
    onChange: controlledOnChange,
    placeholder = 'Placeholder',
    icon = null,
    disabled = false,
    isDark = true,
    className = '',
    ...props
  },
  ref
) {
  const [internalValue, setInternalValue] = useState('')
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const wrapperRef = useRef(null)
  const triggerRef = useRef(null)
  const optionRefs = useRef([])

  // Merge forwarded ref with internal trigger ref
  const setTriggerRef = useCallback((node) => {
    triggerRef.current = node
    if (typeof ref === 'function') ref(node)
    else if (ref) ref.current = node
  }, [ref])

  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : internalValue

  const selectedOption = options.find((o) => o.value === value)
  const filled = !!selectedOption

  const handleSelect = (optValue) => {
    if (isControlled) {
      controlledOnChange?.(optValue)
    } else {
      setInternalValue(optValue)
    }
    closeAndFocusTrigger()
  }

  const closeAndFocusTrigger = () => {
    setOpen(false)
    setFocusedIndex(-1)
    triggerRef.current?.focus()
  }

  const openDropdown = () => {
    if (disabled) return
    setOpen(true)
    // Start at selected option or first
    const idx = options.findIndex((o) => o.value === value)
    setFocusedIndex(idx >= 0 ? idx : 0)
  }

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
        setFocused(false)
        setFocusedIndex(-1)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Scroll focused option into view
  useEffect(() => {
    if (open && focusedIndex >= 0) {
      optionRefs.current[focusedIndex]?.scrollIntoView({ block: 'nearest' })
    }
  }, [open, focusedIndex])

  const handleTriggerKeyDown = (e) => {
    if (disabled) return
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowUp':
      case ' ':
      case 'Enter':
        if (!open) {
          e.preventDefault()
          openDropdown()
        } else {
          handleListKeyDown(e)
        }
        break
      case 'Escape':
        if (open) {
          e.preventDefault()
          closeAndFocusTrigger()
        }
        break
      case 'Tab':
        if (open) {
          setOpen(false)
          setFocusedIndex(-1)
        }
        break
      default:
        if (open) handleListKeyDown(e)
    }
  }

  const handleListKeyDown = (e) => {
    const last = options.length - 1
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setFocusedIndex((i) => (i >= last ? 0 : i + 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex((i) => (i <= 0 ? last : i - 1))
        break
      case 'Home':
        e.preventDefault()
        setFocusedIndex(0)
        break
      case 'End':
        e.preventDefault()
        setFocusedIndex(last)
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (focusedIndex >= 0 && options[focusedIndex]) {
          handleSelect(options[focusedIndex].value)
        }
        break
      case 'Escape':
        e.preventDefault()
        closeAndFocusTrigger()
        break
      case 'Tab':
        setOpen(false)
        setFocusedIndex(-1)
        break
    }
  }

  const isFocused = focused || open

  // Border
  const borderColor = isFocused
    ? (isDark ? 'border-foreground-disabled' : 'border-slate-400')
    : (isDark ? 'border-input-border' : 'border-slate-300')

  // Focus ring
  const focusRing = isFocused
    ? 'shadow-ring-default'
    : 'shadow-2xs'

  // Background
  const bg = isFocused
    ? (isDark ? 'bg-input-2' : 'bg-black/[0.04]')
    : (isDark ? 'bg-input' : 'bg-black/[0.03]')

  const trigger = [
    'flex items-center gap-2 h-8 px-3 py-2 border rounded-lg w-full transition-all duration-200 cursor-pointer',
    bg,
    borderColor,
    focusRing,
    disabled ? 'opacity-50 cursor-not-allowed' : '',
    className,
  ].filter(Boolean).join(' ')

  const textColor = filled
    ? (isDark ? 'text-foreground' : 'text-gray-900')
    : (isDark ? 'text-foreground-muted' : 'text-slate-500')

  return (
    <div ref={wrapperRef} className={`relative w-full ${className || ''}`}>
      <button
        ref={setTriggerRef}
        type="button"
        disabled={disabled}
        className={trigger}
        onClick={() => { if (!disabled) { setOpen(!open); setFocused(true); if (!open) openDropdown() } }}
        onFocus={() => setFocused(true)}
        onBlur={() => { if (!open) setFocused(false) }}
        onKeyDown={handleTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-activedescendant={open && focusedIndex >= 0 ? `select-option-${focusedIndex}` : undefined}
        {...props}
      >
        {/* Leading icon */}
        {icon && (
          <span className={`shrink-0 w-4 h-4 flex items-center justify-center ${isDark ? 'text-foreground-muted' : 'text-slate-500'}`}>
            {icon}
          </span>
        )}

        {/* Label */}
        <span className={`flex-1 min-w-0 truncate text-xs font-medium text-left ${textColor}`}>
          {selectedOption?.label || placeholder}
        </span>

        {/* Chevron */}
        <CaretDown size={16} className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''} ${isDark ? 'text-foreground-muted' : 'text-slate-500'}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className={`absolute z-50 top-full mt-1 left-0 w-full p-1 rounded-lg border shadow-md ${
            isDark ? 'bg-background-surface-2 border-border-muted' : 'bg-white border-slate-200'
          }`}
          role="listbox"
        >
          <div className="p-1 max-h-48 overflow-y-auto">
            {options.map((opt, index) => {
              const isFocusedOpt = index === focusedIndex
              return (
                <button
                  key={opt.value}
                  ref={(el) => { optionRefs.current[index] = el }}
                  id={`select-option-${index}`}
                  type="button"
                  role="option"
                  aria-selected={opt.value === value}
                  onClick={() => handleSelect(opt.value)}
                  onMouseEnter={() => setFocusedIndex(index)}
                  className={`w-full flex items-center gap-2 pl-2 pr-8 py-1.5 rounded-sm text-xs font-medium transition-colors text-left ${
                    opt.value === value
                      ? (isDark ? 'bg-white/10 text-foreground' : 'bg-black/5 text-gray-900')
                      : isFocusedOpt
                        ? (isDark ? 'bg-white/5 text-foreground' : 'bg-black/[0.03] text-gray-900')
                        : (isDark ? 'text-foreground hover:bg-white/5' : 'text-gray-700 hover:bg-black/[0.03] hover:text-gray-900')
                  }`}
                >
                  {opt.icon && (
                    <span className="shrink-0 w-4 h-4 flex items-center justify-center">
                      {opt.icon}
                    </span>
                  )}
                  <span className="flex-1 min-w-0 truncate">{opt.label}</span>
                </button>
              )
            })}
            {options.length === 0 && (
              <div className={`px-3 py-2 text-xs font-medium ${isDark ? 'text-foreground-disabled' : 'text-gray-400'}`}>
                No options
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
})

export default Select
