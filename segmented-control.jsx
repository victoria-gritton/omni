import { useRef, useCallback } from 'react'
import { cn } from './lib/utils'
import Tooltip from './tooltip'

/**
 * SegmentedControl component — SSO Rhythm
 *
 * A toggle group for switching between mutually exclusive options.
 * Visual style derived from the hand-rolled scope/status toggles in the app.
 *
 * Sizes:
 *   "default" — h-8, matches Input and Button default height
 *   "sm"      — h-6, matches Button sm height
 *
 * Width:
 *   By default, wraps content. Set `fullWidth` to stretch to parent width
 *   with equal-width options.
 *
 * Content modes (per option):
 *   Icon only:        { id, label, Icon }
 *   Icon + label:     { id, label, Icon }  (shown when fullWidth or multiple content types)
 *   Label only:       { id, label }
 *   Dot + label:      { id, label, dot: '#color' }
 *
 * Props:
 *   options       — Array of { id, label, Icon?, dot? }
 *   value         — Selected option id (or null if allowDeselect)
 *   onChange      — Callback with selected id (or null on deselect)
 *   isDark        — Theme prop
 *   size          — "default" | "sm"
 *   fullWidth     — If true, stretches to parent width with equal-width options
 *   allowDeselect — If true, clicking active option deselects (value → null)
 *   ariaLabel     — Accessible label for the radiogroup container
 *   className     — Merged onto the outer container
 */
export default function SegmentedControl({
  options = [],
  value,
  onChange,
  isDark = true,
  size = 'default',
  fullWidth = false,
  allowDeselect = false,
  ariaLabel,
  className,
}) {
  const isSm = size === 'sm'
  const iconSize = isSm ? 12 : 14
  const groupRef = useRef(null)

  // Detect if all options are icon-only (have Icon, no dot, not fullWidth)
  const iconOnly = !fullWidth && options.every(o => o.Icon && !o.dot)

  const handleClick = (id) => {
    if (allowDeselect && value === id) onChange?.(null)
    else onChange?.(id)
  }

  const focusAndSelect = useCallback((index) => {
    const buttons = groupRef.current?.querySelectorAll('[role="radio"]')
    if (!buttons?.length) return
    const target = buttons[index]
    target?.focus()
    onChange?.(options[index]?.id)
  }, [onChange, options])

  const handleKeyDown = useCallback((e) => {
    const buttons = groupRef.current?.querySelectorAll('[role="radio"]')
    if (!buttons?.length) return
    const current = Array.from(buttons).indexOf(e.target)
    if (current === -1) return
    const len = buttons.length

    let next
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        next = (current + 1) % len
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        next = (current - 1 + len) % len
        break
      case 'Home':
        next = 0
        break
      case 'End':
        next = len - 1
        break
      default:
        return
    }
    e.preventDefault()
    focusAndSelect(next)
  }, [focusAndSelect])

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      className={cn(
        'inline-flex rounded-lg p-0.5',
        isSm ? 'h-6' : 'h-8',
        isDark
          ? 'bg-white/[0.04] border border-white/[0.06]'
          : 'bg-black/[0.03] border border-black/[0.06]',
        fullWidth && 'w-full',
        className
      )}
    >
      {options.map((opt) => {
        const active = opt.id === value
        const dimmed = allowDeselect && value !== null && !active

        // Button sizing
        const btnClass = iconOnly
          ? isSm ? 'h-full aspect-square' : 'h-full aspect-square'
          : isSm
            ? 'h-full px-2 gap-1.5'
            : 'h-full px-3 gap-1.5'

        const btn = (
          <button
            key={opt.id}
            role="radio"
            aria-checked={active}
            aria-label={opt.label}
            tabIndex={active ? 0 : -1}
            onClick={() => handleClick(opt.id)}
            className={cn(
              btnClass,
              'inline-flex items-center justify-center rounded-md transition-all duration-200',
              'focus-visible:outline-none focus-visible:shadow-ring-default',
              fullWidth && 'flex-1',
              active
                ? isDark
                  ? 'bg-white/10 text-foreground'
                  : 'bg-white text-gray-900 shadow-sm'
                : dimmed
                  ? isDark
                    ? 'text-foreground-disabled opacity-40'
                    : 'text-gray-400 opacity-40'
                  : isDark
                    ? 'text-foreground-secondary hover:text-foreground'
                    : 'text-gray-600 hover:text-gray-900'
            )}
          >
            {opt.dot && (
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: opt.dot }} />
            )}
            {opt.Icon && <opt.Icon size={iconSize} />}
            {!iconOnly && opt.label && (
              <span className={isSm ? 'text-[10px]' : 'text-body-s'}>
                {opt.label}
              </span>
            )}
          </button>
        )

        return iconOnly ? (
          <Tooltip key={opt.id} content={opt.label} isDark={isDark} placement="top">
            {btn}
          </Tooltip>
        ) : btn
      })}
    </div>
  )
}
