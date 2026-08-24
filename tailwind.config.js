/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        luxury: {
          950: '#070708',
          900: '#0f0f12',
          850: '#15151a',
          800: '#1b1b22',
          700: '#282832',
          600: '#3d3d4b',
          500: '#5c5c6e',
          400: '#8b8b9e',
          300: '#b8b8c7',
          200: '#dedee6',
          100: '#f0eff4',
          50: '#f9f9fb',
        },
        gold: {
          DEFAULT: '#C5A880',
          50: '#FBF8F3',
          100: '#F5EFE4',
          200: '#EADEC9',
          300: '#DEC9A8',
          400: '#D2B68B',
          500: '#C5A880',
          600: '#B08F60',
          700: '#8D6E42',
          800: '#69512E',
          900: '#47361D',
          hover: '#d4b791',
        },
        bronze: {
          500: '#8c6d46',
          600: '#735735',
        },
        champagne: '#E8D8C3',
        ebony: '#0A0A0B',
        onyx: '#121214',
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Playfair Display', 'Cinzel', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      letterSpacing: {
        widest: '.2em',
        ultra: '.28em',
      },
      boxShadow: {
        'luxury': '0 20px 40px -15px rgba(0, 0, 0, 0.7)',
        'luxury-glow': '0 0 25px -5px rgba(197, 168, 128, 0.25)',
        'card-subtle': '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
      },
      backgroundImage: {
        'radial-gradient': 'radial-gradient(circle at center, var(--tw-gradient-stops))',
        'subtle-grain': 'linear-gradient(to bottom, rgba(20,20,24,0.8), rgba(10,10,12,0.95))',
      },
    },
  },
  plugins: [],
};
