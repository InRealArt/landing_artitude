import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#131313',
        card: '#1d1c1c',
        gold: '#b89c72',
        canvas: '#ffffff',
        inkBlack: '#000000',
        softGray: '#f8f8f8',
        borderLight: '#eeeeee',
        grayText: '#666666',
        purple: '#6052ff',
      },
      fontFamily: {
        serif: ['var(--font-cormorant)', 'serif'],
        sans: ['var(--font-montserrat)', 'sans-serif'],
        display: ['var(--font-unbounded)', 'sans-serif'],
      },
      letterSpacing: {
        widest2: '0.3em',
        widest3: '0.4em',
      },
    },
  },
  plugins: [],
}

export default config
