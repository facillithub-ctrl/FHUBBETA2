"use client";

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function SiteLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Lista de prefixos onde o Header/Footer NÃO devem aparecer
  // Verifica se a rota começa com /dashboard ou /admin
  const isDashboard = pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin');

  return (
    <>
      {!isDashboard && <Header />}
      <main className="flex-grow">
        {children}
      </main>
      {!isDashboard && <Footer />}
    </>
  );
}