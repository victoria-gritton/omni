import { useState, useRef, useCallback, useEffect, cloneElement } from 'react'
import { createPortal } from 'react-dom'
import { cn } from './lib/utils'

/**
 * Tooltip component — SSO Rhythm
 */

export default function Tooltip({
  content,
  placement = 'top',
  delay = 300,
  isDark = true,
  children,
}) {
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const showTimer = useRef(null)
  const triggerRef = useRef(null)
  const tooltipRef = useRef(null)

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current
    const tooltip = tooltipRef.current
    if (!trigger || !tooltip) return

    const tRect = trigger.getBoundingClientRect()
    const ttRect = tooltip.getBoundingClientRect()
    const gap = 8

    let top, left
    switch (placement) {
      case 'bottom':
        top = tRect.bottom + gap
        left = tRect.left + tRect.width / 2 - ttRect.width / 2
        break
      case 'left':
        top = tRect.top + tRect.height / 2 - ttRect.height / 2
        left = tRect.left - ttRect.width - gap
        break
      case 'right':
        top = tRect.top + tRect.height / 2 - ttRect.height / 2
        left = tRect.right + gap
        break
      default: // top
        top = tRect.top - ttRect.height - gap
        left = tRect.left + tRect.width / 2 - ttRect.width / 2
    }

    setPosition({ top, left })
  }, [placement])

  const show = useCallback(() => {
    clearTimeout(showTimer.current)
    showTimer.current = setTimeout(() => {
      setVisible(true)
    }, delay)
  }, [delay])

  const hide = useCallback(() => {
    clearTimeout(showTimer.current)
    setVisible(false)
  }, [])

  useEffect(() => {
    if (visible) updatePosition()
  }, [visible, updatePosition])

  useEffect(() => {
    if (!visible) return
    const onScrollOrResize = () => updatePosition()
    window.addEventListener('scroll', onScrollOrResize, true)
    window.addEventListener('resize', onScrollOrResize)
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true)
      window.removeEventListener('resize', onScrollOrResize)
    }
  }, [visible, updatePosition])

  useEffect(() => {
    return () => clearTimeout(showTimer.current)
  }, [])

  // Tooltip colors — hardcoded since portal renders outside .new-glass scope
  const bg = isDark ? 'bg-slate-100' : 'bg-slate-800'
  const text = isDark ? 'text-slate-900' : 'text-slate-100'
  const arrowBorder = isDark ? 'border-slate-100' : 'border-slate-800'

  const arrowStyles = {
    top: `left-1/2 -translate-x-1/2 top-full border-l-transparent border-r-transparent border-b-transparent ${arrowBorder}`,
    bottom: `left-1/2 -translate-x-1/2 bottom-full border-l-transparent border-r-transparent border-t-transparent ${arrowBorder}`,
    left: `top-1/2 -translate-y-1/2 left-full border-t-transparent border-b-transparent border-r-transparent ${arrowBorder}`,
    right: `top-1/2 -translate-y-1/2 right-full border-t-transparent border-b-transparent border-l-transparent ${arrowBorder}`,
  }

  return (
    <>
      {cloneElement(children, {
        ref: triggerRef,
        onMouseEnter: show,
        onMouseLeave: hide,
        onFocus: show,
        onBlur: hide,
        className: cn(children.props.className, 'min-w-6 min-h-6'),
      })}
      {createPortal(
        <div
          ref={tooltipRef}
          role="tooltip"
          style={{
            position: 'fixed',
            top: position.top,
            left: position.left,
            zIndex: 9999,
            pointerEvents: 'none',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : placement === 'bottom' ? 'translateY(-4px)' : 'translateY(4px)',
            transition: 'opacity 150ms ease, transform 150ms ease',
          }}
        >
          <div className={`relative px-2.5 py-1.5 rounded-md text-body-s font-medium whitespace-nowrap shadow-md ${bg} ${text}`}>
            {content}
            <span className={`absolute w-0 h-0 border-solid border-[6px] ${arrowStyles[placement]}`} />
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
