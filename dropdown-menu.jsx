import { useState, useRef, useEffect, createContext, useContext, useCallback, Children, cloneElement, useId, forwardRef } from 'react'
import { CaretRight } from '@phosphor-icons/react'

/**
 * DropdownMenu component — SSO Rhythm
 *
 * Composable primitives: DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
 * DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub,
 * DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuShortcut
 *
 * Design tokens (dark):
 *   popover bg:     #1e293b (slate-800)
 *   border:         #334155 (slate-700)
 *   radius:         8px (rounded-lg)
 *   shadow:         md
 *   padding:        4px
 *   item padding:   px-2 py-1.5
 *   item radius:    6px (rounded-md)
 *   item hover:     white/5
 *   text:           #f8fafc (slate-50), 12px, tracking -0.12px
 *   label:          12px medium
 *   shortcut:       10px, 60% opacity
 *   separator:      1px border-slate-700
 */

const MenuContext = createContext({ isDark: true, closeAll: () => {}, registerItem: () => () => {} })
const SubMenuContext = createContext({ closeSubMenu: () => {}, parentTriggerRef: null })
const SubItemContext = createContext(null)

export function DropdownMenu({ isDark = true, children }) {
  const [open, setOpen] = useState(false)
  const [visible, setVisible] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const ref = useRef(null)
  const triggerRef = useRef(null)
  const itemsRef = useRef([])
  const menuId = useId()

  const closeAll = useCallback(() => {
    setVisible(false)
    setTimeout(() => {
      setOpen(false)
      setFocusedIndex(-1)
    }, 180)
    triggerRef.current?.focus()
  }, [])

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => setVisible(true))
      setFocusedIndex(0)
    }
  }, [open])

  useEffect(() => {
    if (open && focusedIndex >= 0 && itemsRef.current[focusedIndex]) {
      itemsRef.current[focusedIndex].focus()
    }
  }, [focusedIndex, open])

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) closeAll()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [closeAll])

  const handleToggle = useCallback(() => {
    if (open) closeAll()
    else setOpen(true)
  }, [open, closeAll])

  const handleTriggerKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleToggle()
    } else if (e.key === 'ArrowDown' && !open) {
      e.preventDefault()
      setOpen(true)
    }
  }, [handleToggle, open])

  const itemCount = () => itemsRef.current.length

  const handleMenuKeyDown = useCallback((e) => {
    const count = itemCount()
    if (!count) return
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setFocusedIndex(i => (i + 1) % count)
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex(i => (i - 1 + count) % count)
        break
      case 'Home':
        e.preventDefault()
        setFocusedIndex(0)
        break
      case 'End':
        e.preventDefault()
        setFocusedIndex(count - 1)
        break
      case 'Escape':
        e.preventDefault()
        closeAll()
        break
      case 'Tab':
        closeAll()
        break
    }
  }, [closeAll])

  const registerItem = useCallback((el) => {
    if (el && !itemsRef.current.includes(el)) {
      itemsRef.current.push(el)
    }
    return () => {
      itemsRef.current = itemsRef.current.filter(item => item !== el)
    }
  }, [])

  let trigger = null
  let content = null
  const childArray = Array.isArray(children) ? children : [children]
  childArray.forEach(child => {
    if (!child) return
    if (child.type === DropdownMenuTrigger) trigger = child
    else if (child.type === DropdownMenuContent) content = child
  })

  // Reset items ref when menu opens/closes
  useEffect(() => {
    if (!open) itemsRef.current = []
  }, [open])

  return (
    <MenuContext.Provider value={{ isDark, closeAll, visible, registerItem, handleMenuKeyDown, menuId }}>
      <div ref={ref} className="relative inline-block">
        {trigger && (
          <TriggerWrapper
            ref={triggerRef}
            onClick={handleToggle}
            onKeyDown={handleTriggerKeyDown}
            aria-haspopup="menu"
            aria-expanded={open}
            aria-controls={open ? menuId : undefined}
          >
            {trigger.props.children}
          </TriggerWrapper>
        )}
        {open && content}
      </div>
    </MenuContext.Provider>
  )
}

const TriggerWrapper = forwardRef(function TriggerWrapper({ children, onClick, onKeyDown, ...ariaProps }, ref) {
  const child = Children.only(children)
  const isButton = child.type === 'button' || child.type?.displayName === 'Button' || child.props?.type === 'button'
  return cloneElement(child, {
    ref,
    onClick: (e) => { child.props.onClick?.(e); onClick(e) },
    onKeyDown: (e) => { child.props.onKeyDown?.(e); onKeyDown(e) },
    tabIndex: isButton ? child.props.tabIndex : (child.props.tabIndex ?? 0),
    role: isButton ? child.props.role : 'button',
    ...ariaProps,
  })
})

export function DropdownMenuTrigger({ children }) {
  return children
}

export function DropdownMenuContent({ children, align = 'start', className = '' }) {
  const { isDark, visible, handleMenuKeyDown, menuId } = useContext(MenuContext)
  const bg = isDark ? 'bg-background-surface-2 border-border-muted' : 'bg-white border-slate-200'
  const shadow = 'shadow-dropdown-light'
  const alignment = align === 'end' ? 'right-0' : 'left-0'

  return (
    <div
      id={menuId}
      className={`absolute z-50 top-full mt-1 ${alignment} min-w-[220px] w-max p-1 rounded-lg border ${bg} ${shadow} ${className}`}
      role="menu"
      onKeyDown={handleMenuKeyDown}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(-4px) scale(0.97)',
        transformOrigin: 'top left',
        transition: 'opacity 180ms ease-out, transform 180ms ease-out',
      }}
    >
      {children}
    </div>
  )
}

export function DropdownMenuLabel({ children, className = '' }) {
  const { isDark } = useContext(MenuContext)
  const color = isDark ? 'text-foreground' : 'text-gray-900'
  return (
    <div className={`px-2 py-1.5 text-body-m font-medium ${color} ${className}`} role="none">
      {children}
    </div>
  )
}

export function DropdownMenuSeparator({ className = '' }) {
  const { isDark } = useContext(MenuContext)
  const border = isDark ? 'border-border-muted' : 'border-slate-200'
  return <div className={`-mx-1 my-1 h-px border-t ${border} ${className}`} role="separator" />
}

export function DropdownMenuItem({ children, shortcut, disabled = false, onSelect, className = '' }) {
  const { isDark, closeAll, registerItem } = useContext(MenuContext)
  const subRegister = useContext(SubItemContext)
  const register = subRegister || registerItem
  const itemRef = useRef(null)
  const itemId = useId()
  const color = isDark ? 'text-foreground' : 'text-gray-900'
  const hover = isDark ? 'hover:bg-white/5 focus:bg-white/5' : 'hover:bg-black/[0.04] focus:bg-black/[0.04]'

  useEffect(() => {
    if (itemRef.current && !disabled) {
      return register(itemRef.current)
    }
  }, [register, disabled])

  return (
    <button
      ref={itemRef}
      id={itemId}
      type="button"
      role="menuitem"
      tabIndex={-1}
      disabled={disabled}
      onClick={() => { onSelect?.(); closeAll() }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') { e.preventDefault(); onSelect?.(); closeAll() }
      }}
      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-body-m text-left transition-colors outline-none whitespace-nowrap ${color} ${hover} ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}
    >
      <span className="flex-1 min-w-0 truncate">{children}</span>
      {shortcut && <DropdownMenuShortcut>{shortcut}</DropdownMenuShortcut>}
    </button>
  )
}

export function DropdownMenuShortcut({ children, className = '' }) {
  return (
    <span className={`shrink-0 text-[10px] leading-4 opacity-60 ${className}`}>
      {children}
    </span>
  )
}

export function DropdownMenuSub({ children }) {
  const [open, setOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const ref = useRef(null)
  const subTriggerRef = useRef(null)
  const subItemsRef = useRef([])

  useEffect(() => {
    if (open && focusedIndex >= 0 && subItemsRef.current[focusedIndex]) {
      subItemsRef.current[focusedIndex].focus()
    }
  }, [focusedIndex, open])

  useEffect(() => {
    if (!open) { subItemsRef.current = []; setFocusedIndex(-1) }
  }, [open])

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const openSub = useCallback(() => {
    setOpen(true)
    requestAnimationFrame(() => setFocusedIndex(0))
  }, [])

  const closeSub = useCallback(() => {
    setOpen(false)
    subTriggerRef.current?.focus()
  }, [])

  const registerSubItem = useCallback((el) => {
    if (el && !subItemsRef.current.includes(el)) subItemsRef.current.push(el)
    return () => { subItemsRef.current = subItemsRef.current.filter(item => item !== el) }
  }, [])

  const handleSubMenuKeyDown = useCallback((e) => {
    const count = subItemsRef.current.length
    if (!count) return
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        e.stopPropagation()
        setFocusedIndex(i => (i + 1) % count)
        break
      case 'ArrowUp':
        e.preventDefault()
        e.stopPropagation()
        setFocusedIndex(i => (i - 1 + count) % count)
        break
      case 'Home':
        e.preventDefault()
        e.stopPropagation()
        setFocusedIndex(0)
        break
      case 'End':
        e.preventDefault()
        e.stopPropagation()
        setFocusedIndex(count - 1)
        break
      case 'ArrowLeft':
        e.preventDefault()
        e.stopPropagation()
        closeSub()
        break
      case 'Escape':
        e.preventDefault()
        e.stopPropagation()
        closeSub()
        break
    }
  }, [closeSub])

  return (
    <SubMenuContext.Provider value={{ openSub, closeSub, subTriggerRef, registerSubItem, handleSubMenuKeyDown }}>
      <div
        ref={ref}
        className="relative"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {Array.isArray(children)
          ? children.map((child, i) => {
              if (child?.type === DropdownMenuSubContent) {
                return open ? <div key={i}>{child}</div> : null
              }
              return <div key={i}>{child}</div>
            })
          : children}
      </div>
    </SubMenuContext.Provider>
  )
}

export function DropdownMenuSubTrigger({ children, className = '' }) {
  const { isDark, registerItem } = useContext(MenuContext)
  const { openSub, subTriggerRef } = useContext(SubMenuContext)
  const itemId = useId()
  const color = isDark ? 'text-foreground' : 'text-gray-900'
  const hover = isDark ? 'hover:bg-white/5 focus:bg-white/5' : 'hover:bg-black/[0.04] focus:bg-black/[0.04]'
  const chevronColor = isDark ? 'text-foreground-muted' : 'text-slate-500'

  useEffect(() => {
    if (subTriggerRef.current) return registerItem(subTriggerRef.current)
  }, [registerItem, subTriggerRef])

  return (
    <div
      ref={subTriggerRef}
      id={itemId}
      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-body-m cursor-pointer transition-colors outline-none ${color} ${hover} ${className}`}
      role="menuitem"
      aria-haspopup="menu"
      tabIndex={-1}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight' || e.key === 'Enter') {
          e.preventDefault()
          e.stopPropagation()
          openSub()
        }
      }}
    >
      <span className="flex-1 min-w-0 truncate">{children}</span>
      <CaretRight size={16} className={`shrink-0 ${chevronColor}`} />
    </div>
  )
}

export function DropdownMenuSubContent({ children, className = '' }) {
  const { isDark } = useContext(MenuContext)
  const { handleSubMenuKeyDown, registerSubItem } = useContext(SubMenuContext)
  const bg = isDark ? 'bg-background-surface-2 border-border-muted' : 'bg-white border-slate-200'
  const shadow = 'shadow-dropdown-light'

  return (
    <SubItemRegistrar registerSubItem={registerSubItem}>
      <div
        className={`absolute left-full top-0 ml-1 min-w-[180px] p-1 rounded-lg border ${bg} ${shadow} ${className}`}
        role="menu"
        onKeyDown={handleSubMenuKeyDown}
      >
        {children}
      </div>
    </SubItemRegistrar>
  )
}

function SubItemRegistrar({ children, registerSubItem }) {
  return (
    <SubItemContext.Provider value={registerSubItem}>
      {children}
    </SubItemContext.Provider>
  )
}