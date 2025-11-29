'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Layout, FileText, Star, Settings } from 'lucide-react';

export default function CreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isEditor = pathname.includes('/create/') && pathname.split('/').length > 5;

  // Se estiver no editor, mostramos tela cheia sem as abas de navegação do dashboard
  if (isEditor) return <>{children}</>;

  const tabs = [
    { name: 'Meus Projetos', href: '/dashboard/applications/create', icon: Layout },
    { name: 'Modelos', href: '/dashboard/applications/create/templates', icon: FileText },
    { name: 'Favoritos', href: '/dashboard/applications/create/favorites', icon: Star },
    { name: 'Configurações', href: '/dashboard/applications/create/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Barra de Navegação Superior (Abas) */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-purple rounded-lg flex items-center justify-center text-white font-multiara text-xl">
              C
            </div>
            <span className="font-multiara text-2xl text-gray-800">Facillit Create</span>
          </div>
          
          <nav className="flex gap-1">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <Link 
                  key={tab.name}
                  href={tab.href}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
                    ${isActive 
                      ? 'bg-purple-100 text-brand-purple' 
                      : 'text-gray-600 hover:bg-gray-100'}
                  `}
                >
                  <tab.icon size={16} />
                  {tab.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full p-8">
        {children}
      </main>
    </div>
  );
}