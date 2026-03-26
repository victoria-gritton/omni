import { createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from './lib/utils'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from './dropdown-menu'
import { DotsThree, FloppyDisk, Copy, X } from '@phosphor-icons/react'

/**
 * Tabs component — SSO Rhythm
 *
 * Variants: "default" | "compressed"
 *   - default:    text-sm, px-3 py-2.5, 16px icons, pb-4 list spacing
 *   - compressed: text-xs, px-2 py-1.5, 12px icons, pb-2 list spacing
 *
 * Two usage modes:
 *
 * 1. Data-driven (recommended):
 *   <Tabs
 *     tabs={[{ id: 'one', label: 'Tab One', icon: SomeIcon }]}
 *     value={tab}
 *     onValueChange={setTab}
 *     variant="compressed"
 *     onAdd={handleAdd}
 *     onClose={handleClose}
 *     isDark={isDark}
 *   >
 *     <TabsContent value="one">…</TabsContent>
 *   </Tabs>
 *
 * 2. Composable (manual):
 *   <Tabs value={tab} onValueChange={setTab} variant="compressed">
 *     <TabsList isDark={isDark} onAdd={handleAdd}>
 *       <TabsTrigger value="one" icon={<Icon />} onClose={handleClose}>One</TabsTrigger>
 *     </TabsList>
 *     <TabsContent value="one">…</TabsContent>
 *   </Tabs>
 */

const easeOut = [0.4, 0, 0.2, 1]

const TabsContext = createContext({ value: '', onValueChange: () => {}, isDark: true, variant: 'default' })

export function Tabs({ tabs, value, onValueChange, onAdd, onAddOptions, onClose, onTabAction, isDark = true, variant = 'default', defaultIcon, children, className, leftSlot, rightSlot, ...props }) {
  // Data-driven mode: tabs array provided
  if (tabs) {
    const closable = tabs.length > 1 && onClose
    return (
      <TabsContext.Provider value={{ value, onValueChange, isDark, variant }}>
        <div className={cn('flex flex-col', className)} {...props}>
          <TabsList isDark={isDark} onAdd={onAdd} onAddOptions={onAddOptions} leftSlot={leftSlot} rightSlot={rightSlot}>
            {tabs.map(tab => {
              const IconComp = tab.icon
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  icon={IconComp ? <IconComp /> : undefined}
                  onClose={closable ? onClose : undefined}
                  onTabAction={onTabAction}
                  hasUnsavedChanges={tab.hasUnsavedChanges}
                >
                  {tab.label}
                </TabsTrigger>
              )
            })}
          </TabsList>
          {children}
        </div>
      </TabsContext.Provider>
    )
  }

  // Composable mode: manual children
  return (
    <TabsContext.Provider value={{ value, onValueChange, isDark, variant }}>
      <div className={cn('flex flex-col', className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

export function TabsList({ isDark = true, onAdd, onAddOptions, leftSlot, rightSlot, children, className, ...props }) {
  const { variant } = useContext(TabsContext)
  const compressed = variant === 'compressed'

  return (
    <TabsContext.Provider value={{ ...useContext(TabsContext), isDark }}>
      <div className={cn(compressed ? 'pb-2' : 'pb-4', className)} {...props}>
        <div className="flex items-center">
        <div
          role="tablist"
          className={cn(
            'flex items-center scrollbar-none pl-4 flex-1 min-w-0',
          )}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {leftSlot}
          <AnimatePresence initial={false}>
            {children}
          </AnimatePresence>
          {/* Add tab button with dropdown */}
          {onAdd && (
            <div className="flex-shrink-0 ml-1">
              {onAddOptions ? (
                <DropdownMenu isDark={isDark}>
                  <DropdownMenuTrigger>
                    <button
                      type="button"
                      className={cn(
                        'rounded-md transition-colors cursor-pointer min-w-6 min-h-6 flex items-center justify-center',
                        compressed ? 'p-1' : 'p-1.5',
                        isDark
                          ? 'text-foreground-disabled hover:text-foreground-secondary hover:bg-white/5'
                          : 'text-gray-400 hover:text-gray-600 hover:bg-black/[0.03]'
                      )}
                      title="Add tab"
                      aria-label="Add tab"
                    >
                      <svg className={compressed ? 'w-3 h-3' : 'w-3.5 h-3.5'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {onAddOptions.map((opt, i) => (
                      <DropdownMenuItem key={i} onSelect={opt.action}>
                        <span className="flex items-center gap-2">
                          {opt.icon && <opt.icon className={cn('w-3.5 h-3.5', opt.iconColor || (isDark ? 'text-foreground-muted' : 'text-gray-400'))} />}
                          {opt.label}
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <button
                  type="button"
                  onClick={onAdd}
                  className={cn(
                    'rounded-md transition-colors cursor-pointer min-w-6 min-h-6 flex items-center justify-center',
                    compressed ? 'p-1' : 'p-1.5',
                    isDark
                      ? 'text-foreground-disabled hover:text-foreground-secondary hover:bg-white/5'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-black/[0.03]'
                  )}
                  title="Add tab"
                  aria-label="Add tab"
                >
                  <svg className={compressed ? 'w-3 h-3' : 'w-3.5 h-3.5'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
        {rightSlot && (
          <div className="flex items-center gap-1.5 flex-shrink-0 pr-3">
            {rightSlot}
          </div>
        )}
        </div>
      </div>
    </TabsContext.Provider>
  )
}

export function TabsTrigger({ value, icon, onClose, onTabAction, hasUnsavedChanges, children, className, ...props }) {
  const { value: selected, onValueChange, isDark, variant } = useContext(TabsContext)
  const active = value === selected
  const compressed = variant === 'compressed'

  const maxLen = compressed ? 18 : 24
  const label = typeof children === 'string' && children.length > maxLen
    ? children.slice(0, maxLen) + '…'
    : children

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 'auto', opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: easeOut }}
      className="group relative"
    >
      <div>
        <div
          role="tab"
          aria-selected={active}
          tabIndex={0}
          title={typeof children === 'string' ? children : undefined}
          onClick={() => onValueChange(value)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onValueChange(value) } }}
          className={cn(
            'flex items-center font-medium transition-colors relative cursor-pointer whitespace-nowrap',
            compressed ? 'gap-1 px-2 py-1 text-xs' : 'gap-1.5 px-3 py-2.5 text-sm',
            active
              ? isDark ? 'text-foreground' : 'text-gray-900'
              : isDark ? 'text-foreground-disabled hover:text-foreground-secondary' : 'text-gray-500 hover:text-gray-700',
            className
          )}
          {...props}
        >
        {icon && (
          <span className={cn(
            'flex-shrink-0 relative',
            compressed ? 'w-3 h-3 [&>svg]:w-3 [&>svg]:h-3' : 'w-4 h-4 [&>svg]:w-4 [&>svg]:h-4',
            isDark ? 'text-foreground-muted' : 'text-gray-400'
          )}>
            {icon}
            {hasUnsavedChanges && (
              <span className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-primary" />
            )}
          </span>
        )}
        {label}
        {(onClose || onTabAction) && (
          <DropdownMenu isDark={isDark}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                tabIndex={0}
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  'flex-shrink-0 rounded transition-colors opacity-0 group-hover:opacity-100 min-w-5 min-h-5 flex items-center justify-center',
                  isDark
                    ? 'text-foreground-disabled hover:text-foreground hover:bg-white/10'
                    : 'text-gray-400 hover:text-gray-700 hover:bg-black/10'
                )}
                aria-label={`Actions for ${children} tab`}
              >
                <DotsThree size={compressed ? 12 : 14} weight="bold" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {onTabAction && (
                <DropdownMenuItem onSelect={() => onTabAction(value, 'save')}>
                  Save view
                </DropdownMenuItem>
              )}
              {onTabAction && (
                <DropdownMenuItem onSelect={() => onTabAction(value, 'duplicate')}>
                  Duplicate
                </DropdownMenuItem>
              )}
              {onClose && onTabAction && <DropdownMenuSeparator />}
              {onClose && (
                <DropdownMenuItem onSelect={() => onClose(value)}>
                  Close
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        </div>
      </div>
      {/* Underline — muted for active, gradient on hover */}
      {active && (
        <span className={cn(
          'absolute bottom-0 left-0 right-0 h-[2px] group-hover:opacity-0 transition-opacity',
          isDark ? 'bg-foreground-muted' : 'bg-gray-400',
        )} />
      )}
      <span
        className="absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: 'linear-gradient(90deg, var(--herman-turquoise-light), var(--herman-pink-light))' }}
      />
    </motion.div>
  )
}

export function TabsContent({ value, children, className, ...props }) {
  const { value: selected } = useContext(TabsContext)
  if (value !== selected) return null

  return (
    <div role="tabpanel" className={cn(className)} {...props}>
      {children}
    </div>
  )
}
