/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: '#0a0a0b',
          elev: '#121216',
          soft: '#1a1a22',
        },
        ink: {
          DEFAULT: '#f4f0ea',
          muted: '#a39e96',
          faint: '#6b6660',
        },
        accent: {
          DEFAULT: '#e8a87c',
          soft: '#f0c9a8',
          deep: '#c4784a',
          glow: 'rgba(232, 168, 124, 0.25)',
        },
        glass: {
          border: 'rgba(255, 255, 255, 0.08)',
          fill: 'rgba(255, 255, 255, 0.04)',
          hover: 'rgba(255, 255, 255, 0.07)',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"Fraunces"', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft: '0 4px 24px -4px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.04)',
        glow: '0 0 40px -8px rgba(232, 168, 124, 0.35)',
        card: '0 8px 32px -8px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)',
      },
      backgroundImage: {
        'radial-glow':
          'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(232,168,124,0.18), transparent)',
        'mesh':
          'radial-gradient(at 20% 20%, rgba(196,120,74,0.12) 0px, transparent 50%), radial-gradient(at 80% 10%, rgba(120,90,180,0.08) 0px, transparent 45%), radial-gradient(at 50% 80%, rgba(232,168,124,0.06) 0px, transparent 50%)',
      },
      animation: {
        'fade-up': 'fadeUp 0.45s ease-out both',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
