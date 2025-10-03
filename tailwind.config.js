/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Theme-aware colors that use CSS variables (work in ALL themes)
        'theme': {
          'bg': 'rgb(var(--bg-color-rgb) / <alpha-value>)',
          'card': 'rgb(var(--card-color-rgb) / <alpha-value>)',
          'lighter': 'rgb(var(--lighter-color-rgb) / <alpha-value>)',
          'text': 'rgb(var(--text-color-rgb) / <alpha-value>)',
          'textDim': 'rgb(var(--text-dim-color-rgb) / <alpha-value>)',
        },
        
        // Primary accent - NOW USES CSS VARIABLES (adapts to all themes)
        'accent-primary': 'var(--color-accent-primary)',
        'accent-hover': 'var(--color-accent-hover)',
        'accent-light': 'var(--color-accent-light)',
        
        // Semantic colors - NOW USE CSS VARIABLES (adapt to all themes)
        'success': 'var(--color-success)',
        'success-hover': 'var(--color-success-hover)',
        'error': 'var(--color-error)',
        'error-hover': 'var(--color-error-hover)',
        'warning': 'var(--color-warning)',
        'warning-hover': 'var(--color-warning-hover)',
        'info': 'var(--color-info)',
        'info-hover': 'var(--color-info-hover)',
      },
      boxShadow: {
        'theme-xs': 'var(--shadow-xs)',
        'theme-sm': 'var(--shadow-sm)',
        'theme-md': 'var(--shadow-md)',
        'theme-lg': 'var(--shadow-lg)',
        'theme-xl': 'var(--shadow-xl)',
      },
      backgroundImage: {
        'gradient-subtle': 'var(--gradient-subtle)',
        'gradient-card': 'var(--gradient-card)',
      },
    },
  },
}