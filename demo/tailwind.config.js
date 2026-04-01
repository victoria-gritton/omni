/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Amazon Ember', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'display-l': ['42px', '48px'],
        'heading-xl': ['24px', '30px'],
        'heading-l': ['18px', '22px'],
        'heading-m': ['16px', '20px'],
        'heading-s': ['14px', '18px'],
        'heading-xs': ['12px', '16px'],
        'body-m': ['13px', '20px'],
        'body-s': ['11px', '18px'],
        'code': ['11px', '16px'],
        'pre': ['13px', '20px'],
      },
      colors: {
        // Cloudscape dark mode tokens
        background: {
          DEFAULT: '#0f141a',       // main content area
          'surface-1': '#1b232d',   // dropdown bg, hover bg, shaded cells
          'surface-2': '#232b37',   // disabled primary bg, row dividers
        },
        foreground: {
          DEFAULT: '#c6c6cd',       // body text, cell data
          secondary: '#a4a4ad',     // descriptions, placeholders, secondary text
          muted: '#8c8c94',         // disabled text, breadcrumb current, form borders
          disabled: '#656871',      // disabled controls, divider borders, input borders
        },
        link: '#42b4ff',            // links, active tabs, primary buttons
        border: {
          DEFAULT: '#424650',       // dividers, side nav, help panel
          muted: '#333843',         // active button bg, disabled checkbox bg
        },
        input: {
          DEFAULT: '#0f141a',       // input background
          border: '#656871',        // input border
        },
        primary: {
          DEFAULT: '#42b4ff',       // primary buttons, checkboxes, focus rings, links
          foreground: '#0f141a',    // text on primary buttons
        },
        'primary-foreground': '#0f141a',
        destructive: '#db0000',     // error badges
        status: {
          active: '#00802f',        // success text/icons (Cloudscape green)
          blocked: '#855900',       // warning border/icons (Cloudscape amber)
          outage: '#ff7a7a',        // error text/icons (Cloudscape red text)
          inactive: '#656871',      // inactive/loading
        },
        // GenAI purple
        purple: {
          400: '#bf80ff',           // Cloudscape GenAI label color
          500: '#7300e5',           // GenAI accent
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
