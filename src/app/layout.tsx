import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider';
import CookieConsent from '@/components/CookieConsent';
import { ToastProvider } from '@/contexts/ToastContext'; // 1. Importar o Provider

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
      <body className="font-inter bg-background-light text-dark-text">
        <ThemeProvider>
          {/* 2. Envolver a aplicação com o ToastProvider */}
          <ToastProvider>
            {children}
            <CookieConsent />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}