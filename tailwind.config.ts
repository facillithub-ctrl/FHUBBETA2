import type { Config } from 'tailwindcss'

const config: Config = {
  // 1. Reativamos o modo escuro. 
  // O 'class' permite-nos controlá-lo via JavaScript (com o ThemeProvider)
  darkMode: 'class', 
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // 2. Definimos a fonte 'Inter' como padrão, conforme o seu pedido.
      fontFamily: {
        // O 'globals.css' já está a importar a fonte 'Inter', por isso isto vai funcionar.
        inter: ['Inter', 'sans-serif'],
      },
      // 3. Adicionamos a nova paleta de cores.
      colors: {
        // Cores primárias da marca
        'brand-purple': '#42047E',
        'brand-green': '#07F49E',

        // Cores de Texto (para modo claro e escuro)
        'text-primary': 'rgb(var(--text-primary) / <alpha-value>)', // Preto no claro, Branco no escuro
        'text-secondary': 'rgb(var(--text-secondary) / <alpha-value>)', // Cinzento escuro no claro, Cinzento claro no escuro

        // Cores de Fundo (para modo claro e escuro)
        'bg-primary': 'rgb(var(--bg-primary) / <alpha-value>)', // Branco no claro, Preto no escuro
        'bg-secondary': 'rgb(var(--bg-secondary) / <alpha-value>)', // Cinzento claro no claro, Cinzento escuro no escuro
        
        // Cores antigas (para referência, se necessário, mas devemos substituí-las)
        'royal-blue': '#2e14ed',
        'dark-purple-blue': '#190894',
        'lavender-blue': '#5e55f9',
        
        // As cores neutras do Tailwind (gray, zinc, etc.) continuam disponíveis.
      },
      // 4. Mantemos as suas animações
      keyframes: {
        'fade-in-right': {
          '0%': {
            opacity: '0',
            transform: 'translateX(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
      },
      animation: {
        'fade-in-right': 'fade-in-right 0.5s ease-out forwards',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
export default config