/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          900: '#080A0C',
          850: '#0B0E11',
          800: '#0F1317',
          750: '#12171C',
          700: '#161C22',
          650: '#1B222A',
          600: '#212A33',
        },
        line: {
          DEFAULT: '#222A33',
          soft: '#1A2128',
          strong: '#2E3945',
        },
        ink: {
          DEFAULT: '#E6ECF3',
          soft: '#9AA9B8',
          muted: '#68757F',
          faint: '#48535D',
        },
        accent: {
          DEFAULT: '#2D7FF9',
          hover: '#1F6BE0',
          soft: 'rgba(45, 127, 249, 0.14)',
          ring: 'rgba(45, 127, 249, 0.38)',
        },
        ok: { DEFAULT: '#2FBF71', soft: 'rgba(47, 191, 113, 0.14)' },
        warn: { DEFAULT: '#E0A33A', soft: 'rgba(224, 163, 58, 0.14)' },
        bad: { DEFAULT: '#E1555A', soft: 'rgba(225, 85, 90, 0.14)' },
        info: { DEFAULT: '#2BB6C4', soft: 'rgba(43, 182, 196, 0.14)' },
        alt: { DEFAULT: '#8B7BE8', soft: 'rgba(139, 123, 232, 0.14)' },
      },
      fontFamily: {
        sans: [
          'Inter',
          'Segoe UI Variable Text',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'Cascadia Mono',
          'Consolas',
          'SFMono-Regular',
          'Menlo',
          'monospace',
        ],
      },
      fontSize: {
        /* 11px is the primary micro-label size. A 14px line box (not the
           browser default) is what makes the dense surfaces read as tight
           research UI rather than loosely spaced marketing UI. */
        '2xs': ['0.6875rem', { lineHeight: '0.875rem' }],
      },
      spacing: {
        /* 4.5 is absent from the v3 default scale; it is the icon-box size used
           by the mobile nav trigger and a few inline affordances. */
        4.5: '1.125rem',
      },
      borderRadius: {
        DEFAULT: '0.375rem',
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.625rem',
      },
      boxShadow: {
        panel: '0 1px 2px rgba(0,0,0,0.4)',
        pop: '0 12px 32px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04)',
        focus: '0 0 0 2px rgba(8,10,12,1), 0 0 0 4px rgba(45,127,249,0.45)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.985)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'draw-check': {
          '0%': { strokeDashoffset: '32' },
          '100%': { strokeDashoffset: '0' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'spin-slow': {
          to: { transform: 'rotate(360deg)' },
        },
        scan: {
          '0%': { top: '0%', opacity: '0' },
          '8%': { opacity: '1' },
          '92%': { opacity: '1' },
          '100%': { top: '100%', opacity: '0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 160ms ease-out both',
        'slide-up': 'slide-up 200ms ease-out both',
        'scale-in': 'scale-in 150ms ease-out both',
        'draw-check': 'draw-check 480ms ease-out both',
        shimmer: 'shimmer 1.6s infinite',
        'spin-slow': 'spin-slow 1.4s linear infinite',
        scan: 'scan 2.1s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
