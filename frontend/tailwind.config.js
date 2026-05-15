/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-base': '#0C0C0E',
        'bg-surface': '#141416',
        'bg-elevated': '#1C1C20',
        'bg-subtle': '#242428',
        'accent': '#F5A623',
        'accent-dim': '#C4841A',
        'text-primary': '#F0EDE8',
        'text-secondary': '#9A9690',
        'text-muted': '#5C5955',
        'border-default': '#2A2A2E',
        'border-subtle': '#1E1E22',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
