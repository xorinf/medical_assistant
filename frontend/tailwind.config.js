/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Distinctive type pairing: a humanist serif for display + a clean grotesk for body.
        // Avoids the AI-default Inter / Space Grotesk trap.
        display: ['"Bricolage Grotesque"', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"Manrope"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Monochrome palette — your aesthetic constraint. Reserve colour for danger.
        ink: {
          50:  '#f6f6f4',
          100: '#ececea',
          200: '#d4d4d1',
          300: '#a9a9a5',
          400: '#6f6f6b',
          500: '#3f3f3c',
          600: '#2a2a28',
          700: '#1a1a18',
          800: '#0e0e0d',
          900: '#070706',
        },
      },
    },
  },
  plugins: [],
}
