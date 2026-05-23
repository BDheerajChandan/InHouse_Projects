/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#00D4FF', dark: '#0099BB', light: '#66E5FF' },
        accent: { DEFAULT: '#7C3AED', light: '#A855F7' },
        surface: { DEFAULT: '#0F1117', card: '#161B27', border: '#1E2536' },
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      fontFamily: {
        display: ['"Orbitron"', 'monospace'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.4s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'waveform': 'waveform 1.2s ease-in-out infinite',
      },
      keyframes: {
        glow: { '0%': { boxShadow: '0 0 5px #00D4FF44' }, '100%': { boxShadow: '0 0 20px #00D4FF88' } },
        slideUp: { from: { transform: 'translateY(20px)', opacity: 0 }, to: { transform: 'translateY(0)', opacity: 1 } },
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        waveform: { '0%,100%': { transform: 'scaleY(0.3)' }, '50%': { transform: 'scaleY(1)' } },
      },
      backdropBlur: { xs: '2px' },
    },
  },
  plugins: [],
}