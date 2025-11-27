import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider';
import CookieConsent from '@/components/CookieConsent';
import { ToastProvider } from '@/contexts/ToastContext';
import Header from '@/components/Header'; // Importar Header
import Footer from '@/components/Footer'; // Importar Footer

export const metadata: Metadata = {
  title: 'Facillit HUB',
  description: 'Facillit Hub é um ecossistema digital integrado que unifica educação, produtividade e bem-estar.',
  icons: {
    icon: '/assets/images/LOGO/png/logoazul.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-br" style={{ scrollBehavior: 'smooth' }} suppressHydrationWarning>
      <body className="font-inter bg-background-light text-dark-text flex flex-col min-h-screen">
        <ThemeProvider>
          <ToastProvider>
            {/* O Header fica fixo ou no topo */}
            <Header /> 
            
            {/* Main grow garante que o footer fique no final mesmo com pouco conteúdo */}
            <main className="flex-grow">
              {children}
            </main>

            {/* Footer no final de tudo */}
            <Footer />
            
            <CookieConsent />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}