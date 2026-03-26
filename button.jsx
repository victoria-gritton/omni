import { forwardRef } from 'react'

/**
 * Button component — SSO Rhythm
 *
 * Variants: "default" | "secondary" | "destructive" | "outline" | "ghost" | "link"
 * Sizes:    "default" (h-8, px-4) | "sm" (h-6, px-3) | "icon" (h-8 w-8) | "icon-sm" (h-6 w-6)
 */

const variantStyles = {
  default: {
    dark: 'bg-primary border border-white/10 text-primary-foreground hover:bg-slate-200 active:bg-slate-300',
    light: 'bg-slate-950 border border-slate-800 text-white hover:bg-slate-800 active:bg-slate-700',
  },
  secondary: {
    dark: 'bg-secondary border border-transparent text-secondary-foreground hover:bg-slate-600 active:bg-slate-700/80',
    light: 'bg-slate-200 border border-transparent text-slate-700 hover:bg-slate-300 active:bg-slate-200/80',
  },
  destructive: {
    dark: 'bg-destructive border border-transparent text-destructive-foreground hover:bg-red-700 active:bg-red-800',
    light: 'bg-red-600 border border-transparent text-white hover:bg-red-700 active:bg-red-800',
  },
  outline: {
    dark: 'bg-background-surface-1 border border-border-muted text-foreground-secondary hover:bg-background-surface-2 active:bg-background-surface-1/80',
    light: 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 active:bg-slate-100',
  },
  ghost: {
    dark: 'bg-transparent border border-transparent text-primary hover:bg-white/5 active:bg-white/10',
    light: 'bg-transparent border border-transparent text-slate-900 hover:bg-black/5 active:bg-black/10',
  },
  link: {
    dark: 'bg-transparent border border-transparent text-link hover:underline active:text-blue-300',
    light: 'bg-transparent border border-transparent text-blue-600 hover:underline active:text-blue-700',
  },
}

const sizeStyles = {
  default: 'h-8 px-4 py-2 gap-2 text-sm tracking-[-0.12px]',
  sm: 'h-6 px-3 py-2 gap-2 text-xs tracking-[-0.1px]',
  icon: 'h-8 w-8 p-0 justify-center',
  'icon-sm': 'h-6 w-6 p-0 justify-center',
}

const Button = forwardRef(function Button(
  {
    variant = 'default',
    size = 'default',
    isDark = true,
    disabled = false,
    loading = false,
    leftIcon = null,
    rightIcon = null,
    className = '',
    children,
    ...props
  },
  ref
) {
  const mode = isDark ? 'dark' : 'light'
  const v = variantStyles[variant]?.[mode] || variantStyles.default[mode]
  const s = sizeStyles[size] || sizeStyles.default
  const isIconOnly = size === 'icon' || size === 'icon-sm'

  const classes = [
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 whitespace-nowrap cursor-pointer',
    'focus-visible:outline-none focus-visible:shadow-ring-default',
    v,
    s,
    disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '',
    loading ? 'pointer-events-none' : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <button ref={ref} disabled={disabled} className={classes} {...props}>
      {loading && (
        <svg className="animate-spin w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {!loading && leftIcon && <span className="shrink-0 w-4 h-4 flex items-center justify-center">{leftIcon}</span>}
      {!isIconOnly && children && <span>{children}</span>}
      {isIconOnly && !loading && children}
      {!loading && rightIcon && <span className="shrink-0 w-4 h-4 flex items-center justify-center">{rightIcon}</span>}
    </button>
  )
})

export default Button
