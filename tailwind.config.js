/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        midnight: '#07111f',
        cyan: '#56d4ff',
        violet: '#8b5cf6',
      },
      boxShadow: {
        glow: '0 24px 80px rgba(86, 212, 255, 0.25)',
      },
      backgroundImage: {
        'hero-grid': 'radial-gradient(circle at top, rgba(86,212,255,0.18), transparent 28%), linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
      },
      backgroundSize: {
        'hero-grid': 'auto, 42px 42px, 42px 42px',
      },
      animation: {
        float: 'float 7s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
