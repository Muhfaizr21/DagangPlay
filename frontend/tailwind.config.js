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
        navy: {
          deep: '#020818',
          dark: '#050f24',
          mid: '#0a1735',
          light: '#0f2147',
        },
        gold: '#C9A84C',
        'gold-light': '#E8C96A',
        cyan: '#38D9F5',
        mint: '#00E5A0',
      },
      fontFamily: {
        poppins: ['var(--font-poppins)', 'sans-serif'],
        inter: ['var(--font-inter)', 'sans-serif'],
        heading: ['var(--font-poppins)', 'sans-serif'],
        body: ['var(--font-inter)', 'sans-serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-gold': 'linear-gradient(135deg, #C9A84C 0%, #E8C96A 50%, #38D9F5 100%)',
        'gradient-cyan': 'linear-gradient(135deg, #38D9F5 0%, #00E5A0 100%)',
        'shimmer-mint': 'linear-gradient(90deg, #00E5A0 0%, #00ffb3 40%, #00E5A0 60%, #00c47a 100%)',
        'shimmer-gold': 'linear-gradient(90deg, #C9A84C 0%, #E8C96A 40%, #C9A84C 60%, #b8922a 100%)',
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        float2: 'float2 3.5s ease-in-out infinite',
        float3: 'float3 5s ease-in-out infinite',
        shimmer: 'shimmer 1.5s linear infinite',
        'fade-up': 'fadeUp 0.7s ease forwards',
        twinkle: 'twinkle 3s ease infinite',
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        float2: { '0%,100%': { transform: 'translateY(-5px)' }, '50%': { transform: 'translateY(8px)' } },
        float3: { '0%,100%': { transform: 'translateY(4px)' }, '50%': { transform: 'translateY(-12px)' } },
        shimmer: { '0%': { backgroundPosition: '-200% center' }, '100%': { backgroundPosition: '200% center' } },
        fadeUp: { from: { opacity: '0', transform: 'translateY(40px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        twinkle: { '0%,100%': { opacity: '.2' }, '50%': { opacity: '1' } },
      },
      dropShadow: {
        gold: '0 0 20px rgba(201,168,76,0.5)',
        cyan: '0 0 20px rgba(56,217,245,0.5)',
        mint: '0 0 20px rgba(0,229,160,0.5)',
      },
      boxShadow: {
        gold: '0 0 20px rgba(201,168,76,0.4), 0 0 60px rgba(201,168,76,0.15)',
        cyan: '0 0 20px rgba(56,217,245,0.4), 0 0 60px rgba(56,217,245,0.15)',
        mint: '0 0 20px rgba(0,229,160,0.4), 0 0 60px rgba(0,229,160,0.15)',
      },
    },
  },
  plugins: [],
}
