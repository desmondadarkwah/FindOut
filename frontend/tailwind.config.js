/** @type {import('tailwindcss').Config} */

/* Helper: bind a Tailwind colour to a CSS variable holding RGB channels, so
   opacity modifiers (bg-surface-raised/60) keep working. */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      /* Semantic colours. Tailwind's default palette is still available, so
         existing components keep working while screens are migrated. */
      colors: {
        surface: {
          sunken:  token('surface-sunken'),
          base:    token('surface-base'),
          raised:  token('surface-raised'),
          overlay: token('surface-overlay'),
          input:   token('surface-input'),
          hover:   token('surface-hover'),
        },
        edge: {
          subtle:  token('edge-subtle'),
          DEFAULT: token('edge-default'),
          strong:  token('edge-strong'),
        },
        content: {
          primary:   token('content-primary'),
          secondary: token('content-secondary'),
          muted:     token('content-muted'),
          inverse:   token('content-inverse'),
        },
        primary: {
          300:     token('primary-300'),
          400:     token('primary-400'),
          500:     token('primary-500'),
          600:     token('primary-600'),
          700:     token('primary-700'),
          DEFAULT: token('primary-500'),
        },
        accent: {
          400:     token('accent-400'),
          500:     token('accent-500'),
          DEFAULT: token('accent-500'),
        },
        success: {
          400:     token('success-400'),
          500:     token('success-500'),
          DEFAULT: token('success-500'),
        },
        warning: {
          400:     token('warning-400'),
          500:     token('warning-500'),
          DEFAULT: token('warning-500'),
        },
        danger: {
          400:     token('danger-400'),
          500:     token('danger-500'),
          DEFAULT: token('danger-500'),
        },
      },

      ringColor: {
        DEFAULT: token('ring'),
      },

      /* Elevation. Dark themes read depth from surface lightness more than
         from shadow, so these stay tight and low-opacity. */
      boxShadow: {
        'elev-1': '0 1px 2px 0 rgb(0 0 0 / 0.28)',
        'elev-2': '0 2px 8px -2px rgb(0 0 0 / 0.36)',
        'elev-3': '0 8px 24px -6px rgb(0 0 0 / 0.45)',
        'elev-4': '0 20px 48px -12px rgb(0 0 0 / 0.60)',
      },

      fontSize: {
        'xxs': '0.5rem', // 8px
      },

      /* Stacking order declared once, so layers cannot fight each other.
         The bug fixed in ManageUser.jsx was caused by an ad-hoc z-10. */
      zIndex: {
        'dropdown': '40',
        'panel':    '50',
        'backdrop': '90',
        'dialog':   '100',
        'toast':    '110',
      },
    },
  },
  plugins: [],
}
