/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Open Sans', 'Amazon Ember', 'system-ui', 'sans-serif'],
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
          DEFAULT: '#161D26',
          'surface-1': '#192534',
          'surface-2': '#232f3e',
        },
        foreground: {
          DEFAULT: '#d1d5db',
          secondary: '#b6bec9',
          muted: '#8d99a8',
          disabled: '#5f6b7a',
        },
        link: '#0972d3',
        border: {
          DEFAULT: '#414d5c',
          muted: '#354150',
        },
        input: {
          DEFAULT: '#192534',
          border: '#414d5c',
        },
        primary: {
          DEFAULT: '#0972d3',
          foreground: '#ffffff',
        },
        'primary-foreground': '#ffffff',
        destructive: '#d91515',
        status: {
          active: '#2ea043',
          blocked: '#ff9900',
          outage: '#d91515',
          inactive: '#5f6b7a',
        },
      },
      borderRadius: {
        xl: '8px',
        lg: '4px',
      },
      boxShadow: {
        'glass': '0 2px 8px rgba(0, 0, 0, 0.3)',
        'glass-light': '0 1px 4px rgba(0, 0, 0, 0.08)',
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
