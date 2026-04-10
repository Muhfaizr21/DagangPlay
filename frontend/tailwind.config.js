/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dp: {
          bg: '#080A10', // Deep Abyssal Navy
          surface: '#111520', // Slightly lighter elevated panel
          border: 'rgba(255,255,255,0.06)',
          primary: '#00D8FF', // Neon Cyan
          secondary: '#7B2CBF', // Vibrant Purple
          accent: '#FF3366', // Danger Neon / Flash Sale
          gold: '#FACC15', // Premium Gold
          muted: '#8A94A6',
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        display: ['var(--font-poppins)', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-glow': 'pulseGlow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', filter: 'blur(10px)' },
          '50%': { opacity: '1', filter: 'blur(16px)' },
        }
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(0, 216, 255, 0.4)',
        'glow-secondary': '0 0 20px rgba(123, 44, 191, 0.4)',
        'glow-accent': '0 0 20px rgba(255, 51, 102, 0.4)',
      }
    },
  },
  plugins: [],
}
