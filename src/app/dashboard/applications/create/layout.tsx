'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Layout, Palette, Presentation, PenTool, Settings, ChevronRight } from 'lucide-react';

export default function CreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // Verifica se está dentro do editor (ex: /create/uuid-do-doc)
  const isEditor = pathname.includes('/create/') && pathname.split('/').length > 5;

  // Se estiver editando, removemos qualquer distração (layout limpo)
  if (isEditor) return <>{children}</>;

  const tabs = [
    { name: 'Meus Projetos', href: '/dashboard/applications/create', icon: Layout },
    { name: 'Modelos', href: '/dashboard/applications/create/templates', icon: Palette },
    { name: 'Apresentações', href: '/dashboard/applications/create/slides', icon: Presentation },
    { name: 'Mapas Mentais', href: '/dashboard/applications/create/mindmaps', icon: PenTool },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Topbar Específica do Create */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-purple to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-200">
              <Palette size={20} />
            </div>
            <div>
               <h1 className="font-multiara text-2xl text-gray-800 leading-none mt-1">Facillit Create</h1>
               <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Estúdio Visual</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1 bg-gray-100/50 p-1 rounded-full border border-gray-200">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <Link 
                  key={tab.name}
                  href={tab.href}
                  className={`
                    flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300
                    ${isActive 
                      ? 'bg-white text-brand-purple shadow-sm ring-1 ring-gray-200' 
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}
                  `}
                >
                  <tab.icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                  {tab.name}
                </Link>
              );
            })}
          </nav>

          <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-brand-purple transition-colors">
            <Settings size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {children}
      </main>
    </div>
  );
}