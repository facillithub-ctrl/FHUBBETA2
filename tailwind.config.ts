import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class', 
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Cores da marca
        'brand-purple': '#42047e',
        'brand-green': '#07f49e',
        'brand-dark': '#0f0f11',
        'brand-light': '#f3f4f6',
        
        // Cores de compatibilidade e Editor
        'royal-blue': '#42047e', 
        'dark-text': '#111114',
        'white-text': '#f8f9fa',
        'background-light': '#f3f4f6',
        'text-muted': '#6b7280',
        'dark-background': '#111114',
        'dark-card': '#1A1A1D',
        'dark-border': '#2c2c31',
        'paper': '#fdfbf7', // Cor de papel creme suave
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        // CORREÇÃO: Referência direta aos nomes definidos no @font-face do globals.css
        'multiara': ['Multiara', 'cursive'],
        'dk-lemons': ['Dk Lemons', 'sans-serif'],
        'letters': ['Letters For Learners', 'sans-serif'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #42047e 0%, #07f49e 100%)',
        'brand-gradient-hover': 'linear-gradient(135deg, #360366 0%, #05d68a 100%)',
      },
      animation: {
        'fade-in-right': 'fade-in-right 0.5s ease-out forwards',
      },
      keyframes: {
        'fade-in-right': {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
export default config