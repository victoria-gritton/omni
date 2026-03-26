import { useState, useRef, useEffect, createContext, useContext, useCallback, useId } from 'react'

/**
 * Popover component — SSO Rhythm
 *
 * Composable: Popover (root), PopoverTrigger, PopoverContent
 *
 * Props (Popover):
 *  - isDark: boolean (default true)
 *  - open / onOpenChange: controlled mode (optional)
 *
 * Props (PopoverContent):
 *  - align: 'start' | 'end' (default 'end')
 *  - className: additional classes
 *  - sideOffset: top margin in px (default 8)
 */

const PopoverContext = createContext({
  isDark: true, open: false, setOpen: () => {},
  triggerRef: null, contentId: '', triggerId: '',
})

export function Popover({ isDark = true, open: controlledOpen, onOpenChange, children }) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const ref = useRef(null)
  const triggerRef = useRef(null)
  const contentId = useId()
  const triggerId = useId()

  const setOpen = useCallback((v) => {
    if (isControlled) onOpenChange?.(v)
    else setInternalOpen(v)
  }, [isControlled, onOpenChange])

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [setOpen])

  return (
    <PopoverContext.Provider value={{ isDark, open, setOpen, triggerRef, contentId, triggerId }}>
      <div ref={ref} className="relative">
        {children}
      </div>
    </PopoverContext.Provider>
  )
}

function getFocusableChild(el) {
  if (!el) return null
  return el.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
}

export function PopoverTrigger({ children, asChild = false }) {
  const { open, setOpen, triggerRef, contentId, triggerId } = useContext(PopoverContext)

  const toggle = useCallback(() => setOpen(!open), [open, setOpen])

  const ariaProps = {
    'aria-haspopup': 'dialog',
    'aria-expanded': open,
    'aria-controls': open ? contentId : undefined,
    id: triggerId,
  }

  if (asChild) {
    // Wrapper captures click events bubbling from inner focusable elements.
    // Inner buttons fire click on Enter/Space natively, so keyboard works via bubbling.
    return (
      <div ref={triggerRef} onClick={toggle} className="inline-flex" {...ariaProps}>
        {children}
      </div>
    )
  }

  return (
    <button
      ref={triggerRef}
      onClick={toggle}
      className="cursor-pointer"
      {...ariaProps}
    >
      {children}
    </button>
  )
}

export function PopoverContent({ children, align = 'end', className = '', sideOffset = 8, animate = false }) {
  const { isDark, open, setOpen, triggerRef, contentId, triggerId } = useContext(PopoverContext)
  const [visible, setVisible] = useState(false)
  const [animating, setAnimating] = useState(false)
  const contentRef = useRef(null)

  useEffect(() => {
    if (open) {
      setVisible(true)
      if (animate) requestAnimationFrame(() => setAnimating(true))
      // Move focus into content
      requestAnimationFrame(() => {
        if (!contentRef.current) return
        const target = getFocusableChild(contentRef.current) || contentRef.current
        target.focus()
      })
    } else {
      setAnimating(false)
      if (animate) {
        const timer = setTimeout(() => setVisible(false), 250)
        return () => clearTimeout(timer)
      } else {
        setVisible(false)
      }
      // Return focus to trigger (find inner focusable or use wrapper)
      const el = triggerRef?.current
      const focusTarget = getFocusableChild(el) || el
      focusTarget?.focus()
    }
  }, [open, animate, triggerRef])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      setOpen(false)
      return
    }
    // Focus trap
    if (e.key === 'Tab' && contentRef.current) {
      const focusables = contentRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (!focusables.length) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }, [setOpen])

  if (!animate && !open) return null
  if (animate && !visible) return null

  const bg = isDark ? 'bg-background-surface-2 border-border-muted' : 'bg-white border-gray-200'
  const alignment = align === 'end' ? 'right-0' : 'left-0'

  const animateStyles = animate
    ? {
        marginTop: `${sideOffset}px`,
        transition: 'opacity 250ms cubic-bezier(0.16, 1, 0.3, 1), transform 250ms cubic-bezier(0.16, 1, 0.3, 1)',
        opacity: animating ? 1 : 0,
        transform: animating ? 'translateY(0)' : 'translateY(-4px)',
      }
    : { marginTop: `${sideOffset}px` }

  return (
    <div
      ref={contentRef}
      id={contentId}
      className={`absolute z-50 top-full ${alignment} rounded-xl border shadow-md ${bg} ${className}`}
      style={animateStyles}
      role="dialog"
      aria-labelledby={triggerId}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  )
}
