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
        'eaa-blue': '#003366',
        'eaa-yellow': '#FFD700',
        'eaa-light-blue': '#0066CC',
      },
      fontFamily: {
        // Display serif for hero overlays (loaded in app/layout.tsx).
        display: ['var(--font-cormorant)', 'Cormorant', 'Georgia', 'Times New Roman', 'serif'],
      },
    },
  },
  plugins: [],
}
export default config

