import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // Habilitar modo escuro pela classe 'dark' para controle manual/sistema
  darkMode: 'class', 
  theme: {
    extend: {
      colors: {
        // Cores da Nova Identidade
        'brand-purple': '#42047e', // Roxo Profundo
        'brand-green': '#07f49e',  // Verde Neon
        'brand-dark': '#0a0a0b',   // Quase preto para fundos escuros
        'brand-light': '#f8f9fa',  // Branco sujo para fundos claros
        
        // Mantendo compatibilidade com código legado se necessário, ou substituindo gradualmente
        'royal-blue': '#42047e', // Redefinindo para o novo roxo para manter consistência se usado
        'lavender-blue': '#7a3ce3', // Um tom mais claro do roxo para acentos
        
        'dark-text': '#111114',
        'text-muted': '#6b7280',
        'dark-card': '#1A1A1D',
        'dark-border': '#2c2c31',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #42047e 0%, #07f49e 100%)',
        'brand-gradient-hover': 'linear-gradient(135deg, #350366 0%, #05c982 100%)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'fade-in-right': {
            '0%': { opacity: '0', transform: 'translateX(20px)' },
            '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.8s ease-out forwards',
        'fade-in-right': 'fade-in-right 0.5s ease-out forwards',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
export default config