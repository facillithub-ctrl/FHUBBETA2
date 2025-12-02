import type { Metadata, Viewport } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ToastProvider } from "@/contexts/ToastContext";
import Script from "next/script";

// --- Fontes ---
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" });

// --- Configuração Mobile (Barra de status roxa) ---
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#7C3AED",
};

// --- URL Base (Importante para as imagens funcionarem) ---
// Se estiver rodando local, use http://localhost:3000, senão o domínio final
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://facillithub.com.br";

// --- METADADOS OTIMIZADOS ---
export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),

  title: {
    default: "Facillit Hub | Ecossistema Digital Inteligente",
    template: "%s | Facillit Hub",
  },

  description:
    "Transforme ideias em resultados reais. O Facillit Hub centraliza organização, educação e gestão em 5 verticais inteligentes: Students, Schools, Startups, Enterprise e Global.",

  keywords: [
    "Facillit Hub", // Termo principal separado
    "FacillitHub",  // Termo junto (prevenção)
    "Facillit",
    "Ecossistema Digital",
    "Super App de Educação",
    "Plataforma Integrada",
    "Transformação Digital",
    "EdTech Brasil",
    "ProdTech",
    "Inovação Pedagógica",
    "Tecnologia Educacional",
    "Gestão Inteligente",
    "Interconectividade",
    "Jornada Digital",
    "Facillit Students",
    "Facillit Games",
    "Facillit Write",
    "Facillit Library",
    "Facillit Play",
    "Facillit Test",
    "Facillit Create",
    "Facillit Schools",
    "Facillit Edu",
    "Facillit Lab",
    "Facillit Startups",
    "Facillit Center",
    "Facillit Host",
    "Facillit API",
    "Facillit Enterprise",
    "Facillit People",
    "Facillit Access",
    "Facillit Card",
    "Facillit Global",
    "Facillit Day",
    "Facillit Finances",
    "Facillit C&C",
    "Facillit Coach",
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
    description:
      "Conecte-se ao futuro com o Facillit Hub. Uma infraestrutura digital completa para educação, gestão e negócios.",
    images: [
      {
        url: "/assets/images/LOGO/isologo/preto.png", // Sua logo configurada aqui
        width: 800, // Ajuste conforme a resolução real da sua imagem se souber
        height: 800,
        alt: "Logo Facillit Hub",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Facillit Hub | Inovação e Propósito",
    description: "O sistema operacional completo para educação e negócios.",
    images: ["/assets/images/LOGO/isologo/preto.png"], // Logo no Twitter também
    creator: "@facillithub",
  },

  // --- ÍCONES (Navegador e Google Mobile) ---
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
  // Dados Estruturados para o Google entender sua Marca (Organization Schema)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Facillit Hub",
    "url": baseUrl,
    "logo": `${baseUrl}/assets/images/LOGO/isologo/preto.png`,
    "description": "Ecossistema digital inteligente para educação e gestão.",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "", // Adicione se tiver um telefone público
      "contactType": "customer service"
    }
    // Se tiver redes sociais, adicione aqui:
    // "sameAs": [
    //   "https://www.instagram.com/facillithub",
    //   "https://www.linkedin.com/company/facillithub"
    // ]
  };

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${montserrat.variable} font-sans antialiased bg-[#F8F9FA] text-gray-900 selection:bg-brand-purple/20 selection:text-brand-purple`}
      >
        {/* Script JSON-LD para SEO Avançado */}
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        
        <ThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}