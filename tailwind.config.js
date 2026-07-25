/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",

  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        "cyber-dark": "#0a0a0c",
        "cyber-panel": "#0f0f12",

        "light-bg": "#f8fafc",
        "light-panel": "#ffffff",

        "accent-cyan": "#00E5FF",
        "accent-pink": "#FF0055",
        "accent-lime": "#00FF41",
        "accent-purple": "#D946EF",
        "accent-orange": "#FF6B35",
      },

      fontFamily: {
        mono: ["IBM Plex Mono", "Courier New", "monospace"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
    },
  },

  plugins: [],
};

// /** @type {import('tailwindcss').Config} */
// export default {
//   content: [
//     "./index.html",
//     "./src/**/*.{js,ts,jsx,tsx}",
//   ],
//   theme: {
//     extend: {
//       colors: {
//         'cyber-dark': '#0a0a0c',
//         'cyber-panel': '#0f0f12',
//         'accent-cyan': '#00E5FF',
//         'accent-pink': '#FF0055',
//         'accent-lime': '#00FF41',
//         'accent-purple': '#D946EF',
//         'accent-orange': '#FF6B35',
//       },
//       borderColor: {
//         'cyber-light': 'rgba(255, 255, 255, 0.1)',
//       },
//       fontFamily: {
//         mono: ['IBM Plex Mono', 'Courier New', 'monospace'],
//         sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
//       },
//       backgroundImage: {
//         'linear-to-r': 'linear-gradient(to right, var(--tw-gradient-stops))',
//         'linear-to-br': 'linear-gradient(to bottom right, var(--tw-gradient-stops))',
//       },
//       safelist: [
//         // Accent colors - cyan
//         'text-accent-cyan',
//         'border-accent-cyan',
//         'bg-accent-cyan/5',
//         'bg-accent-cyan/10',
//         'bg-accent-cyan/20',
//         'text-accent-cyan/60',
//         'text-accent-cyan/40',
//         'shadow-[0_0_20px_rgba(0,229,255,0.3)]',
//         'shadow-[0_0_30px_rgba(0,229,255,0.3)]',
//         // Accent colors - pink
//         'text-accent-pink',
//         'border-accent-pink',
//         'bg-accent-pink/5',
//         'bg-accent-pink/10',
//         'bg-accent-pink/20',
//         'text-accent-pink/60',
//         'text-accent-pink/40',
//         'shadow-[0_0_20px_rgba(255,0,85,0.3)]',
//         'shadow-[0_0_30px_rgba(255,0,85,0.3)]',
//         // Accent colors - lime
//         'text-accent-lime',
//         'border-accent-lime',
//         'bg-accent-lime/5',
//         'bg-accent-lime/10',
//         'bg-accent-lime/20',
//         'text-accent-lime/60',
//         'text-accent-lime/40',
//         // Accent colors - purple
//         'text-accent-purple',
//         'border-accent-purple',
//         'bg-accent-purple/5',
//         'bg-accent-purple/10',
//         'bg-accent-purple/20',
//         // Accent colors - orange
//         'text-accent-orange',
//         'border-accent-orange',
//         'bg-accent-orange/5',
//         'bg-accent-orange/10',
//         'bg-accent-orange/20',
//       ],
//     },
//   },
//   plugins: [],
// }
