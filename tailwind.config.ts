import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: '#9b4dff',
        accent: '#7c3aed',
        backdrop: '#02030a',
        surface: 'rgba(255,255,255,0.06)',
      },
      boxShadow: {
        glow: '0 0 60px rgba(156, 16, 243, 0.22)',
        soft: '0 20px 80px rgba(0,0,0,0.28)',
      },
      backgroundImage: {
        'hero-radial': 'radial-gradient(circle at top, rgba(155,77,255,0.18), transparent 42%), radial-gradient(circle at 80% 18%, rgba(56,189,248,0.12), transparent 24%)',
      },
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
