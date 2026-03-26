import { createContext, useContext, useState } from 'react'
import { SlidersHorizontal, DotsThree, DotsSixVertical } from '@phosphor-icons/react'
import Card from './card'
import Button from './button'
import Select from './select'
import { Popover, PopoverTrigger, PopoverContent } from './popover'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from './dropdown-menu'
import { cn } from './lib/utils'

/**
 * Widget component — SSO Rhythm
 *
 * Composable widget built on top of Card (variant="widget").
 *
 * Subcomponents:
 *   <Widget>              — Root wrapper (Card shell + context)
 *   <WidgetHeader>        — Title bar with optional icon, actions, description
 *   <WidgetBody>          — Main content area
 *   <WidgetFooter>        — Bottom bar for metadata or actions
 *
 * State components (render instead of WidgetBody):
 *   <WidgetLoading>       — Skeleton shimmer placeholder
 *   <WidgetError>         — Error message with optional retry
 *   <WidgetEmpty>         — Empty state with icon + message
 *
 * Thumbnail mode:
 *   <Widget thumbnail>    — Compact preview for lists/chat embeds
 *
 * Usage:
 *   <Widget isDark>
 *     <WidgetHeader title="Latency p99" icon={<ChartIcon />} />
 *     <WidgetBody>…content…</WidgetBody>
 *     <WidgetFooter>Last updated 2m ago</WidgetFooter>
 *   </Widget>
 *
 *   <Widget isDark thumbnail>
 *     <WidgetHeader title="Latency p99" />
 *     <WidgetBody>…mini content…</WidgetBody>
 *   </Widget>
 */

const WidgetContext = createContext({ isDark: true, thumbnail: false, hovered: false })

export function Widget({
  isDark = true,
  thumbnail = false,
  variant = 'widget',
  className,
  children,
  ...props
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <WidgetContext.Provider value={{ isDark, thumbnail, hovered }}>
      <Card
        variant={variant}
        isDark={isDark}
        className={cn(
          thumbnail ? 'p-2' : 'p-0',
          className
        )}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        {...props}
      >
        {children}
      </Card>
    </WidgetContext.Provider>
  )
}

export function WidgetHeader({
  title,
  icon,
  description,
  actions,
  hideActions,
  onPreview,
  onAddToNewTab,
  onDragStart,
  className,
  children,
  ...props
}) {
  const { isDark, thumbnail, hovered } = useContext(WidgetContext)

  if (thumbnail) {
    return (
      <div className={cn('flex items-center gap-1.5 px-1 pb-1', className)} {...props}>
        {icon && (
          <span className={cn('w-3 h-3 shrink-0 [&>svg]:w-3 [&>svg]:h-3', isDark ? 'text-foreground-muted' : 'text-gray-400')}>
            {icon}
          </span>
        )}
        <h4 className={cn('text-[10px] font-normal truncate', isDark ? 'text-foreground-secondary' : 'text-gray-700')}>
          {title}
        </h4>
        {children}
      </div>
    )
  }

  // No title — render floating action buttons only (absolute top-right)
  if (!title) {
    return (
      <div
        className={cn('absolute top-2 right-2 z-10 flex items-center gap-0.5 transition-opacity duration-150', className)}
        style={{ opacity: hovered ? 1 : 0, pointerEvents: hovered ? 'auto' : 'none' }}
        {...props}
      >
        {actions}
        <WidgetScopeButton isDark={isDark} />
        <WidgetMenuButton isDark={isDark} onPreview={onPreview} onAddToNewTab={onAddToNewTab} />
      </div>
    )
  }

  return (
    <div className={cn('flex items-start justify-between gap-2 px-2 pt-2 pb-1', className)} {...props}>
      <div className="flex items-center gap-1.5 min-w-0">
        {onDragStart && (
          <span
            draggable
            onDragStart={onDragStart}
            className={cn(
              'shrink-0 transition-all duration-hover ease-spring-smooth hover:cursor-grab active:cursor-grabbing',
              isDark
                ? 'text-foreground-disabled hover:text-foreground-muted'
                : 'text-gray-400 hover:text-gray-500'
            )}
            style={{ opacity: hovered ? 1 : 0, pointerEvents: hovered ? 'auto' : 'none' }}
          >
            <DotsSixVertical size={14} />
          </span>
        )}
        {icon && (
          <span className={cn('w-4 h-4 shrink-0 [&>svg]:w-4 [&>svg]:h-4', isDark ? 'text-foreground-muted' : 'text-gray-400')}>
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <h4 className={cn('text-heading-s font-normal truncate', isDark ? 'text-foreground' : 'text-gray-900')}>
            {title}
          </h4>
          {description && (
            <p className={cn('text-[10px] mt-0.5 truncate', isDark ? 'text-foreground-muted' : 'text-gray-500')}>
              {description}
            </p>
          )}
        </div>
      </div>
      {!hideActions && (
        <div
          className="flex items-center gap-0.5 shrink-0 transition-opacity duration-150"
          style={{ opacity: hovered ? 1 : 0, pointerEvents: hovered ? 'auto' : 'none' }}
        >
          {actions}
          <WidgetScopeButton isDark={isDark} />
          <WidgetMenuButton isDark={isDark} onPreview={onPreview} onAddToNewTab={onAddToNewTab} />
        </div>
      )}
      {children}
    </div>
  )
}

export function WidgetBody({ className, children, ...props }) {
  const { thumbnail } = useContext(WidgetContext)

  return (
    <div
      className={cn(
        thumbnail ? 'px-1 py-0.5' : 'p-2',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function WidgetFooter({ className, children, ...props }) {
  const { isDark, thumbnail } = useContext(WidgetContext)

  if (thumbnail) return null

  return (
    <div
      className={cn(
        'flex items-center gap-2 p-2 text-[10px]',
        isDark ? 'text-foreground-disabled border-t border-border-muted' : 'text-gray-400 border-t border-gray-100',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// ── Widget Scope Popover ──

const scopeTimeOptions = [
  { value: 'Last 1h', label: 'Last 1h' },
  { value: 'Last 6h', label: 'Last 6h' },
  { value: 'Last 24h', label: 'Last 24h' },
  { value: 'Last 7d', label: 'Last 7d' },
]

const scopeEnvOptions = [
  { value: 'prod', label: 'prod' },
  { value: 'staging', label: 'staging' },
  { value: 'dev', label: 'dev' },
]

export function WidgetScopeButton({ isDark }) {
  const [isOpen, setIsOpen] = useState(false)
  const [time, setTime] = useState('Last 6h')
  const [env, setEnv] = useState('prod')

  return (
    <Popover isDark={isDark} open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon-sm" isDark={isDark} title="Widget scope">
          <SlidersHorizontal size={12} />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56">
        <div className="p-3 space-y-3">
          <ScopeField label="Time range">
            <Select isDark={isDark} value={time} onChange={setTime} options={scopeTimeOptions} />
          </ScopeField>
          <ScopeField label="Environment">
            <Select isDark={isDark} value={env} onChange={setEnv} options={scopeEnvOptions} />
          </ScopeField>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function ScopeField({ label, children }) {
  return (
    <div>
      <div className="text-body-s font-medium mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</div>
      {children}
    </div>
  )
}

// ── Widget Menu (Ellipsis) ──

export function WidgetMenuButton({ isDark, onPreview, onAddToNewTab }) {
  return (
    <DropdownMenu isDark={isDark}>
      <DropdownMenuTrigger>
        <Button variant="ghost" size="icon-sm" isDark={isDark} title="Widget options">
          <DotsThree size={14} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={onPreview}>Preview</DropdownMenuItem>
        <DropdownMenuItem onSelect={onAddToNewTab}>Add to new tab</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ── State: Loading ──

export function WidgetLoading({ rows = 3, className, ...props }) {
  const { isDark, thumbnail } = useContext(WidgetContext)

  const shimmerClass = cn(
    'rounded animate-pulse',
    isDark ? 'bg-white/[0.06]' : 'bg-black/[0.06]'
  )

  if (thumbnail) {
    return (
      <div className={cn('px-1 py-1 space-y-1', className)} {...props}>
        <div className={cn(shimmerClass, 'h-2 w-3/4')} />
        <div className={cn(shimmerClass, 'h-2 w-1/2')} />
      </div>
    )
  }

  return (
    <div className={cn('p-2 space-y-2.5', className)} {...props}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={cn(shimmerClass, 'h-3')}
          style={{ width: `${70 + Math.round(Math.random() * 25)}%` }}
        />
      ))}
    </div>
  )
}

// ── State: Error ──

export function WidgetError({ message = 'Failed to load', onRetry, className, ...props }) {
  const { isDark, thumbnail } = useContext(WidgetContext)

  if (thumbnail) {
    return (
      <div className={cn('px-1 py-1 flex items-center gap-1', className)} {...props}>
        <svg className="w-3 h-3 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        <span className="text-[10px] text-red-400 truncate">{message}</span>
      </div>
    )
  }

  return (
    <div className={cn('p-2 flex flex-col items-center justify-center gap-2 text-center', className)} {...props}>
      <svg className={cn('w-6 h-6', isDark ? 'text-red-400/60' : 'text-red-400')} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
      <p className={cn('text-xs', isDark ? 'text-foreground-muted' : 'text-gray-500')}>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className={cn(
            'text-[11px] font-medium px-3 py-1 rounded-md transition-colors cursor-pointer',
            isDark
              ? 'text-sky-400 hover:bg-white/5'
              : 'text-sky-600 hover:bg-black/5'
          )}
        >
          Retry
        </button>
      )}
    </div>
  )
}

// ── State: Empty ──

export function WidgetEmpty({ message = 'No data available', icon, className, ...props }) {
  const { isDark, thumbnail } = useContext(WidgetContext)

  if (thumbnail) {
    return (
      <div className={cn('px-1 py-1', className)} {...props}>
        <span className={cn('text-[10px]', isDark ? 'text-foreground-disabled' : 'text-gray-400')}>{message}</span>
      </div>
    )
  }

  return (
    <div className={cn('p-2 flex flex-col items-center justify-center gap-2 text-center', className)} {...props}>
      {icon || (
        <svg className={cn('w-6 h-6 opacity-40', isDark ? 'text-foreground-disabled' : 'text-gray-300')} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
      )}
      <p className={cn('text-xs', isDark ? 'text-foreground-disabled' : 'text-gray-400')}>{message}</p>
    </div>
  )
}
