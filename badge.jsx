import { forwardRef } from 'react'
import { XCircle, Warning, CheckCircle, Info } from '@phosphor-icons/react'

/**
 * Badge component — SSO Rhythm
 *
 * Variants: "default" | "outline" | "primary"
 * Status:   "success" | "warning" | "danger" | "active" | "inactive"
 * Severity: "critical" | "high" | "medium" | "low"
 * Sizes:    "default" | "sm"
 * Props:    leftIcon, rightIcon, disabled, maxWidth
 */

const variantStyles = {
  default: {
    dark: 'bg-secondary text-foreground-secondary',
    light: 'bg-slate-200 text-slate-700',
  },
  primary: {
    dark: 'bg-primary text-primary-foreground border border-white/10',
    light: 'bg-slate-950 text-white',
  },
}

const statusStyles = {
  active: { dark: 'bg-status-active text-slate-900', light: 'bg-emerald-600 text-white' },
  pending: { dark: 'bg-status-pending text-white', light: 'bg-blue-600 text-white' },
  blocked: { dark: 'bg-status-blocked text-slate-900', light: 'bg-amber-600 text-white' },
  inactive: { dark: 'bg-status-inactive text-slate-900', light: 'bg-neutral-500 text-white' },
  outage: { dark: 'bg-status-outage text-white', light: 'bg-red-700 text-white' },
  draft: { dark: 'bg-status-draft text-slate-200', light: 'bg-slate-400 text-slate-700' },
}

const severityStyles = {
  critical: { dark: 'bg-severity-critical text-white', light: 'bg-red-700 text-white' },
  error: { dark: 'bg-severity-error text-white', light: 'bg-red-600 text-white' },
  warning: { dark: 'bg-severity-warning text-slate-900', light: 'bg-amber-600 text-white' },
  info: { dark: 'bg-severity-info text-white', light: 'bg-blue-600 text-white' },
  success: { dark: 'bg-severity-success text-slate-900', light: 'bg-emerald-600 text-white' },
}

const statusIconMap = {
  critical: XCircle,
  error: XCircle,
  warning: Warning,
  success: CheckCircle,
  info: Info,
}

const sizeStyles = {
  default: 'px-2.5 py-0.5',
  sm: 'px-2 py-px',
}

const Badge = forwardRef(function Badge(
  {
    variant = 'default',
    status,
    severity,
    size = 'default',
    isDark = true,
    disabled = false,
    leftIcon,
    rightIcon,
    maxWidth = 200,
    className = '',
    children,
    ...props
  },
  ref
) {
  const mode = isDark ? 'dark' : 'light'

  // Priority: severity > status > variant
  let colorClasses
  if (severity && severityStyles[severity]) {
    colorClasses = severityStyles[severity][mode]
  } else if (status && statusStyles[status]) {
    colorClasses = statusStyles[status][mode]
  } else {
    colorClasses = variantStyles[variant]?.[mode] || variantStyles.default[mode]
  }

  const s = sizeStyles[size] || sizeStyles.default

  const StatusIcon = statusIconMap[severity] || null

  const classes = [
    'inline-flex items-center gap-1 rounded-full text-xs font-medium whitespace-nowrap',
    colorClasses,
    s,
    disabled ? 'opacity-40 cursor-not-allowed' : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <span ref={ref} data-slot="badge" className={classes} style={{ maxWidth }} {...props}>
      {StatusIcon && <StatusIcon size={12} className="shrink-0" aria-hidden="true" />}
      {leftIcon && <span className="shrink-0 flex items-center">{leftIcon}</span>}
      <span className="truncate">{children}</span>
      {rightIcon && <span className="shrink-0 flex items-center">{rightIcon}</span>}
    </span>
  )
})

export default Badge
