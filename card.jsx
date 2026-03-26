/**
 * Shared Card component with glassmorphic variants.
 *
 * Variants:
 *  - "glass"    : Standard glass card — rounded-xl, no gradient accent
 *  - "ai-glass" : AI glass card — rounded-xl, gradient accent + hover glow
 *  - "metric"  : Compact metric/stat card — rounded-xl, lighter blur
 *  - "widget"  : Minimal widget card — rounded-xl, ultra-subtle
 *  - "popover" : Elevated popover/dropdown — rounded-xl, heavy blur + shadow
 *  - "flat"    : No background, just border (dashed add-widget zone)
 *  - "transparent" : No background, muted border, subtle bg on hover
 *
 * Dark backgrounds use CSS `background` shorthand to layer a transparent
 * gradient over the semantic --card token, keeping theming token-driven.
 */

const variants = {
  glass: {
    dark: {
      className: 'backdrop-blur-[20px] border border-border-muted rounded-xl shadow-glass',
      style: { background: 'var(--card)' },
    },
    light: {
      className: 'bg-white/30 backdrop-blur-[20px] border border-black/8 rounded-xl shadow-glass-light',
      style: {},
    },
  },
  'ai-glass': {
    dark: {
      className: 'backdrop-blur-[20px] border border-border-muted rounded-xl shadow-glass',
      style: { background: 'linear-gradient(160deg, rgba(255,255,255,0.08) 0%, transparent 33%), var(--card)' },
    },
    light: {
      className: 'bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-[20px] border border-black/8 rounded-xl shadow-glass-light',
      style: {},
    },
  },
  metric: {
    dark: {
      className: 'backdrop-blur-[16px] rounded-xl shadow-md',
      style: { background: 'linear-gradient(160deg, rgba(255,255,255,0.07) 0%, transparent 33%), var(--card)' },
    },
    light: {
      className: 'bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-[16px] rounded-xl shadow-metric-light',
      style: {},
    },
  },
  widget: {
    dark: {
      className: 'border border-border-muted rounded-xl',
      style: { background: 'linear-gradient(160deg, rgba(255,255,255,0.06) 0%, transparent 33%), var(--card)' },
    },
    light: {
      className: 'bg-white/40 border border-black/[0.04] rounded-xl',
      style: {},
    },
  },
  popover: {
    dark: {
      className: 'border border-border-muted rounded-xl shadow-2xl backdrop-blur-xl',
      style: { background: 'linear-gradient(160deg, rgba(255,255,255,0.06) 0%, transparent 33%), var(--card)' },
    },
    light: {
      className: 'bg-white/95 border border-gray-200 rounded-xl shadow-2xl backdrop-blur-xl',
      style: {},
    },
  },
  flat: {
    dark: {
      className: 'rounded-xl bg-background-surface-1',
      style: {},
    },
    light: {
      className: 'rounded-xl bg-slate-50',
      style: {},
    },
  },
  placeholder: {
    dark: {
      className: 'rounded-xl border-2 border-dashed border-border',
      style: {},
    },
    light: {
      className: 'rounded-xl border-2 border-dashed border-gray-200',
      style: {},
    },
  },
  outlined: {
    dark: {
      className: 'rounded-xl border border-border',
      style: {},
    },
    light: {
      className: 'rounded-xl border border-slate-200',
      style: {},
    },
  },
  transparent: {
    dark: {
      className: 'rounded-xl border border-border-muted bg-transparent hover:bg-white/[0.03] transition-colors duration-200',
      style: {},
    },
    light: {
      className: 'rounded-xl border border-black/8 bg-transparent hover:bg-black/[0.02] transition-colors duration-200',
      style: {},
    },
  },
}

/**
 * Returns { className, style } for a given variant + theme.
 * Use className for Tailwind classes, style for the layered background.
 */
export function cardStyles(variant = 'glass', isDark = true) {
  const v = variants[variant] || variants.glass
  const mode = isDark ? v.dark : v.light
  return mode.className
}

export function cardStylesFull(variant = 'glass', isDark = true) {
  const v = variants[variant] || variants.glass
  return isDark ? v.dark : v.light
}

export default function Card({
  variant = 'glass',
  isDark = true,
  className = '',
  style: propStyle = {},
  children,
  ...props
}) {
  const { className: variantClass, style: variantStyle } = cardStylesFull(variant, isDark)
  const overflow = variant === 'widget' ? '' : 'overflow-hidden'
  const showGlow = isDark && (variant === 'ai-glass' || variant === 'metric')
  return (
    <div
      className={`${variantClass} relative ${overflow} group/card ${className}`}
      style={{ ...variantStyle, ...propStyle }}
      {...props}
    >
      {/* Hover glow — only on glass/metric variants */}
      {showGlow && (
        <span
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-[1px] opacity-0 group-hover/card:opacity-100 transition-opacity duration-300"
          style={{ background: 'linear-gradient(90deg, transparent, #38bdf8, #fb7185, transparent)' }}
        />
      )}
      {showGlow && (
        <span
          className="pointer-events-none absolute -top-1 left-1/2 -translate-x-1/2 w-1/2 h-8 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 blur-xl"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(56,189,248,0.15), rgba(251,113,133,0.18), transparent)' }}
        />
      )}
      {children}
    </div>
  )
}
