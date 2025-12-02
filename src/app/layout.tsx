import type { Metadata, Viewport } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ToastProvider } from "@/contexts/ToastContext";
import Script from "next/script"; // Essencial para o Analytics e SEO

// --- Fontes ---
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" });

// --- Configuração Mobile ---
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#7C3AED",
};

// URL base (Use variável de ambiente ou o domínio fixo)
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://facillithub.com.br';

// --- METADADOS OTIMIZADOS ---
export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),

  title: {
    default: "Facillit Hub | Ecossistema Digital Inteligente",
    template: "%s | Facillit Hub",
  },
  
  description: "Transforme ideias em resultados reais. O Facillit Hub centraliza organização, educação e gestão em 5 verticais inteligentes: Students, Schools, Startups, Enterprise e Global.",

  keywords: [
    "Facillit Hub", "FacillitHub", "Hub Educacional",
    "Ecossistema Digital", "Super App de Educação", "Plataforma Integrada",
    "Transformação Digital", "EdTech Brasil", "ProdTech",
    "Facillit Students", "Facillit Schools", "Facillit Startups",
    "Facillit Enterprise", "Facillit Global", "Gestão Escolar",
    "Facillit Write", "Facillit Play", "Facillit Test"
  ],

  authors: [{ name: "Facillit Hub Team", url: baseUrl }],
  creator: "Facillit Hub",
  publisher: "Facillit Hub Tecnologia",

  // --- COMPARTILHAMENTO (WhatsApp/Social) ---
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: baseUrl,
    siteName: "Facillit Hub",
    title: "Facillit Hub | Ecossistema Digital Inteligente",
    description: "Uma infraestrutura digital coesa que conecta pessoas, escolas e empresas.",
    images: [
      {
        url: "/assets/images/LOGO/isologo/preto.png", // Sua logo oficial
        width: 800,
        height: 800,
        alt: "Logo Facillit Hub",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Facillit Hub | Inovação e Propósito",
    description: "O sistema operacional completo para educação e negócios.",
    images: ["/assets/images/LOGO/isologo/preto.png"],
    creator: "@facillithub",
  },

  // --- ÍCONES (Aba do navegador) ---
  icons: {
    icon: "/assets/images/LOGO/isologo/preto.png",
    shortcut: "/assets/images/LOGO/isologo/preto.png",
    apple: "/assets/images/LOGO/isologo/preto.png",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  // JSON-LD: Diz ao Google quem é a empresa e qual é a logo
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Facillit Hub",
    "alternateName": "FacillitHub",
    "url": baseUrl,
    "logo": `${baseUrl}/assets/images/LOGO/isologo/preto.png`,
    "description": "Ecossistema digital inteligente para educação e gestão.",
    "sameAs": [
      "https://www.instagram.com/facillithub",
      "https://www.linkedin.com/company/facillithub"
    ]
  };

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} ${montserrat.variable} font-sans antialiased bg-[#F8F9FA] text-gray-900 selection:bg-brand-purple/20 selection:text-brand-purple`}>
        
        {/* --- 1. Script do Google Analytics (Carrega a biblioteca) --- */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-5Z0EL4MRMM"
        />

        {/* --- 2. Configuração do Google Analytics (Seu ID) --- */}
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-5Z0EL4MRMM');
          `}
        </Script>

        {/* --- 3. Script JSON-LD (SEO da Marca) --- */}
        <Script
          id="json-ld-organization"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <ThemeProvider>
          <ToastProvider>
             {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}