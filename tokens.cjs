/**
 * SSO Rhythm — Token Definitions
 *
 * Each key is a CSS custom property name.
 * Each value is either:
 *   - A Tailwind theme path string (resolved via theme() at plugin time)
 *   - A raw CSS value object (used as-is)
 *
 * Consumed by plugin.js to inject tokens into .new-glass via addBase().
 */

// Helper to mark a value as a raw CSS literal (not a theme path)
const raw = (v) => ({ __raw: true, value: v });

// Helper to mark a value as referencing another CSS var
const cssVar = (name) => raw(`var(--${name})`);

const tokens = {
  // ── Background Scale ──
  '--background-absolute': 'colors.slate.950',
  '--background':          'colors.slate.950',
  '--background-surface-1': 'colors.slate.900',
  '--background-surface-2': 'colors.slate.800',
  '--background-surface-3': 'colors.slate.700',

  // ── Text Scale ──
  '--foreground':          'colors.slate.100',
  '--foreground-secondary': 'colors.slate.300',
  '--foreground-muted':    'colors.slate.400',
  '--foreground-disabled': 'colors.slate.400',
  '--link':                'colors.blue.400',

  // ── Core Semantic Colors ──
  '--card':                cssVar('background-surface-1'),
  '--card-foreground':     'colors.slate.100',
  '--popover':             cssVar('background-surface-2'),
  '--popover-foreground':  'colors.slate.100',
  '--primary':             'colors.slate.50',
  '--primary-foreground':  'colors.slate.950',
  '--secondary':           'colors.slate.700',
  '--secondary-foreground': 'colors.slate.300',
  '--muted':               'colors.slate.700',
  '--muted-foreground':    'colors.slate.400',
  '--accent':              'colors.teal.400',
  '--accent-foreground':   'colors.slate.950',
  '--destructive':         'colors.red.400',
  '--destructive-foreground': 'colors.white',

  // ── Border / Input / Ring ──
  '--border':              'colors.slate.700',
  '--border-muted':        raw('rgba(51, 65, 85, 0.2)'),
  '--border-bright':       'colors.slate.700',
  '--input':               raw('rgba(255, 255, 255, 0.045)'),
  '--input-2':             raw('rgba(255, 255, 255, 0.125)'),
  '--input-border':        'colors.slate.700',
  '--ring':                'colors.sky.400',
  '--radius':              raw('0.625rem'),

  // ── Text Foreground (legacy compat) ──
  '--text-foreground':     'colors.slate.100',
  '--text-secondary':      'colors.slate.300',

  // ── Severity (dark mode — brighter for dark backgrounds) ──
  '--severity-critical':       'colors.red.500',
  '--severity-error':          'colors.red.400',
  '--severity-warning':        'colors.amber.400',
  '--severity-info':           'colors.blue.400',
  '--severity-success':        'colors.emerald.400',
  // ── Severity (light mode — deeper for white backgrounds) ──
  '--severity-critical-light': 'colors.red.700',
  '--severity-error-light':    'colors.red.600',
  '--severity-warning-light':  'colors.amber.600',
  '--severity-info-light':     'colors.blue.600',
  '--severity-success-light':  'colors.emerald.600',

  // ── Status (dark mode — brighter for dark backgrounds) ──
  '--status-active':       'colors.emerald.400',
  '--status-pending':      'colors.blue.400',
  '--status-blocked':      'colors.amber.400',
  '--status-inactive':     'colors.neutral.400',
  '--status-outage':       'colors.red.500',
  '--status-draft':        'colors.slate.500',
  // ── Status (light mode — deeper for white backgrounds) ──
  '--status-active-light':   'colors.emerald.600',
  '--status-pending-light':  'colors.blue.600',
  '--status-blocked-light':  'colors.amber.600',
  '--status-inactive-light': 'colors.neutral.500',
  '--status-outage-light':   'colors.red.700',
  '--status-draft-light':    'colors.slate.400',

  // ── Sidebar ──
  '--sidebar':             'colors.slate.950',
  '--sidebar-accent':      'colors.slate.800',
  '--sidebar-accent-foreground': 'colors.slate.300',
  '--sidebar-border':      'colors.slate.700',
  '--sidebar-foreground':  'colors.slate.100',
  '--sidebar-primary':     'colors.slate.50',
  '--sidebar-primary-foreground': 'colors.slate.950',
  '--sidebar-ring':        'colors.sky.400',

  // ── Chart Palette ──
  '--chart-1':  raw('#2dd4bf'),
  '--chart-2':  raw('#22d3ee'),
  '--chart-3':  raw('#f472b6'),
  '--chart-4':  raw('#34d399'),
  '--chart-5':  raw('#fbbf24'),
  '--chart-6':  raw('#818cf8'),
  '--chart-7':  raw('#f87171'),
  '--chart-8':  raw('#a78bfa'),
  '--chart-9':  raw('#fb923c'),
  '--chart-10': raw('#c084fc'),
  '--chart-11': raw('#38bdf8'),
  '--chart-12': raw('#a3e635'),

  // ── Visualization Palettes (Cloudscape-derived) ──
  // Categorical (10 colors, light/dark pairs)
  '--viz-cat-1':         raw('#818cf8'),  // indigo-400 (dark)
  '--viz-cat-1-light':   raw('#6366f1'),  // indigo-500 (light)
  '--viz-cat-2':         raw('#34d399'),  // mint/emerald-400 (dark)
  '--viz-cat-2-light':   raw('#059669'),  // mint/emerald-800 (light)
  '--viz-cat-3':         raw('#a669e2'),  // custom purple (both)
  '--viz-cat-4':         raw('#3b82f6'),  // blue-600 (dark)
  '--viz-cat-4-light':   raw('#1e40af'),  // blue-800 (light)
  '--viz-cat-5':         raw('#22d3ee'),  // cyan-500 (both)
  '--viz-cat-6':         raw('#e879f9'),  // magenta/fuchsia-600 (dark)
  '--viz-cat-6-light':   raw('#a21caf'),  // magenta/fuchsia-700 (light)
  '--viz-cat-7':         raw('#f97316'),  // orange-500 (both)
  '--viz-cat-8':         raw('#fb7185'),  // rose-600 (dark)
  '--viz-cat-8-light':   raw('#e11d48'),  // rose-600 (light)
  '--viz-cat-9':         raw('#fbbf24'),  // amber-400 (both)
  '--viz-cat-10':        raw('#fef3c7'),  // amber-100 (dark)
  '--viz-cat-10-light':  raw('#92400e'),  // amber-800 (light)

  // Sequential (blue→indigo, 8 steps)
  '--viz-seq-1-light':  raw('#bfdbfe'),  // blue-200
  '--viz-seq-1-dark':   raw('#312e81'),  // indigo-950
  '--viz-seq-2-light':  raw('#93c5fd'),  // blue-300
  '--viz-seq-2-dark':   raw('#3730a3'),  // indigo-900
  '--viz-seq-3-light':  raw('#60a5fa'),  // blue-400
  '--viz-seq-3-dark':   raw('#3730a3'),  // indigo-800
  '--viz-seq-4-light':  raw('#3b82f6'),  // blue-500
  '--viz-seq-4-dark':   raw('#2563eb'),  // blue-600
  '--viz-seq-5-light':  raw('#2563eb'),  // blue-600
  '--viz-seq-5-dark':   raw('#3b82f6'),  // blue-500
  '--viz-seq-6-light':  raw('#4f46e5'),  // indigo-700
  '--viz-seq-6-dark':   raw('#60a5fa'),  // blue-400
  '--viz-seq-7-light':  raw('#3730a3'),  // indigo-800
  '--viz-seq-7-dark':   raw('#93c5fd'),  // blue-300
  '--viz-seq-8-light':  raw('#312e81'),  // indigo-900
  '--viz-seq-8-dark':   raw('#bfdbfe'),  // blue-200

  // Diverging (cool→warm, 10 steps)
  '--viz-div-1-light':  raw('#312e81'),  // indigo-950
  '--viz-div-1-dark':   raw('#3730a3'),  // indigo-800
  '--viz-div-2-light':  raw('#1e40af'),  // blue-800
  '--viz-div-2-dark':   raw('#2563eb'),  // blue-600
  '--viz-div-3-light':  raw('#2563eb'),  // blue-600
  '--viz-div-3-dark':   raw('#3b82f6'),  // blue-500
  '--viz-div-4-light':  raw('#3b82f6'),  // blue-400
  '--viz-div-4-dark':   raw('#93c5fd'),  // blue-300
  '--viz-div-5-light':  raw('#93c5fd'),  // blue-300
  '--viz-div-5-dark':   raw('#bfdbfe'),  // blue-200
  '--viz-div-6-light':  raw('#fcd34d'),  // amber-300
  '--viz-div-6-dark':   raw('#fde68a'),  // amber-200
  '--viz-div-7-light':  raw('#fdba74'),  // orange-300
  '--viz-div-7-dark':   raw('#fdba74'),  // orange-300
  '--viz-div-8-light':  raw('#f97316'),  // orange-500
  '--viz-div-8-dark':   raw('#fb923c'),  // orange-400
  '--viz-div-9-light':  raw('#dc2626'),  // red-600
  '--viz-div-9-dark':   raw('#ef4444'),  // red-500
  '--viz-div-10-light': raw('#9f1239'),  // rose-800
  '--viz-div-10-dark':  raw('#be123c'),  // rose-700

  // ── Glassmorphism ──
  '--glass-bg':           raw('rgba(15, 23, 42, 0.6)'),
  '--glass-border':       raw('rgba(255, 255, 255, 0.08)'),
  '--glass-blur':         raw('20px'),
  '--glass-blur-panel':   raw('24px'),
  '--glass-blur-metric':  raw('16px'),
  '--glass-shadow':       raw('0 8px 32px rgba(0, 0, 0, 0.35)'),

  // ── Focus Rings ──
  '--ring-default':       raw('0 0 0 2px var(--background), 0 0 0 4px var(--ring)'),
  '--ring-error':         raw('0 0 0 3px rgba(248, 113, 113, 0.4)'),

  // ── Button Glow ──
  '--button-glow-dark':   raw('0 1px 3px rgba(0, 0, 0, 0.3)'),
  '--button-glow-light':  raw('0 1px 3px rgba(0, 0, 0, 0.15)'),

  // ── Light Mode Shadows ──
  '--shadow-glass-light':     raw('0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)'),
  '--shadow-metric-light':    raw('0 4px 16px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8)'),
  '--shadow-dropdown-light':  raw('0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.1)'),

  // ── Shadows ──
  '--shadow-2xs': raw('0 1px 2px 0px rgb(0 0 0 / 0.25)'),
  '--shadow-xs':  raw('0 1px 3px 0px rgb(0 0 0 / 0.3)'),
  '--shadow-sm':  raw('0 2px 4px 0px rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.25)'),
  '--shadow':     raw('0 2px 6px 0px rgb(0 0 0 / 0.35), 0 1px 3px -1px rgb(0 0 0 / 0.25)'),
  '--shadow-md':  raw('0 4px 8px -1px rgb(0 0 0 / 0.35), 0 2px 4px -2px rgb(0 0 0 / 0.25)'),
  '--shadow-lg':  raw('0 10px 20px -3px rgb(0 0 0 / 0.4), 0 4px 8px -4px rgb(0 0 0 / 0.3)'),
  '--shadow-xl':  raw('0 20px 30px -5px rgb(0 0 0 / 0.45), 0 8px 12px -6px rgb(0 0 0 / 0.3)'),
  '--shadow-2xl': raw('0 25px 50px -12px rgb(0 0 0 / 0.55)'),

  // ── Motion Timing ──
  '--transition-panel': raw('160ms ease-out'),
  '--transition-sort':  raw('120ms ease-out'),
  '--transition-hover': raw('80ms ease-out'),

  // ── Spring Animations ──
  '--spring-bounce':   raw('cubic-bezier(0.68, -0.55, 0.265, 1.55)'),
  '--spring-smooth':   raw('cubic-bezier(0.4, 0, 0.2, 1)'),
  '--spring-snappy':   raw('cubic-bezier(0.175, 0.885, 0.32, 1.275)'),
  '--spring-duration': raw('300ms'),

  // ── Herman Accent Colors ──
  '--herman-turquoise':       raw('#22d3ee'),
  '--herman-violet':          raw('#a78bfa'),
  '--herman-pink':            raw('#f472b6'),
  '--herman-turquoise-light': raw('#67e8f9'),
  '--herman-violet-light':    raw('#c4b5fd'),
  '--herman-pink-light':      raw('#f9a8d4'),
};

module.exports = tokens;
module.exports.raw = raw;
module.exports.cssVar = cssVar;
