/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: '#070504',
          elev: '#120e0b',
          soft: '#1a1410',
          velvet: '#1c1014',
        },
        ink: {
          DEFAULT: '#f3e6d0',
          muted: '#c4b090',
          faint: '#8a7a62',
        },
        accent: {
          DEFAULT: '#d4a056',
          soft: '#e8c48a',
          deep: '#a66f2e',
          brass: '#c9a227',
          glow: 'rgba(212, 160, 86, 0.28)',
        },
        wood: {
          DEFAULT: '#2a1a12',
          edge: '#3d2818',
        },
        glass: {
          border: 'rgba(212, 160, 86, 0.18)',
          fill: 'rgba(26, 16, 12, 0.72)',
          hover: 'rgba(42, 26, 18, 0.85)',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"Fraunces"', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft: '0 4px 24px -4px rgba(0,0,0,0.65), 0 0 0 1px rgba(212,160,86,0.08)',
        glow: '0 0 48px -10px rgba(212, 160, 86, 0.4)',
        card:
          '0 12px 40px -12px rgba(0,0,0,0.75), inset 0 1px 0 rgba(232,196,138,0.08), 0 0 0 1px rgba(212,160,86,0.1)',
        lamp: '0 0 80px 20px rgba(212,160,86,0.08)',
      },
      backgroundImage: {
        'speakeasy':
          'radial-gradient(ellipse 90% 55% at 50% -10%, rgba(212,160,86,0.16), transparent 55%), radial-gradient(ellipse 60% 40% at 15% 90%, rgba(90,30,40,0.22), transparent 50%), radial-gradient(ellipse 50% 35% at 85% 70%, rgba(42,26,18,0.5), transparent 45%)',
        'vignette':
          'radial-gradient(ellipse 70% 70% at 50% 45%, transparent 35%, rgba(0,0,0,0.72) 100%)',
      },
      animation: {
        'fade-up': 'fadeUp 0.45s ease-out both',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'lamp-flicker': 'lampFlicker 4.5s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.45' },
          '50%': { opacity: '0.85' },
        },
        lampFlicker: {
          '0%, 100%': { opacity: '0.55' },
          '40%': { opacity: '0.75' },
          '60%': { opacity: '0.5' },
          '80%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
}
