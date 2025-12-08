import React from 'react';
import Link from 'next/link';
import { User, Bell, Search, Menu } from 'lucide-react'; // Certifique-se de ter lucide-react instalado

export default function GlobalHubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* --- Global Navbar (Exclusiva deste Hub) --- */}
      <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Lado Esquerdo: Logo e Menu Mobile */}
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 text-neutral-600 hover:bg-neutral-100 rounded-full">
              <Menu size={20} />
            </button>
            <Link href="/global" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                G
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 hidden sm:block">
                Global Hub
              </span>
            </Link>
          </div>

          {/* Centro: Barra de Busca (Estilo Social) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
              <input 
                type="text"
                placeholder="Pesquisar histórias, pessoas ou tópicos..."
                className="w-full pl-10 pr-4 py-2 bg-neutral-100 border-transparent focus:bg-white focus:border-blue-500 rounded-full transition-all outline-none text-sm"
              />
            </div>
          </div>

          {/* Lado Direito: Ações */}
          <div className="flex items-center gap-3">
            <button className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-full relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            
            <div className="h-6 w-px bg-neutral-200 mx-1"></div>
            
            {/* Botão para Trocar de Hub */}
            <Link 
              href="/selection"
              className="text-xs font-medium text-neutral-500 hover:text-blue-600 px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors"
            >
              Trocar Hub
            </Link>

            <button className="w-9 h-9 rounded-full bg-neutral-200 overflow-hidden border border-neutral-300">
               {/* Placeholder para Avatar do Usuário */}
               <User className="w-full h-full p-1 text-neutral-500" />
            </button>
          </div>
        </div>
      </header>

      {/* --- Conteúdo Principal --- */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}