import type { Metadata, Viewport } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ToastProvider } from "@/contexts/ToastContext";

// --- Fontes ---
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" });

// --- Configuração Mobile (Barra de status roxa) ---
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#7C3AED", 
};

// --- METADADOS OTIMIZADOS ---
export const metadata: Metadata = {
  // Substitua pela URL final do seu site no Netlify ou domínio próprio
  metadataBase: new URL('https://facillithub.com.br'), 

  title: {
    default: "Facillit Hub | Ecossistema Digital Inteligente",
    template: "%s | Facillit Hub",
  },
  
  description: "Transforme ideias em resultados reais. O Facillit Hub centraliza organização, educação e gestão em 5 verticais inteligentes: Students, Schools, Startups, Enterprise e Global.",

  keywords: [
  "Facillit Hub", "Ecossistema Digital", "Super App de Educação", "Plataforma Integrada",
  "Transformação Digital", "EdTech Brasil", "ProdTech", "Inovação Pedagógica",
  "Tecnologia Educacional", "Gestão Inteligente", "Interconectividade", "Jornada Digital",
  "Facillit Students", "Facillit Games", "Aprendizado Gamificado", "Jogos Educativos",
  "Facillit Write", "Correção de Redação com IA", "Produção Textual", "Redação ENEM",
  "Facillit Library", "Biblioteca Virtual", "Portfólio Digital do Aluno", "Acervo Digital",
  "Facillit Play", "Videoaulas", "Streaming Educacional", "Conteúdo Acadêmico",
  "Facillit Test", "Simulados Online", "Provas e Avaliações", "Autoavaliação",
  "Facillit Create", "Mapas Mentais", "Criação de Resumos", "Apresentações Escolares",
  "Estudo Personalizado", "Games Educativos 3D","Facillit Schools", "Facillit Edu", "Sistema de Gestão Escolar", "Diário Digital",
  "Gestão Pedagógica", "Planos de Aula com IA", "BNCC", "Frequência Escolar",
  "Facillit Lab", "Laboratório Virtual", "Experimentos 3D", "Aulas de STEM",
  "Simulações Científicas", "Gestão Acadêmica", "Educação 4.0", "Tecnologia em Sala de Aula","Facillit Startups", "Facillit Center", "Gestão de Negócios", "Dashboard de KPIs",
  "CRM para Startups", "Gestão Ágil", "Funil de Vendas",
  "Facillit Host", "Hospedagem Cloud", "Infraestrutura Digital", "Deploy de Aplicações",
  "Facillit API", "API Gateway", "Monetização de APIs", "Integração de Sistemas",
  "Escalabilidade de Negócios", "PaaS", "SaaS Management","Facillit Enterprise", "Facillit People", "RH Tech", "Gestão de Recursos Humanos",
  "HRIS", "Departamento Pessoal", "Gestão de Talentos", "Treinamento Corporativo",
  "Facillit Access", "Controle de Acesso", "Identidade Digital", "SSO", "Segurança Corporativa",
  "Facillit Card", "Gestão de Benefícios", "Cartão de Benefícios Flexíveis", 
  "Benefícios Corporativos", "Cultura Organizacional","Facillit Global", "Facillit Day", "Gestão de Tempo", "Organização Pessoal",
  "Planner Digital", "Controle de Hábitos", "Agenda Inteligente",
  "Facillit Finances", "Controle Financeiro Pessoal", "Gestão de Orçamento", "Finanças Pessoais",
  "Facillit C&C", "Facillit Coach", "Planejamento de Carreira", "Mentoria Profissional",
  "Marketplace de Consultoria", "Desenvolvimento Profissional", "Produtividade Diária"




  ],

  authors: [{ name: "Facillit Hub Team", url: "https://facillithub.com.br" }],
  creator: "Facillit Hub",
  publisher: "Facillit Hub Tecnologia",

  // --- COMPARTILHAMENTO (WhatsApp/Social) ---
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://facillithub.com.br",
    siteName: "Facillit Hub",
    title: "Facillit Hub | Torne a sua jornada digital mais simples e eficaz",
    description: "Uma infraestrutura digital coesa que conecta pessoas, escolas e empresas. Do plano de estudos à gestão corporativa.",
    images: [
      {
        url: "/og-image.jpg", // Recomendado criar esta imagem (1200x630)
        width: 1200,
        height: 630,
        alt: "Ecossistema Facillit Hub",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Facillit Hub | Inovação e Propósito",
    description: "O sistema operacional completo para educação e negócios.",
    images: ["/og-image.jpg"],
    creator: "@facillithub",
  },

  // --- ÍCONES (Aqui está a correção) ---
  // O Next.js mapeia a pasta 'public' para a raiz '/'.
  icons: {
    icon: "/assets/images/LOGO/isologo/preto.png",
    shortcut: "/assets/images/LOGO/isologo/preto.png",
    apple: "/assets/images/LOGO/isologo/preto.png", // O iPhone vai usar este ícone também
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
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} ${montserrat.variable} font-sans antialiased bg-[#F8F9FA] text-gray-900 selection:bg-brand-purple/20 selection:text-brand-purple`}>
        <ThemeProvider>
          <ToastProvider>
             {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}