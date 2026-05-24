/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c3d66',
        },
        accent: {
          cyan: '#00E5FF',
          pink: '#FF0055',
          lime: '#00FF41',
          purple: '#D946EF',
          orange: '#FF6B35',
        },
        dark: {
          50: '#f8f8f8',
          100: '#e8e8e8',
          200: '#d1d1d1',
          300: '#b4b4b4',
          400: '#909090',
          500: '#6d6d6d',
          600: '#565656',
          700: '#4a4a4a',
          800: '#3d3d3d',
          900: '#0a0a0c',
          950: '#050506',
        },
        panel: {
          bg: '#0f0f12',
          border: '#1a1a1f',
          hover: '#16161b',
        },
      },
      backgroundColor: {
        'cyber-dark': '#0a0a0c',
        'cyber-panel': '#0f0f12',
      },
      borderColor: {
        'cyber-light': 'rgba(255, 255, 255, 0.1)',
      },
      fontFamily: {
        mono: ['IBM Plex Mono', 'Courier New', 'monospace'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      backgroundImage: {
        'linear-to-r': 'linear-gradient(to right, var(--tw-gradient-stops))',
        'linear-to-br': 'linear-gradient(to bottom right, var(--tw-gradient-stops))',
      },
      safelist: [
        // Accent colors - cyan
        'text-accent-cyan',
        'border-accent-cyan',
        'bg-accent-cyan/5',
        'bg-accent-cyan/10',
        'bg-accent-cyan/20',
        'text-accent-cyan/60',
        'text-accent-cyan/40',
        'shadow-[0_0_20px_rgba(0,229,255,0.3)]',
        'shadow-[0_0_30px_rgba(0,229,255,0.3)]',
        // Accent colors - pink
        'text-accent-pink',
        'border-accent-pink',
        'bg-accent-pink/5',
        'bg-accent-pink/10',
        'bg-accent-pink/20',
        'text-accent-pink/60',
        'text-accent-pink/40',
        'shadow-[0_0_20px_rgba(255,0,85,0.3)]',
        'shadow-[0_0_30px_rgba(255,0,85,0.3)]',
        // Accent colors - lime
        'text-accent-lime',
        'border-accent-lime',
        'bg-accent-lime/5',
        'bg-accent-lime/10',
        'bg-accent-lime/20',
        'text-accent-lime/60',
        'text-accent-lime/40',
        // Accent colors - purple
        'text-accent-purple',
        'border-accent-purple',
        'bg-accent-purple/5',
        'bg-accent-purple/10',
        'bg-accent-purple/20',
        // Accent colors - orange
        'text-accent-orange',
        'border-accent-orange',
        'bg-accent-orange/5',
        'bg-accent-orange/10',
        'bg-accent-orange/20',
      ],
    },
  },
  plugins: [],
}
