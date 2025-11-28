"use client";

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function SiteLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Lista de rotas que NÃO devem ter o Header/Footer padrão do site
  // Agora inclui '/u/' para os perfis públicos terem seu próprio header
  const isExcludedRoute = 
    pathname?.startsWith('/dashboard') || 
    pathname?.startsWith('/admin') || 
    pathname?.startsWith('/u/');

  return (
    <>
      {!isExcludedRoute && <Header />}
      <main className="flex-grow">
        {children}
      </main>
      {!isExcludedRoute && <Footer />}
    </>
  );
}