/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'display-l': ['42px', '48px'],
        'heading-xl': ['24px', '30px'],
        'heading-l': ['18px', '22px'],
        'heading-m': ['16px', '20px'],
        'heading-s': ['14px', '18px'],
        'heading-xs': ['12px', '16px'],
        'body-m': ['14px', '24px'],
        'body-s': ['12px', '20px'],
        'code': ['12px', '16px'],
        'pre': ['14px', '20px'],
      },
      colors: {
        background: {
          DEFAULT: '#0a0e1a',
          'surface-1': '#111827',
          'surface-2': '#1e293b',
        },
        foreground: {
          DEFAULT: '#f1f5f9',
          secondary: '#94a3b8',
          muted: '#64748b',
          disabled: '#475569',
        },
        link: '#38bdf8',
        border: {
          DEFAULT: 'rgba(51, 65, 85, 0.5)',
          muted: 'rgba(51, 65, 85, 0.2)',
        },
        primary: '#0ea5e9',
        destructive: '#ef4444',
        status: {
          active: '#22c55e',
          blocked: '#f59e0b',
          outage: '#ef4444',
          inactive: '#64748b',
        },
      },
      borderRadius: {
        xl: '12px',
        lg: '8px',
      },
      boxShadow: {
        'glass': '0 4px 24px rgba(0, 0, 0, 0.3)',
        'glass-light': '0 2px 12px rgba(0, 0, 0, 0.08)',
      },
      transitionDuration: {
        'panel': '160ms',
        'hover': '80ms',
        'spring': '300ms',
      },
    },
  },
  plugins: [],
}
