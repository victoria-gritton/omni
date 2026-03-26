import { useState, useRef } from 'react'
import { Lightning, SlidersHorizontal, Microphone, PaperPlaneRight } from '@phosphor-icons/react'

/**
 * Shared chat input component used across:
 * - Homepage CommandCenter
 * - Canvas empty state
 * - Canvas chat panel
 * - Canvas closed-chat sticky bottom
 *
 * Props:
 * - isDark: theme
 * - onSubmit: (text) => void
 * - placeholder: string
 * - autoFocus: boolean
 * - value / onChange: controlled mode (optional)
 * - disabled: boolean (disables send)
 * - className: extra wrapper classes
 */
export default function ChatInput({
  isDark,
  onSubmit,
  placeholder = 'Ask anything...',
  autoFocus = false,
  value: controlledValue,
  onChange: controlledOnChange,
  className = '',
}) {
  const [internalValue, setInternalValue] = useState('')
  const [focused, setFocused] = useState(false)
  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : internalValue
  const setValue = isControlled ? controlledOnChange : setInternalValue

  const handleSubmit = (e) => {
    e.preventDefault()
    if (value.trim() && onSubmit) {
      onSubmit(value.trim())
      setValue('')
    }
  }

  // Match design-system Input border states
  const borderColor = focused
    ? (isDark ? 'border-foreground-disabled' : 'border-slate-400')
    : (isDark ? 'border-border-muted' : 'border-slate-300')

  const focusRing = focused
    ? 'shadow-ring-default'
    : ''

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div
        className={[
          'flex items-center h-10 px-3 py-1 border rounded-lg transition-all duration-200 w-full',
          isDark ? 'bg-input' : 'bg-black/[0.03]',
          borderColor,
          focusRing,
        ].join(' ')}
      >
        {/* Lightning icon */}
        <div className="shrink-0 mr-2">
          <Lightning size={16} className={isDark ? 'text-sky-400' : 'text-blue-500'} />
        </div>

        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={[
            'flex-1 min-w-0 bg-transparent outline-none text-body-m font-sans',
            isDark ? 'text-foreground placeholder-foreground-muted' : 'text-gray-900 placeholder-slate-500',
          ].join(' ')}
        />

        {/* Right-side buttons */}
        <div className="shrink-0 flex items-center gap-1 ml-1">
          {/* Quick actions */}
          <button
            type="button"
            className={`p-1.5 rounded-md transition-colors ${
              isDark
                ? 'hover:bg-white/10 text-foreground-muted hover:text-foreground'
                : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
            }`}
            aria-label="Quick actions"
          >
            <SlidersHorizontal size={16} />
          </button>

          {/* Voice input */}
          <button
            type="button"
            className={`p-1.5 rounded-md transition-colors ${
              isDark
                ? 'hover:bg-white/10 text-foreground-muted hover:text-foreground'
                : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
            }`}
            aria-label="Voice input"
          >
            <Microphone size={16} />
          </button>

          {/* Send */}
          <button
            type="submit"
            disabled={!value.trim()}
            className={`
              p-1.5 rounded-md text-white transition-all duration-300
              ${value.trim()
                ? 'cursor-pointer hover:-translate-y-[1px]'
                : isDark
                  ? 'bg-white/5 text-foreground-disabled cursor-not-allowed'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }
            `}
            style={value.trim() ? {
              background: 'var(--primary)',
              color: 'var(--primary-foreground)',
            } : undefined}
            aria-label="Send message"
          >
            <PaperPlaneRight size={16} />
          </button>
        </div>
      </div>
    </form>
  )
}
